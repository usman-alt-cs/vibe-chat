import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sb = inject(SupabaseService);
  const session = sb.currentSession;

  if (session?.access_token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${session.access_token}`)
    });
    return next(clonedReq);
  }

  return next(req);
};
