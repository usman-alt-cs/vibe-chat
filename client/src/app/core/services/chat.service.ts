import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Message, Conversation } from '../../shared/interfaces/message.interface';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private sb          = inject(SupabaseService);
  private authService = inject(AuthService);

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public  messages$ = this.messagesSubject.asObservable();

  private channel: RealtimeChannel | null = null;

  // ── Fetch all messages in a conversation ─────────────────────────────
  async getMessages(otherUserId: string): Promise<Message[]> {
    const myId = this.authService.getCurrentUser()?.id;
    if (!myId) return [];

    try {
      const { data, error } = await this.sb.client
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at, is_read, message_type')
        .or(
          `and(sender_id.eq.${myId},receiver_id.eq.${otherUserId}),` +
          `and(sender_id.eq.${otherUserId},receiver_id.eq.${myId})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        return [];
      }

      // Normalise: expose content as `message` to match existing UI bindings
      const msgs = (data ?? []).map(row => this.normalise(row));
      this.messagesSubject.next(msgs);
      return msgs;
    } catch (err) {
      console.error('Network or Supabase fetch failed:', err);
      return [];
    }
  }

  // ── Send a message ────────────────────────────────────────────────────
  async sendMessage(receiverId: string, content: string): Promise<Message> {
    const senderId = this.authService.getCurrentUser()?.id;
    if (!senderId) throw new Error('Not authenticated');

    try {
      const { data, error } = await this.sb.client
        .from('messages')
        .insert({ sender_id: senderId, receiver_id: receiverId, content })
        .select('id, sender_id, receiver_id, content, created_at, is_read, message_type')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      if (!data) throw new Error('Send failed');

      const msg = this.normalise(data);
      // Optimistically push to stream
      this.messagesSubject.next([...this.messagesSubject.value, msg]);
      return msg;
    } catch (err) {
      console.error('Network or Supabase fetch failed:', err);
      throw err;
    }
  }

  // ── Recent conversations (client-side grouping) ───────────────────────
  async getConversations(): Promise<Conversation[]> {
    const myId = this.authService.getCurrentUser()?.id;
    if (!myId) return [];

    try {
      // Fetch most recent 200 messages involving current user
      const { data: msgs, error } = await this.sb.client
        .from('messages')
        .select('id, sender_id, receiver_id, content, created_at')
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Supabase error:', error);
        return [];
      }
      if (!msgs?.length) return [];

      // Group by the OTHER party; keep only the newest message per thread
      const seen = new Map<string, any>();
      for (const m of msgs) {
        const otherId = m.sender_id === myId ? m.receiver_id : m.sender_id;
        if (!seen.has(otherId)) seen.set(otherId, m);
      }

      // Fetch profiles for all other parties
      const otherIds = [...seen.keys()];
      const { data: profiles, error: pErr } = await this.sb.client
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', otherIds);

      if (pErr) {
        console.error('Supabase error:', pErr);
        return [];
      }
      if (!profiles) return [];

      const profileMap = new Map(profiles.map((p: any) => [p.id, p]));

      const conversations: Conversation[] = [];
      for (const [otherId, lastMsg] of seen.entries()) {
        const profile = profileMap.get(otherId);
        if (!profile) continue;
        conversations.push({
          other_user_id: otherId,
          name:          profile.full_name,
          username:      profile.username,
          avatar_url:    profile.avatar_url ?? undefined,
          message:       lastMsg.content,
          created_at:    lastMsg.created_at,
          sender_id:     lastMsg.sender_id,
        });
      }

      // Sort newest-first
      return conversations.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (err) {
      console.error('Network or Supabase fetch failed:', err);
      return [];
    }
  }

  // ── Realtime: subscribe to new messages in a conversation ────────────
  subscribeToMessages(otherUserId: string, onNew: (msg: Message) => void): void {
    const myId = this.authService.getCurrentUser()?.id;
    if (!myId) return;

    this.unsubscribeFromMessages(); // remove previous channel

    this.channel = this.sb.client
      .channel(`chat:${[myId, otherUserId].sort().join(':')}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
          const row = payload.new as any;
          if (
            (row.sender_id === myId   && row.receiver_id === otherUserId) ||
            (row.sender_id === otherUserId && row.receiver_id === myId)
          ) {
            const msg = this.normalise(row);
            // Only push if not already in stream (avoid duplicate from optimistic update)
            const current = this.messagesSubject.value;
            if (!current.find(m => m.id === msg.id)) {
              this.messagesSubject.next([...current, msg]);
            }
            onNew(msg);
          }
        }
      )
      .subscribe();
  }

  unsubscribeFromMessages(): void {
    if (this.channel) {
      this.sb.client.removeChannel(this.channel);
      this.channel = null;
    }
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }

  // ── Kept for compatibility: start/stopPolling are now no-ops ─────────
  /** @deprecated Replaced by subscribeToMessages — kept for compile compatibility. */
  startPolling(_userId: any): void {}
  /** @deprecated Replaced by unsubscribeFromMessages — kept for compile compatibility. */
  stopPolling(): void { this.unsubscribeFromMessages(); }

  // ── Internal normaliser: content column → message field ───────────────
  private normalise(row: any): Message {
    return {
      id:           row.id,
      sender_id:    row.sender_id,
      receiver_id:  row.receiver_id,
      message:      row.content ?? row.message ?? '',
      content:      row.content,
      created_at:   row.created_at,
      is_read:      row.is_read,
      message_type: row.message_type,
    };
  }
}
