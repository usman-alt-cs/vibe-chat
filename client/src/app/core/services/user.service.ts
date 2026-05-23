import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { User, Profile, profileToUser } from '../../shared/interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  private sb          = inject(SupabaseService);
  private authService = inject(AuthService);

  // ── Search users ─────────────────────────────────────────────────────
  async searchUsers(query: string): Promise<User[]> {
    const currentId = this.authService.getCurrentUser()?.id;
    const term = query.trim();
    if (!term) return [];

    try {
      let q = this.sb.client
        .from('profiles')
        .select('id, email, username, full_name, phone_number, avatar_url')
        .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`)
        .limit(20);

      if (currentId) {
        q = q.neq('id', currentId);
      }

      const { data, error } = await q;
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return (data as Profile[]).map(profileToUser);
    } catch (err) {
      console.error('Network or Supabase fetch failed:', err);
      throw err;
    }
  }

  // ── Get a single user by UUID ─────────────────────────────────────────
  async getUserById(id: string): Promise<User> {
    try {
      const { data, error } = await this.sb.client
        .from('profiles')
        .select('id, email, username, full_name, phone_number, avatar_url, created_at')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      if (!data) throw new Error('User not found');
      return profileToUser(data as Profile);
    } catch (err) {
      console.error('Network or Supabase fetch failed:', err);
      throw err;
    }
  }

  // ── Get current user's full profile ──────────────────────────────────
  async getCurrentProfile(): Promise<Profile | null> {
    const id = this.authService.getCurrentUser()?.id;
    if (!id) return null;

    try {
      const { data, error } = await this.sb.client
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Network or Supabase fetch failed:', err);
      return null;
    }
  }

  // ── Update profile ────────────────────────────────────────────────────
  async updateProfile(patch: {
    full_name?:    string;
    username?:     string;
    phone_number?: string;
    avatar_url?:   string;
  }): Promise<User> {
    const id = this.authService.getCurrentUser()?.id;
    if (!id) throw new Error('Not authenticated');

    try {
      const { data, error } = await this.sb.client
        .from('profiles')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, email, username, full_name, phone_number, avatar_url, created_at')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      if (!data) throw new Error('Update failed');
      const user = profileToUser(data as Profile);
      this.authService.updateCurrentUser(user);
      return user;
    } catch (err) {
      console.error('Network or Supabase fetch failed:', err);
      throw err;
    }
  }

  // ── Change password (delegates to Supabase Auth) ──────────────────────
  async changePassword(newPassword: string): Promise<void> {
    const { error } = await this.sb.client.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  }
}
