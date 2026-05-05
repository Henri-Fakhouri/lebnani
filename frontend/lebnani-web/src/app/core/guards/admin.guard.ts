import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigateByUrl('/login');
    return false;
  }

  if (!authService.isAdmin()) {
    router.navigateByUrl('/course');
    return false;
  }

  return true;
};