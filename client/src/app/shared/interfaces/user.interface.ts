// ─── Supabase Profile (matches public.profiles table) ───────────────────
export interface Profile {
  id: string;          // UUID from auth.users
  email: string;
  username: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

// ─── Legacy alias kept so existing components compile without changes ─────
// Components use `user.name` — we expose it via a getter in the service.
export interface User {
  id: string;          // UUID (was number before Supabase migration)
  name: string;        // mapped from full_name
  username: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  created_at?: string;
}

// ─── Helper: convert Profile → User ──────────────────────────────────────
export function profileToUser(p: Profile): User {
  return {
    id:           p.id,
    name:         p.full_name,
    username:     p.username,
    email:        p.email ?? '',
    phone_number: p.phone_number,
    avatar_url:   p.avatar_url,
    created_at:   p.created_at,
  };
}
