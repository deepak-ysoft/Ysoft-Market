import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  //const role = authService.getRole(); 

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`, // Token contains role, so no need to send it separately
        //Role: role ?? '' // Attach role if available
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
      }
      return throwError(() => error);
    })
  );
};
