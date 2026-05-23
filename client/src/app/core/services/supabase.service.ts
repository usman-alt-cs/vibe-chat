import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, User as SBUser } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private sessionSubject = new BehaviorSubject<Session | null>(null);

  /** Observable session — subscribe to react to auth state changes. */
  session$ = this.sessionSubject.asObservable();

  constructor() {
    if (!environment.supabaseUrl || !environment.supabaseAnonKey) {
      console.error('Missing Supabase environment values');
    }

    if (
      environment.supabaseUrl.includes('PASTE_') ||
      environment.supabaseAnonKey.includes('PASTE_') ||
      environment.supabaseUrl.includes('placeholder')
    ) {
      console.error('Supabase environment values are still placeholders');
    }

    console.log('SUPABASE URL:', environment.supabaseUrl);
    console.log('SUPABASE KEY EXISTS:', !!environment.supabaseAnonKey);
    console.log('SUPABASE KEY PREVIEW:', environment.supabaseAnonKey?.slice(0, 12));

    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
      {
        auth: {
          persistSession:     true,
          autoRefreshToken:   true,
          detectSessionInUrl: true,
        },
      }
    );

    // Load any persisted session immediately
    this.loadSession();

    // Keep session subject in sync with Supabase auth events
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.sessionSubject.next(session);
    });
  }

  /** Raw Supabase client — use for table queries, realtime, storage. */
  get client(): SupabaseClient {
    return this.supabase;
  }

  get currentSession(): Session | null {
    return this.sessionSubject.value;
  }

  get currentUser(): SBUser | null {
    return this.sessionSubject.value?.user ?? null;
  }

  async testConnection(): Promise<void> {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', environment.supabaseUrl);

    const { data, error } = await this.supabase
      .from('profiles')
      .select('id')
      .limit(1);

    console.log('Supabase test data:', data);
    console.log('Supabase test error:', error);

    if (error) {
      throw error;
    }
  }

  private async loadSession(): Promise<void> {
    const { data, error } = await this.supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase getSession error:', error);
    }
    
    this.sessionSubject.next(data.session);
  }
}
