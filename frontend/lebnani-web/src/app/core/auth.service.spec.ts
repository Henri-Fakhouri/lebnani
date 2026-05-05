import { TestBed } from '@angular/core/testing';

import { AuthService, UserInfo } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const user: UserInfo = {
    id: 1,
    email: 'test@email.com',
    displayName: 'Henri',
    role: 'ADMIN'
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should save and read session', () => {
    service.saveSession('jwt-token', user);

    expect(service.getToken()).toBe('jwt-token');
    expect(service.getUser()).toEqual(user);
    expect(service.isLoggedIn()).toBe(true);
    expect(service.isAdmin()).toBe(true);
  });

  it('should return null user when no user is saved', () => {
    expect(service.getUser()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.isAdmin()).toBe(false);
  });

  it('should detect non admin user', () => {
    service.saveSession('jwt-token', {
      ...user,
      role: 'LEARNER'
    });

    expect(service.isAdmin()).toBe(false);
  });

  it('should logout by removing token and user', () => {
    service.saveSession('jwt-token', user);

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});