import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MascotComponent } from '../../shared/mascot/mascot.component';

@Component({
  selector: 'app-admin-import',
  standalone: true,
  imports: [FormsModule, MascotComponent],
  template: `
    <main class="admin-page">
      <div class="admin-shell">
        <div class="admin-topbar">
          <button type="button" class="back-button" (click)="backToCourse()">
            ← Parcours
          </button>

          <div class="flag-stripe">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <section class="admin-hero">
          <div>
            <span class="admin-chip">Admin</span>
            <h1>Importer du contenu</h1>
            <p>
              Colle un JSON de cours pour créer des unités, leçons, blocs de contenu,
              exercices, options et réponses acceptées.
            </p>
          </div>

          <app-mascot
            size="md"
            mood="thinking"
            message="On ajoute du vrai contenu libanais ici."
          />
        </section>

        <section class="import-card">
          <div class="import-header">
            <div>
              <span class="admin-chip">Import JSON</span>
              <h2>Source du contenu</h2>
            </div>

            <button type="button" class="secondary-button" (click)="useExampleJson()">
              Exemple JSON
            </button>
          </div>

          <label class="course-field">
            <span>ID du cours</span>
            <input
              type="number"
              min="1"
              [(ngModel)]="courseId"
              name="courseId"
            />
          </label>

          <label class="json-field">
            <span>JSON à importer</span>
            <textarea
              [(ngModel)]="rawJson"
              name="rawJson"
              placeholder="Colle ton JSON ici..."
              spellcheck="false"
            ></textarea>
          </label>

          <div class="actions">
            <button type="button" class="secondary-button" (click)="formatJson()">
              Formater
            </button>

            <button
              type="button"
              class="primary-button"
              [disabled]="loading || !rawJson.trim() || courseId < 1"
              (click)="importJson()"
            >
              {{ loading ? 'Import...' : 'Importer le contenu' }}
            </button>
          </div>

          @if (errorMessage) {
            <div class="message-box error-box">
              {{ errorMessage }}
            </div>
          }

          @if (successMessage) {
            <div class="message-box success-box">
              {{ successMessage }}
            </div>
          }

          @if (lastResult) {
            <div class="result-box">
              <span>Résultat backend</span>
              <pre>{{ lastResult }}</pre>
            </div>
          }
        </section>
      </div>
    </main>
  `,
  styles: [`
    .admin-page {
      min-height: 100vh;
      padding: 28px 18px 48px;
      color: var(--text-main);
      background:
        radial-gradient(circle at 10% 8%, rgba(214, 40, 40, 0.10), transparent 260px),
        radial-gradient(circle at 90% 12%, rgba(31, 95, 67, 0.14), transparent 300px),
        linear-gradient(135deg, var(--cream), #fffaf2);
    }

    .admin-shell {
      width: min(100%, 980px);
      margin: 0 auto;
    }

    .admin-topbar {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      margin-bottom: 18px;
    }

    .back-button,
    .secondary-button {
      border: 0;
      border-radius: 999px;
      padding: 10px 15px;
      color: var(--cedar-green-dark);
      background: var(--cedar-green-soft);
      font-weight: 900;
    }

    .admin-hero,
    .import-card {
      border: 1px solid var(--border-soft);
      border-radius: 32px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: var(--shadow-lifted);
    }

    .admin-hero {
      position: relative;
      overflow: hidden;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 28px;
      align-items: center;
      margin-bottom: 18px;
      padding: 30px;
    }

    .admin-hero::before {
      content: "";
      position: absolute;
      right: -60px;
      top: -70px;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: rgba(31, 95, 67, 0.08);
    }

    .admin-hero > * {
      position: relative;
      z-index: 1;
    }

    .admin-chip {
      display: inline-flex;
      width: fit-content;
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
      letter-spacing: -0.05em;
      line-height: 0.95;
    }

    h1 {
      max-width: 620px;
      margin-top: 14px;
      font-size: clamp(46px, 6vw, 74px);
    }

    h2 {
      margin-top: 12px;
      font-size: clamp(30px, 4vw, 46px);
    }

    .admin-hero p {
      max-width: 620px;
      margin: 16px 0 0;
      color: var(--text-muted);
      font-size: 17px;
      font-weight: 650;
      line-height: 1.55;
    }

    .import-card {
      display: grid;
      gap: 18px;
      padding: 28px;
    }

    .import-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: start;
    }

    label {
      display: grid;
      gap: 8px;
    }

    label span,
    .result-box span {
      color: var(--cedar-green-dark);
      font-size: 13px;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    input,
    textarea {
      width: 100%;
      border: 2px solid var(--border-soft);
      border-radius: 20px;
      background: #fffdf8;
      color: var(--text-main);
      font-size: 15px;
      font-weight: 750;
      outline: none;
    }

    input {
      max-width: 180px;
      padding: 14px 16px;
    }

    textarea {
      min-height: 420px;
      padding: 18px;
      resize: vertical;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      line-height: 1.5;
      white-space: pre;
    }

    input:focus,
    textarea:focus {
      border-color: var(--cedar-green);
      box-shadow: 0 0 0 4px rgba(31, 95, 67, 0.10);
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      flex-wrap: wrap;
    }

    .primary-button {
      border: 0;
      border-radius: 999px;
      padding: 14px 20px;
      color: var(--white);
      background: var(--cedar-green-dark);
      box-shadow: 0 12px 24px rgba(20, 61, 43, 0.20);
      font-weight: 950;
    }

    .primary-button:disabled {
      opacity: 0.55;
    }

    .message-box {
      padding: 14px 16px;
      border-radius: 18px;
      font-weight: 800;
    }

    .error-box {
      color: var(--lb-red-dark);
      background: var(--lb-red-soft);
      border: 1px solid rgba(214, 40, 40, 0.25);
    }

    .success-box {
      color: var(--cedar-green-dark);
      background: var(--cedar-green-soft);
      border: 1px solid rgba(31, 95, 67, 0.25);
    }

    .result-box {
      display: grid;
      gap: 10px;
      padding: 18px;
      border: 1px solid var(--border-soft);
      border-radius: 22px;
      background: #fffdf8;
    }

    pre {
      max-height: 280px;
      overflow: auto;
      margin: 0;
      color: var(--text-main);
      font-size: 13px;
      line-height: 1.45;
      white-space: pre-wrap;
    }

    @media (max-width: 780px) {
      .admin-hero {
        grid-template-columns: 1fr;
      }

      .import-header {
        display: grid;
      }
    }
  `]
})
export class AdminImportComponent implements OnInit {
  courseId = 1;
  rawJson = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  lastResult = '';

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    if (!this.auth.isAdmin()) {
      this.router.navigateByUrl('/course');
    }
  }

  importJson(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.lastResult = '';

    let parsedContent: unknown;

    try {
      parsedContent = JSON.parse(this.rawJson);
    } catch {
      this.errorMessage = 'JSON invalide. Corrige la syntaxe avant import.';
      return;
    }

    this.loading = true;

    this.api.importContent(this.courseId, parsedContent).subscribe({
      next: result => {
        this.loading = false;
        this.successMessage = 'Import terminé.';
        this.lastResult = JSON.stringify(result, null, 2);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Import refusé par le backend. Vérifie le JSON ou les règles de validation.';
      }
    });
  }

  formatJson(): void {
    this.errorMessage = '';

    try {
      const parsedContent = JSON.parse(this.rawJson);
      this.rawJson = JSON.stringify(parsedContent, null, 2);
    } catch {
      this.errorMessage = 'Impossible de formater : JSON invalide.';
    }
  }

  useExampleJson(): void {
    this.rawJson = JSON.stringify({
      units: [
        {
          title: 'Salutations',
          displayOrder: 1,
          published: true,
          lessons: [
            {
              title: 'Dire bonjour',
              displayOrder: 1,
              published: true,
              contentBlocks: [
                {
                  type: 'HEADING',
                  content: 'Dire bonjour en libanais',
                  displayOrder: 1
                },
                {
                  type: 'MARKDOWN',
                  content: 'En libanais parlé, **mar7aba** veut dire bonjour.',
                  displayOrder: 2
                },
                {
                  type: 'EXAMPLE',
                  content: 'Mar7aba Henri !',
                  displayOrder: 3
                }
              ],
              exercises: [
                {
                  type: 'MULTIPLE_CHOICE',
                  promptFr: 'Que veut dire "mar7aba" ?',
                  correctAnswer: 'bonjour',
                  displayOrder: 1,
                  published: true,
                  options: [
                    {
                      text: 'bonjour',
                      correct: true,
                      displayOrder: 1
                    },
                    {
                      text: 'merci',
                      correct: false,
                      displayOrder: 2
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }, null, 2);
  }

  backToCourse(): void {
    this.router.navigateByUrl('/course');
  }
}