import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-import',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="admin-page">
      <section class="admin-card">
        <header>
          <div>
            <p class="eyebrow">Admin</p>
            <h1>Import de contenu JSON</h1>
          </div>

          <button type="button" class="secondary" (click)="backToCourse()">
            Retour
          </button>
        </header>

        <p class="description">
          Colle un JSON de contenu pour ajouter des unités, leçons, exercices, options et réponses acceptées.
        </p>

        <textarea [(ngModel)]="jsonText" spellcheck="false"></textarea>

        @if (errorMessage) {
          <p class="error">{{ errorMessage }}</p>
        }

        @if (validationErrors.length > 0) {
          <div class="validation-errors">
            <h2>Erreurs de validation</h2>

            @for (err of validationErrors; track err.path + err.message) {
              <div class="validation-error">
                <strong>{{ err.path }}</strong>
                <span>{{ err.message }}</span>
              </div>
            }
          </div>
        }

        @if (result) {
          <div class="result">
            <h2>Import réussi</h2>
            <p>Unités créées: {{ result.unitsCreated }}</p>
            <p>Leçons créées: {{ result.lessonsCreated }}</p>
            <p>Exercices créés: {{ result.exercisesCreated }}</p>
            <p>Options créées: {{ result.optionsCreated }}</p>
            <p>Réponses acceptées créées: {{ result.acceptedAnswersCreated }}</p>
          </div>
        }

        <button type="button" (click)="importContent()" [disabled]="loading">
          {{ loading ? 'Import...' : 'Importer le contenu' }}
        </button>
      </section>
    </main>
  `,
  styles: [`
    .admin-page {
      min-height: 100vh;
      padding: 32px;
      background: #f5f2ea;
      font-family: Arial, sans-serif;
      color: #18251d;
    }

    .admin-card {
      max-width: 980px;
      margin: 0 auto;
      background: white;
      border-radius: 22px;
      padding: 32px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: start;
      margin-bottom: 18px;
    }

    h1, h2, p {
      margin: 0;
    }

    h1 {
      font-size: 32px;
    }

    h2 {
      font-size: 20px;
      margin-bottom: 12px;
    }

    .eyebrow {
      color: #253d2c;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .description {
      color: #667064;
      margin-bottom: 18px;
    }

    textarea {
      width: 100%;
      min-height: 420px;
      resize: vertical;
      box-sizing: border-box;
      border: 1px solid #ddd;
      border-radius: 16px;
      padding: 16px;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.45;
      margin-bottom: 16px;
    }

    button {
      padding: 14px 18px;
      border: 0;
      border-radius: 999px;
      background: #253d2c;
      color: white;
      cursor: pointer;
      font-weight: 700;
      font-size: 15px;
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
      font-weight: 700;
      margin-bottom: 14px;
    }

    .validation-errors,
    .result {
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .validation-errors {
      background: #fff1f1;
      border: 1px solid #ffd0d0;
    }

    .validation-error {
      display: grid;
      gap: 4px;
      padding: 10px 0;
      border-top: 1px solid #ffd0d0;
    }

    .validation-error strong {
      color: #b00020;
    }

    .validation-error span {
      color: #5f3333;
    }

    .result {
      background: #f3faf3;
      border: 1px solid #cfe1cf;
    }

    .result p {
      color: #253d2c;
      margin-top: 6px;
    }
  `]
})
export class AdminImportComponent {
  jsonText = `{
  "units": [
    {
      "title": "Voyage",
      "description": "Expressions utiles pour voyager.",
      "displayOrder": 100,
      "lessons": [
        {
          "title": "À l'aéroport",
          "description": "Premières phrases pour voyager.",
          "displayOrder": 1,
          "exercises": [
            {
              "type": "TYPE_ANSWER",
              "promptFr": "Écris \\"je veux aller\\" en libanais.",
              "correctAnswer": "baddi rou7",
              "displayOrder": 1,
              "acceptedAnswers": [
                "baddi rou7",
                "badde rouh",
                "bade rou7"
              ]
            }
          ]
        }
      ]
    }
  ]
}`;

  loading = false;
  errorMessage = '';
  validationErrors: { path: string; message: string }[] = [];
  result: any = null;

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
    }
  }

  importContent(): void {
    this.errorMessage = '';
    this.validationErrors = [];
    this.result = null;

    let parsed: unknown;

    try {
      parsed = JSON.parse(this.jsonText);
    } catch {
      this.errorMessage = 'JSON invalide. Vérifie la syntaxe.';
      return;
    }

    this.loading = true;

    this.apiService.importContent(1, parsed).subscribe({
      next: result => {
        this.result = result;
        this.loading = false;
      },
      error: err => {
        this.loading = false;

        if (err?.error?.code === 'CONTENT_VALIDATION_ERROR') {
          this.validationErrors = err.error.errors ?? [];
          return;
        }

        if (err?.error?.code === 'FORBIDDEN_CONTENT_IMPORT') {
          this.errorMessage = 'Ton compte n’a pas le rôle ADMIN ou CONTENT_EDITOR.';
          return;
        }

        this.errorMessage = 'Import impossible.';
      }
    });
  }

  backToCourse(): void {
    this.router.navigateByUrl('/course');
  }
}