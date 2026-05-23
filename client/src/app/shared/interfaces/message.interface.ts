// ─── Single message row (matches public.messages table) ──────────────────
export interface Message {
  id: string;           // UUID
  sender_id: string;    // UUID
  receiver_id: string;  // UUID
  message: string;      // mapped from `content` column
  content?: string;     // raw column value
  created_at: string;
  is_read?: boolean;
  message_type?: string;
}

// ─── Conversation summary (built client-side from messages) ──────────────
export interface Conversation {
  other_user_id: string;  // UUID
  name: string;
  username: string;
  message: string;        // last message preview
  created_at: string;
  sender_id: string;
  avatar_url?: string;
}
