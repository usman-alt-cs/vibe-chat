import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async (_route, _state) => {
  const sb     = inject(SupabaseService);
  const router = inject(Router);

  // Use live Supabase session (handles token refresh automatically)
  const { data } = await sb.client.auth.getSession();
  if (data.session) return true;

  return router.parseUrl('/login');
};
