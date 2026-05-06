import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MascotComponent } from '../../shared/mascot/mascot.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MascotComponent],
  template: `
    <main class="login-page">
      <section class="login-shell">
        <div class="login-visual">
          <div class="lb-lebanese-stripe"></div>

          <span class="brand-chip">🇱🇧 Lebnani</span>

          <h1>Reviens pratiquer ton libanais</h1>

          <p>
            Connecte-toi pour continuer ton parcours, garder ta série et réviser les mots difficiles.
          </p>

          <div class="mascot-row">
            <app-mascot
              size="md"
              mood="happy"
              message="Mar7aba. Yalla, on reprend."
            />
          </div>
        </div>

        <section class="login-card">
          <span class="brand-chip">Connexion</span>

          <h2>Content de te revoir</h2>

          <p class="card-subtitle">
            Entre ton email et ton mot de passe.
          </p>

          <form (ngSubmit)="login()">
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                autocomplete="email"
              />
            </label>

            <label>
              <span>Mot de passe</span>
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

            <button type="submit" class="primary-button" [disabled]="loading">
              {{ loading ? 'Connexion...' : 'Se connecter' }}
            </button>

            <p class="register-line">
              Pas encore de compte ?
              <button type="button" class="link-button" (click)="goToRegister()">
                Créer un compte
              </button>
            </p>
          </form>
        </section>
      </section>
    </main>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 28px 18px;
      color: var(--text-main);
      background:
        radial-gradient(circle at 12% 10%, rgba(214, 40, 40, 0.08), transparent 28%),
        radial-gradient(circle at 88% 18%, rgba(31, 95, 67, 0.12), transparent 30%),
        linear-gradient(135deg, var(--cream), #fffaf2);
    }

    .login-shell {
      width: min(100%, 980px);
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      overflow: hidden;
      border: 1px solid var(--border-soft);
      border-radius: 34px;
      background: rgba(255, 255, 255, 0.88);
      box-shadow: var(--shadow-lifted);
    }

    .login-visual,
    .login-card {
      min-height: 520px;
      padding: 42px;
    }

    .login-visual {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 88% 12%, rgba(31, 95, 67, 0.10), transparent 180px),
        radial-gradient(circle at 8% 92%, rgba(214, 40, 40, 0.08), transparent 180px),
        #fffdf8;
    }

    .login-visual::after {
      content: "";
      position: absolute;
      right: -90px;
      top: -90px;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: rgba(31, 95, 67, 0.07);
    }

    .login-visual > * {
      position: relative;
      z-index: 1;
    }

    .brand-chip {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 999px;
      color: var(--cedar-green-dark);
      background: var(--cedar-green-soft);
      font-size: 13px;
      font-weight: 900;
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
      max-width: 430px;
      margin-top: 34px;
      font-size: clamp(48px, 7vw, 78px);
    }

    h2 {
      margin-top: 18px;
      font-size: clamp(36px, 5vw, 52px);
    }

    .login-visual p,
    .card-subtitle {
      color: var(--text-muted);
      font-weight: 700;
      line-height: 1.5;
    }

    .login-visual p {
      max-width: 520px;
      margin: 22px 0 0;
      font-size: 16px;
    }

    .card-subtitle {
      margin: 14px 0 24px;
    }

    .mascot-row {
      margin-top: 44px;
    }

    .login-card {
      display: grid;
      align-content: center;
      background: rgba(255, 255, 255, 0.96);
    }

    form {
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
      border: 2px solid var(--border-soft);
      border-radius: 18px;
      padding: 14px 16px;
      background: #fffdf8;
      color: var(--text-main);
      font-size: 15px;
      font-weight: 750;
      outline: none;
    }

    input:focus {
      border-color: var(--cedar-green);
      box-shadow: 0 0 0 4px rgba(31, 95, 67, 0.10);
    }

    .primary-button {
      border: 0;
      border-radius: 999px;
      padding: 14px 18px;
      color: var(--white);
      background: var(--cedar-green-dark);
      box-shadow: 0 12px 24px rgba(20, 61, 43, 0.20);
      font-weight: 950;
    }

    .primary-button:disabled {
      opacity: 0.55;
    }

    .register-line {
      margin: 2px 0 0;
      color: var(--text-muted);
      text-align: center;
      font-size: 14px;
      font-weight: 800;
    }

    .link-button {
      border: 0;
      padding: 0;
      color: var(--cedar-green-dark);
      background: transparent;
      font-weight: 950;
      text-decoration: underline;
    }

    .error {
      margin: 0;
      color: var(--lb-red-dark);
      font-size: 14px;
      font-weight: 900;
    }

    @media (max-width: 820px) {
      .login-shell {
        grid-template-columns: 1fr;
      }

      .login-visual,
      .login-card {
        min-height: auto;
        padding: 28px;
      }
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
        this.authService.saveSession(response.accessToken, response);
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