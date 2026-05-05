import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { MascotComponent } from '../../shared/mascot/mascot.component';

@Component({
  selector: 'app-register',
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

          <span class="brand-chip">🇱🇧 Nouveau parcours</span>

          <h1>Commence ton libanais parlé</h1>

          <p>
            Crée ton compte, lance les premières leçons et laisse Arzi suivre ta progression.
          </p>

          <app-mascot
            size="lg"
            mood="excited"
            message="Bienvenue. On démarre doucement."
          />
        </section>

        <section class="auth-card">
          <div class="auth-card-header">
            <span class="auth-chip">Inscription</span>
            <h2>Créer un compte</h2>
            <p>Quelques infos et tu peux commencer.</p>
          </div>

          <form class="auth-form" (ngSubmit)="register()">
            <label>
              <span>Nom affiché</span>
              <input
                type="text"
                name="displayName"
                [(ngModel)]="displayName"
                placeholder="Henri"
                autocomplete="name"
                required
              />
            </label>

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
                placeholder="Minimum 6 caractères"
                autocomplete="new-password"
                required
              />
            </label>

            @if (errorMessage) {
              <div class="error-box">
                {{ errorMessage }}
              </div>
            }

            @if (successMessage) {
              <div class="success-box">
                {{ successMessage }}
              </div>
            }

            <button
              type="submit"
              class="primary-button"
              [disabled]="loading || !formIsValid()"
            >
              {{ loading ? 'Création...' : 'Créer mon compte' }}
            </button>
          </form>

          <div class="auth-footer">
            <span>Déjà un compte ?</span>
            <button type="button" class="link-button" (click)="goToLogin()">
              Se connecter
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
      min-height: 660px;
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

    .error-box,
    .success-box {
      padding: 14px 16px;
      border-radius: 18px;
      font-weight: 800;
    }

    .error-box {
      border: 1px solid rgba(214, 40, 40, 0.25);
      color: var(--lb-red-dark);
      background: var(--lb-red-soft);
    }

    .success-box {
      border: 1px solid rgba(31, 95, 67, 0.25);
      color: var(--cedar-green-dark);
      background: var(--cedar-green-soft);
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
export class RegisterComponent {
  displayName = '';
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  formIsValid(): boolean {
    return this.displayName.trim().length >= 2
      && this.email.trim().length > 0
      && this.password.trim().length >= 6;
  }

  register(): void {
    if (this.loading || !this.formIsValid()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.register(
      this.email.trim(),
      this.password,
      this.displayName.trim()
    ).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Compte créé. Redirection vers la connexion...';

        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 700);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de créer ce compte.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}