import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, ReviewItemResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
    selector: 'app-review',
    standalone: true,
    imports: [FormsModule],
    template: `
    <main class="review-page">
      <section class="review-card">
        <header>
          <div>
            <p class="eyebrow">Révision</p>
            <h1>File de révision</h1>
          </div>

          <button type="button" class="secondary" (click)="backToCourse()">
            Retour
          </button>
        </header>

        @if (loading) {
          <p>Chargement...</p>
        }

        @if (!loading && errorMessage) {
          <p class="error">{{ errorMessage }}</p>
        }

        @if (!loading && !errorMessage && reviewItems.length === 0) {
          <div class="empty">
            <h2>Aucune révision pour le moment</h2>
            <p>Les erreurs faites pendant les leçons apparaîtront ici.</p>
            <button type="button" (click)="backToCourse()">Retour au parcours</button>
          </div>
        }

        @if (!loading && currentItem) {
          <p class="progress">
            Item {{ index + 1 }} / {{ reviewItems.length }}
          </p>

          <h2>{{ currentItem.promptFr }}</h2>

          <p class="meta">
            Erreurs: {{ currentItem.failureCount }} · Réussites: {{ currentItem.successCount }}
          </p>

          @if (currentItem.exerciseType === 'MULTIPLE_CHOICE') {
            <div class="options">
              @for (option of currentItem.options; track option.id) {
                <button
                  type="button"
                  [disabled]="answering"
                  (click)="answer(option.text)"
                >
                  {{ option.text }}
                </button>
              }
            </div>
          }

          @if (currentItem.exerciseType === 'TYPE_ANSWER') {
            <div class="typed-answer">
              <input
                [(ngModel)]="textAnswer"
                [disabled]="answering"
                placeholder="Ta réponse"
                (keyup.enter)="answer(textAnswer)"
              />

              <button
                type="button"
                [disabled]="answering || !textAnswer.trim()"
                (click)="answer(textAnswer)"
              >
                Valider
              </button>
            </div>
          }

          @if (feedback) {
            <p class="feedback" [class.correct]="lastCorrect" [class.wrong]="!lastCorrect">
              {{ feedback }}
            </p>
          }
        }
      </section>
    </main>
  `,
    styles: [`
    .review-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px;
      background: #f5f2ea;
      font-family: Arial, sans-serif;
      color: #18251d;
    }

    .review-card {
      width: 100%;
      max-width: 720px;
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
      margin-bottom: 26px;
    }

    h1, h2, p {
      margin: 0;
    }

    h1 {
      font-size: 32px;
    }

    h2 {
      margin-bottom: 16px;
      font-size: 26px;
    }

    .eyebrow,
    .progress {
      color: #253d2c;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .meta {
      color: #667064;
      margin-bottom: 18px;
    }

    .options,
    .typed-answer {
      display: grid;
      gap: 12px;
    }

    input {
      padding: 14px;
      border: 1px solid #ddd;
      border-radius: 14px;
      font-size: 16px;
    }

    button {
      padding: 14px 18px;
      border: 0;
      border-radius: 14px;
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

    .empty {
      display: grid;
      gap: 12px;
    }

    .empty p {
      color: #667064;
    }

    .feedback {
      margin-top: 18px;
      font-weight: 700;
    }

    .feedback.correct {
      color: #1b7f3a;
    }

    .feedback.wrong,
    .error {
      color: #b00020;
    }
  `]
})
export class ReviewComponent implements OnInit {
    reviewItems: ReviewItemResponse[] = [];
    currentItem: ReviewItemResponse | null = null;

    index = 0;
    textAnswer = '';
    feedback = '';
    lastCorrect = false;

    loading = true;
    answering = false;
    errorMessage = '';

    constructor(
        private readonly apiService: ApiService,
        private readonly authService: AuthService,
        private readonly router: Router
    ) { }

    ngOnInit(): void {
        if (!this.authService.isLoggedIn()) {
            this.router.navigateByUrl('/login');
            return;
        }

        this.loadReviewQueue();
    }

    loadReviewQueue(): void {
        this.apiService.getReviewQueue().subscribe({
            next: items => {
                this.reviewItems = items;
                this.currentItem = this.reviewItems[0] ?? null;
                this.loading = false;
            },
            error: () => {
                this.errorMessage = 'Impossible de charger la file de révision.';
                this.loading = false;
            }
        });
    }

    answer(answer: string): void {
        if (!this.currentItem || this.answering || !answer.trim()) {
            return;
        }

        this.answering = true;

        this.apiService.answerReviewItem(this.currentItem.id, answer).subscribe({
            next: result => {
                this.lastCorrect = result.correct;
                this.feedback = result.correct
                    ? 'Correct, révision planifiée.'
                    : `Incorrect. Réponse attendue : ${result.expectedAnswer}`;

                setTimeout(() => this.nextItem(), 1400);
            },
            error: () => {
                this.answering = false;
                this.errorMessage = 'Impossible de valider la révision.';
            }
        });
    }

    nextItem(): void {
        this.index++;

        if (this.index >= this.reviewItems.length) {
            this.currentItem = null;
            this.reviewItems = [];
            this.feedback = '';
            this.answering = false;
            return;
        }

        this.currentItem = this.reviewItems[this.index];
        this.textAnswer = '';
        this.feedback = '';
        this.answering = false;
    }

    backToCourse(): void {
        this.router.navigateByUrl('/course');
    }
}