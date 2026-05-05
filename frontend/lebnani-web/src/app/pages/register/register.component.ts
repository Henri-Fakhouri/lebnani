import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="register-page">
      <section class="register-card">
        <h1>Créer un compte</h1>
        <p>Commence ton parcours de libanais parlé.</p>

        <form (ngSubmit)="register()">
          <label>
            Nom affiché
            <input
              type="text"
              name="displayName"
              [(ngModel)]="displayName"
              autocomplete="name"
            />
          </label>

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
              autocomplete="new-password"
            />
          </label>

          @if (errorMessage) {
            <p class="error">{{ errorMessage }}</p>
          }

          @if (successMessage) {
            <p class="success">{{ successMessage }}</p>
          }

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Création...' : 'Créer le compte' }}
          </button>

          <button type="button" class="secondary" (click)="goToLogin()">
            Déjà un compte ? Se connecter
          </button>
        </form>
      </section>
    </main>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #f5f2ea;
      font-family: Arial, sans-serif;
    }

    .register-card {
      width: 100%;
      max-width: 440px;
      background: white;
      padding: 32px;
      border-radius: 18px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
    }

    h1 {
      margin: 0 0 8px;
      font-size: 34px;
      color: #18251d;
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
      color: #18251d;
    }

    input {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 10px;
      font-size: 16px;
    }

    button {
      margin-top: 4px;
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

    .success {
      color: #1b7f3a;
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class RegisterComponent {
  displayName = '';
  email = '';
  password = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {}

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.displayName.trim() || !this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.loading = true;

    this.apiService.register(
      this.email.trim(),
      this.password,
      this.displayName.trim()
    ).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Compte créé. Redirection vers la connexion...';

        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 800);
      },
      error: err => {
        this.loading = false;

        if (err?.error?.code === 'EMAIL_ALREADY_USED') {
          this.errorMessage = 'Cet email est déjà utilisé.';
          return;
        }

        this.errorMessage = 'Impossible de créer le compte.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}