import { Injectable } from '@angular/core';

export interface LoginResponse {
  id: number;
  email: string;
  displayName: string;
  role: string;
  accessToken: string;
  tokenType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'lebnani_access_token';

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}