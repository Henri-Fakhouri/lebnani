import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService, LoginResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MascotComponent } from '../../shared/mascot/mascot.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MascotComponent],
  template: `
    <main class="auth-page">
      <div class="auth-shell">
        <section class="brand-panel">
          <div class="flag-stripe">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <span class="brand-chip">🇱🇧 Lebnani</span>

          <h1>Reviens pratiquer ton libanais</h1>

          <p>
            Connecte-toi pour continuer ton parcours, garder ta série et réviser les mots difficiles.
          </p>

          <app-mascot
            size="lg"
            mood="happy"
            message="Mar7aba. Yalla, on reprend."
          />
        </section>

        <section class="auth-card">
          <div class="auth-card-header">
            <span class="auth-chip">Connexion</span>
            <h2>Content de te revoir</h2>
            <p>Entre ton email et ton mot de passe.</p>
          </div>

          <form class="auth-form" (ngSubmit)="login()">
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                placeholder="henri@email.com"
                autocomplete="email"
                required
              />
            </label>

            <label>
              <span>Mot de passe</span>
              <input
                type="password"
                name="password"
                [(ngModel)]="password"
                placeholder="Ton mot de passe"
                autocomplete="current-password"
                required
              />
            </label>

            @if (errorMessage) {
              <div class="error-box">
                {{ errorMessage }}
              </div>
            }

            <button
              type="submit"
              class="primary-button"
              [disabled]="loading || !email.trim() || !password.trim()"
            >
              {{ loading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>

          <div class="auth-footer">
            <span>Pas encore de compte ?</span>
            <button type="button" class="link-button" (click)="goToRegister()">
              Créer un compte
            </button>
          </div>
        </section>
      </div>
    </main>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 28px 18px;
      color: var(--text-main);
      background:
        radial-gradient(circle at 12% 10%, rgba(214, 40, 40, 0.12), transparent 280px),
        radial-gradient(circle at 88% 14%, rgba(31, 95, 67, 0.16), transparent 320px),
        linear-gradient(135deg, var(--cream), #fffaf2);
    }

    .auth-shell {
      width: min(100%, 1040px);
      display: grid;
      grid-template-columns: 1.08fr 0.92fr;
      gap: 18px;
      align-items: stretch;
    }

    .brand-panel,
    .auth-card {
      border: 1px solid var(--border-soft);
      border-radius: 34px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: var(--shadow-lifted);
    }

    .brand-panel {
      position: relative;
      overflow: hidden;
      display: grid;
      align-content: center;
      gap: 22px;
      min-height: 620px;
      padding: 36px;
    }

    .brand-panel::before {
      content: "";
      position: absolute;
      right: -80px;
      top: -90px;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      background: rgba(31, 95, 67, 0.08);
    }

    .brand-panel::after {
      content: "";
      position: absolute;
      left: -90px;
      bottom: -100px;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: rgba(214, 40, 40, 0.08);
    }

    .brand-panel > * {
      position: relative;
      z-index: 1;
    }

    .flag-stripe {
      display: grid;
      grid-template-columns: 1fr 1.4fr 1fr;
      width: 100%;
      height: 10px;
      overflow: hidden;
      border-radius: 999px;
      box-shadow: 0 8px 18px rgba(31, 41, 51, 0.08);
    }

    .flag-stripe span:nth-child(1) {
      background: var(--lb-red);
    }

    .flag-stripe span:nth-child(2) {
      background: var(--white);
    }

    .flag-stripe span:nth-child(3) {
      background: var(--cedar-green);
    }

    .brand-chip,
    .auth-chip {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-radius: 999px;
      color: var(--cedar-green-dark);
      background: var(--cedar-green-soft);
      font-size: 13px;
      font-weight: 950;
    }

    h1,
    h2 {
      margin: 0;
      color: var(--text-main);
      font-weight: 950;
      letter-spacing: -0.06em;
      line-height: 0.92;
    }

    h1 {
      max-width: 560px;
      font-size: clamp(52px, 7vw, 86px);
    }

    h2 {
      margin-top: 16px;
      font-size: clamp(34px, 4vw, 52px);
    }

    .brand-panel p,
    .auth-card-header p {
      max-width: 540px;
      margin: 0;
      color: var(--text-muted);
      font-size: 17px;
      font-weight: 650;
      line-height: 1.55;
    }

    .auth-card {
      display: grid;
      align-content: center;
      padding: 34px;
    }

    .auth-card-header {
      margin-bottom: 24px;
    }

    .auth-card-header p {
      margin-top: 12px;
    }

    .auth-form {
      display: grid;
      gap: 16px;
    }

    label {
      display: grid;
      gap: 8px;
    }

    label span {
      color: var(--cedar-green-dark);
      font-size: 13px;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    input {
      width: 100%;
      padding: 16px;
      border: 2px solid var(--border-soft);
      border-radius: 20px;
      background: #fffdf8;
      color: var(--text-main);
      font-size: 16px;
      font-weight: 800;
      outline: none;
    }

    input:focus {
      border-color: var(--cedar-green);
      box-shadow: 0 0 0 4px rgba(31, 95, 67, 0.10);
    }

    .primary-button {
      border: 0;
      border-radius: 999px;
      padding: 15px 20px;
      color: var(--white);
      background: var(--cedar-green-dark);
      box-shadow: 0 12px 24px rgba(20, 61, 43, 0.20);
      font-weight: 950;
      transition:
        transform 0.14s ease,
        background 0.14s ease,
        box-shadow 0.14s ease;
    }

    .primary-button:not(:disabled):hover {
      transform: translateY(-1px);
      background: var(--cedar-green);
    }

    .primary-button:disabled {
      opacity: 0.55;
    }

    .error-box {
      padding: 14px 16px;
      border: 1px solid rgba(214, 40, 40, 0.25);
      border-radius: 18px;
      color: var(--lb-red-dark);
      background: var(--lb-red-soft);
      font-weight: 800;
    }

    .auth-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: center;
      margin-top: 22px;
      color: var(--text-muted);
      font-weight: 750;
    }

    .link-button {
      border: 0;
      padding: 0;
      color: var(--cedar-green-dark);
      background: transparent;
      font-weight: 950;
      text-decoration: underline;
    }

    @media (max-width: 900px) {
      .auth-shell {
        grid-template-columns: 1fr;
      }

      .brand-panel {
        min-height: auto;
      }
    }

    @media (max-width: 560px) {
      .auth-page {
        padding: 18px 12px;
      }

      .brand-panel,
      .auth-card {
        border-radius: 24px;
        padding: 22px;
      }

      h1 {
        font-size: 48px;
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  login(): void {
    if (this.loading || !this.email.trim() || !this.password.trim()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.api.login(this.email, this.password).subscribe({
      next: response => this.handleLoginSuccess(response),
      error: () => {
        this.loading = false;
        this.errorMessage = 'Email ou mot de passe incorrect.';
      }
    });
  }

  handleLoginSuccess(response: LoginResponse): void {
    this.auth.saveSession(response.accessToken, {
      id: response.id,
      email: response.email,
      displayName: response.displayName,
      role: response.role
    });

    this.router.navigateByUrl('/course');
  }

  goToRegister(): void {
    this.router.navigateByUrl('/register');
  }
}