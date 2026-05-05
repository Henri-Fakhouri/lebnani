import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-import-history',
  standalone: true,
  imports : [DatePipe],
  template: `
    <main class="history-page">
      <section class="history-card">
        <header>
          <div>
            <p class="eyebrow">Admin</p>
            <h1>Historique des imports</h1>
          </div>

          <div class="actions">
            <button type="button" class="secondary" (click)="openImport()">Nouvel import</button>
            <button type="button" class="secondary" (click)="backToCourse()">Retour</button>
          </div>
        </header>

        @if (loading) {
          <p>Chargement...</p>
        }

        @if (errorMessage) {
          <p class="error">{{ errorMessage }}</p>
        }

        @if (!loading && !errorMessage && runs.length === 0) {
          <div class="empty">
            <h2>Aucun import trouvé</h2>
            <p>Les imports JSON apparaîtront ici.</p>
          </div>
        }

        @if (runs.length > 0) {
          <div class="runs">
            @for (run of runs; track run.id) {
              <article class="run-card" [class.failed]="run.status === 'FAILED'">
                <div class="run-header">
                  <div>
                    <strong>#{{ run.id }} · {{ run.status }}</strong>
                    <span>{{ run.startedAt | date:'short' }}</span>
                  </div>

                  <span class="badge" [class.completed]="run.status === 'COMPLETED'" [class.failed-badge]="run.status === 'FAILED'">
                    {{ run.status }}
                  </span>
                </div>

                <div class="stats">
                  <div>
                    <strong>{{ run.unitsCreated }}</strong>
                    <span>unités</span>
                  </div>

                  <div>
                    <strong>{{ run.lessonsCreated }}</strong>
                    <span>leçons</span>
                  </div>

                  <div>
                    <strong>{{ run.exercisesCreated }}</strong>
                    <span>exercices</span>
                  </div>

                  <div>
                    <strong>{{ run.optionsCreated }}</strong>
                    <span>options</span>
                  </div>

                  <div>
                    <strong>{{ run.acceptedAnswersCreated }}</strong>
                    <span>réponses</span>
                  </div>
                </div>

                <p class="meta">
                  Cours: {{ run.courseTitle }} · Par: {{ run.userEmail }}
                </p>

                @if (run.errorMessage) {
                  <p class="error-detail">{{ run.errorMessage }}</p>
                }
              </article>
            }
          </div>
        }
      </section>
    </main>
  `,
  styles: [`
    .history-page {
      min-height: 100vh;
      padding: 32px;
      background: #f5f2ea;
      font-family: Arial, sans-serif;
      color: #18251d;
    }

    .history-card {
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
      margin-bottom: 24px;
    }

    h1, h2, p {
      margin: 0;
    }

    h1 {
      font-size: 32px;
    }

    .eyebrow {
      color: #253d2c;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    button {
      padding: 12px 16px;
      border: 0;
      border-radius: 999px;
      background: #253d2c;
      color: white;
      cursor: pointer;
      font-weight: 700;
    }

    .secondary {
      background: #eef4ed;
      color: #253d2c;
    }

    .runs {
      display: grid;
      gap: 14px;
    }

    .run-card {
      border: 1px solid #eee8dc;
      border-radius: 18px;
      background: #fffdf8;
      padding: 18px;
    }

    .run-card.failed {
      border-color: #ffd0d0;
      background: #fff8f8;
    }

    .run-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: start;
      margin-bottom: 14px;
    }

    .run-header strong {
      display: block;
      font-size: 18px;
    }

    .run-header span {
      display: block;
      color: #667064;
      margin-top: 4px;
    }

    .badge {
      border-radius: 999px;
      padding: 6px 12px;
      font-weight: 700;
      background: #eef4ed;
      color: #253d2c;
    }

    .failed-badge {
      background: #fff1f1;
      color: #b00020;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }

    .stats div {
      border-radius: 14px;
      background: white;
      border: 1px solid #eee8dc;
      padding: 12px;
    }

    .stats strong {
      display: block;
      font-size: 22px;
      color: #253d2c;
    }

    .stats span {
      color: #667064;
      font-size: 13px;
    }

    .meta {
      color: #667064;
    }

    .error,
    .error-detail {
      color: #b00020;
      font-weight: 700;
    }

    .error-detail {
      margin-top: 12px;
      background: #fff1f1;
      border-radius: 12px;
      padding: 10px 12px;
    }

    .empty {
      display: grid;
      gap: 8px;
    }

    .empty p {
      color: #667064;
    }

    @media (max-width: 800px) {
      header {
        flex-direction: column;
      }

      .actions {
        flex-wrap: wrap;
      }

      .stats {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class AdminImportHistoryComponent implements OnInit {
  runs: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.router.navigateByUrl('/course');
      return;
    }

    this.apiService.getContentImportRuns(1).subscribe({
      next: runs => {
        this.runs = runs;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger l’historique des imports.';
        this.loading = false;
      }
    });
  }

  openImport(): void {
    this.router.navigateByUrl('/admin/import');
  }

  backToCourse(): void {
    this.router.navigateByUrl('/course');
  }
}