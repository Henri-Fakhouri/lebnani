import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const authServiceMock = {
    getToken: vi.fn(),
    logout: vi.fn()
  };

  const routerMock = {
    navigateByUrl: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
        }
      ]
    });
  });

  it('should add bearer token to api requests when token exists', async () => {
    authServiceMock.getToken.mockReturnValue('jwt-token');

    const request = new HttpRequest('GET', '/api/users/me');
    let authorizationHeader: string | null = null;

    const next: HttpHandlerFn = req => {
      authorizationHeader = req.headers.get('Authorization');
      return of(new HttpResponse({ status: 200 })) as Observable<HttpEvent<unknown>>;
    };

    await firstValueFrom(
      TestBed.runInInjectionContext(() => authInterceptor(request, next))
    );

    expect(authorizationHeader).toBe('Bearer jwt-token');
  });

  it('should not add bearer token when request is not api request', async () => {
    authServiceMock.getToken.mockReturnValue('jwt-token');

    const request = new HttpRequest('GET', '/assets/file.json');
    let hasAuthorizationHeader = true;

    const next: HttpHandlerFn = req => {
      hasAuthorizationHeader = req.headers.has('Authorization');
      return of(new HttpResponse({ status: 200 })) as Observable<HttpEvent<unknown>>;
    };

    await firstValueFrom(
      TestBed.runInInjectionContext(() => authInterceptor(request, next))
    );

    expect(hasAuthorizationHeader).toBe(false);
  });

  it('should not add bearer token when token is missing', async () => {
    authServiceMock.getToken.mockReturnValue(null);

    const request = new HttpRequest('GET', '/api/users/me');
    let hasAuthorizationHeader = true;

    const next: HttpHandlerFn = req => {
      hasAuthorizationHeader = req.headers.has('Authorization');
      return of(new HttpResponse({ status: 200 })) as Observable<HttpEvent<unknown>>;
    };

    await firstValueFrom(
      TestBed.runInInjectionContext(() => authInterceptor(request, next))
    );

    expect(hasAuthorizationHeader).toBe(false);
  });

  it('should logout and redirect on 401 error', async () => {
    authServiceMock.getToken.mockReturnValue('jwt-token');

    const request = new HttpRequest('GET', '/api/users/me');
    const error = new HttpErrorResponse({ status: 401 });

    const next: HttpHandlerFn = () => throwError(() => error);

    await expect(
      firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, next)))
    ).rejects.toBe(error);

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should logout and redirect on 403 error', async () => {
    authServiceMock.getToken.mockReturnValue('jwt-token');

    const request = new HttpRequest('GET', '/api/admin');
    const error = new HttpErrorResponse({ status: 403 });

    const next: HttpHandlerFn = () => throwError(() => error);

    await expect(
      firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, next)))
    ).rejects.toBe(error);

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should not logout on non auth http errors', async () => {
    authServiceMock.getToken.mockReturnValue('jwt-token');

    const request = new HttpRequest('GET', '/api/users/me');
    const error = new HttpErrorResponse({ status: 500 });

    const next: HttpHandlerFn = () => throwError(() => error);

    await expect(
      firstValueFrom(TestBed.runInInjectionContext(() => authInterceptor(request, next)))
    ).rejects.toBe(error);

    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });
});