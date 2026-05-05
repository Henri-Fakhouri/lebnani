import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    template: `
    <main class="login-page">
      <section class="login-card">
        <h1>Lebnani</h1>
        <p>Connecte-toi pour continuer ton cours de libanais.</p>

        <form (ngSubmit)="login()">
          <label>
            Email
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              autocomplete="email"
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              name="password"
              [(ngModel)]="password"
              autocomplete="current-password"
            />
          </label>

          @if (errorMessage) {
            <p class="error">{{ errorMessage }}</p>
          }

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
          <button type="button" class="secondary" (click)="goToRegister()">
            Créer un compte
        </button>
        </form>
      </section>
    </main>
  `,
    styles: [`
    .login-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #f5f2ea;
      font-family: Arial, sans-serif;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: white;
      padding: 32px;
      border-radius: 18px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
    }

    h1 {
      margin: 0 0 8px;
      font-size: 36px;
    }

    p {
      margin: 0 0 24px;
      color: #555;
    }

    form {
      display: grid;
      gap: 16px;
    }

    label {
      display: grid;
      gap: 6px;
      font-weight: 600;
    }

    input {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 10px;
      font-size: 16px;
    }

    button {
      margin-top: 8px;
      padding: 12px 16px;
      border: 0;
      border-radius: 999px;
      background: #253d2c;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.7;
      cursor: default;
    }
    
    .secondary {
        background: #eef4ed;
        color: #253d2c;
        }
    
    .error {
      color: #b00020;
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class LoginComponent {
    email = 'test@test.com';
    password = '123456';
    loading = false;
    errorMessage = '';

    constructor(
        private readonly apiService: ApiService,
        private readonly authService: AuthService,
        private readonly router: Router
    ) { }

    login(): void {
        this.loading = true;
        this.errorMessage = '';

        this.apiService.login(this.email, this.password).subscribe({
            next: response => {
                this.authService.saveToken(response.accessToken);
                this.router.navigateByUrl('/course');
            },
            error: () => {
                this.errorMessage = 'Connexion impossible. Vérifie tes identifiants.';
                this.loading = false;
            }
        });
    }

    goToRegister(): void {
        this.router.navigateByUrl('/register');
    }
}