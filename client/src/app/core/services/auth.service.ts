import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User, Profile, profileToUser } from '../../shared/interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb     = inject(SupabaseService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Restore user from cached session on startup
    this.sb.session$.subscribe(async session => {
      if (session?.user) {
        await this.loadProfile(session.user.id);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  // ── Sign Up ──────────────────────────────────────────────────────────
  async signup(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<void> {
    const { data: authData, error: signUpError } =
      await this.sb.client.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            username: data.username,
          },
        },
      });

    if (signUpError) {
      console.error('Supabase signup error:', signUpError);
      throw signUpError;
    }
  }

  // ── Login ────────────────────────────────────────────────────────────
  async login(credentials: { email: string; password: string }): Promise<void> {
    const { data, error } = await this.sb.client.auth.signInWithPassword({
      email:    credentials.email,
      password: credentials.password,
    });
    if (error) {
      console.error('Supabase login error:', error);
      throw error;
    }
    if (data.user) {
      await this.loadProfile(data.user.id);
    }
  }

  // ── Logout ───────────────────────────────────────────────────────────
  async logout(): Promise<void> {
    const { error } = await this.sb.client.auth.signOut();
    if (error) {
      console.error('Supabase logout error:', error);
      throw error;
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    // Checks live Supabase session — no localStorage JWT needed
    return !!this.sb.currentSession;
  }

  // ── Internal: fetch profile row and push to stream ───────────────────
  private async loadProfile(userId: string): Promise<void> {
    const { data, error } = await this.sb.client
      .from('profiles')
      .select('id, email, username, full_name, phone_number, avatar_url, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn('Could not load profile:', error?.message);
      return;
    }
    this.currentUserSubject.next(profileToUser(data as Profile));
  }
}
