import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const isLoggedIn = !!localStorage.getItem('authToken'); // Check if JWT token exists


  if (!isLoggedIn) {
    return false;
  }

  router.navigate(['/unauthorized']); // Redirect unauthorized users
  return false;
};
