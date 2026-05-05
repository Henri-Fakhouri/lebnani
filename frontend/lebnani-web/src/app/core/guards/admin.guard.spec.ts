import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  const authServiceMock = {
    isLoggedIn: vi.fn(),
    isAdmin: vi.fn()
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

  it('should redirect anonymous users to login', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);
    authServiceMock.isAdmin.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any)
    );

    expect(result).toBe(false);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should redirect non admin users to course page', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);
    authServiceMock.isAdmin.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any)
    );

    expect(result).toBe(false);
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/course');
  });

  it('should allow logged in admin users', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);
    authServiceMock.isAdmin.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });
});