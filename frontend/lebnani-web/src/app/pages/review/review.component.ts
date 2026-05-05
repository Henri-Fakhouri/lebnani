import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService, ReviewItemResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MascotComponent } from '../../shared/mascot/mascot.component';

interface ReviewAnswerResponse {
  reviewItemId: number;
  exerciseId: number;
  submittedAnswer: string;
  normalizedAnswer: string;
  correct: boolean;
  expectedAnswer: string;
  status: string;
  failureCount: number;
  successCount: number;
  nextReviewAt: string;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [FormsModule, MascotComponent],
  template: `
    <main class="review-page">
      <div class="review-shell">
        <div class="review-topbar">
          <button type="button" class="back-button" (click)="backToCourse()">
            ← Parcours
          </button>

          <div class="flag-stripe">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        @if (loading) {
          <section class="state-card">
            <app-mascot
              size="md"
              mood="thinking"
              message="Je prépare tes révisions du jour..."
            />
          </section>
        }

        @if (!loading && errorMessage) {
          <section class="state-card error-card">
            <app-mascot
              size="md"
              mood="wrong"
              [message]="errorMessage"
            />

            <button type="button" class="primary-button" (click)="backToCourse()">
              Retour au parcours
            </button>
          </section>
        }

        @if (!loading && !errorMessage && queue.length === 0) {
          <section class="empty-card">
            <div>
              <span class="review-chip success-chip">Révisions terminées</span>
              <h1>Queue vide</h1>
              <p>
                Khalas. Tu n’as rien à réviser pour le moment.
              </p>
            </div>

            <app-mascot
              size="lg"
              mood="proud"
              message="Propre. Reviens plus tard pour garder ton libanais vivant."
            />

            <button type="button" class="primary-button" (click)="backToCourse()">
              Retour au parcours
            </button>
          </section>
        }

        @if (!loading && !errorMessage && finished) {
          <section class="empty-card">
            <div>
              <span class="review-chip success-chip">Session terminée</span>
              <h1>Révisions faites</h1>
              <p>
                Tu as terminé cette session. Les mots difficiles reviendront plus tard.
              </p>
            </div>

            <app-mascot
              size="lg"
              mood="excited"
              message="Yalla. Bonne session."
            />

            <button type="button" class="primary-button" (click)="backToCourse()">
              Retour au parcours
            </button>
          </section>
        }

        @if (!loading && !errorMessage && !finished && currentItem) {
          <section class="review-hero">
            <div>
              <span class="review-chip">Révisions</span>
              <h1>Révision du jour</h1>
              <p>
                Les erreurs reviennent ici jusqu’à ce qu’elles soient maîtrisées.
              </p>
            </div>

            <app-mascot
              size="md"
              mood="happy"
              [message]="reviewMascotMessage()"
            />
          </section>

          <section class="review-card">
            <div class="review-header">
              <div>
                <span class="review-chip">
                  Carte {{ currentIndex + 1 }} / {{ queue.length }}
                </span>

                <h2>{{ currentItem.promptFr }}</h2>
              </div>

              <div class="review-progress-bar">
                <div [style.width.%]="reviewProgressPercent()"></div>
              </div>
            </div>

            <div class="review-meta">
              <span>Échecs : {{ currentItem.failureCount }}</span>
              <span>Réussites : {{ currentItem.successCount }}</span>
              <span>Status : {{ currentItem.status }}</span>
            </div>

            @if (hasOptions()) {
              <div class="options">
                @for (option of currentItem.options; track option.id) {
                  <button
                    type="button"
                    class="option-button"
                    [class.selected]="selectedAnswer === option.text"
                    [class.correct-selected]="selectedAnswer === option.text && feedback && lastCorrect"
                    [class.wrong-selected]="selectedAnswer === option.text && feedback && !lastCorrect"
                    [disabled]="answering || !!feedback"
                    (click)="answerWithOption(option.text)"
                  >
                    {{ option.text }}
                  </button>
                }
              </div>
            } @else {
              <div class="typed-answer">
                <input
                  [(ngModel)]="typedAnswer"
                  [disabled]="answering || !!feedback"
                  placeholder="Ta réponse"
                  (keyup.enter)="answerWithText()"
                />

                <button
                  type="button"
                  class="primary-button"
                  [disabled]="answering || !!feedback || !typedAnswer.trim()"
                  (click)="answerWithText()"
                >
                  Valider
                </button>
              </div>
            }

            @if (feedback) {
              <div class="feedback-panel" [class.correct]="lastCorrect" [class.wrong]="!lastCorrect">
                <app-mascot
                  size="sm"
                  [mood]="lastCorrect ? 'excited' : 'thinking'"
                  [message]="feedback"
                />

                <button type="button" class="primary-button next-button" (click)="nextReviewItem()">
                  {{ isLastItem() ? 'Terminer' : 'Continuer' }}
                </button>
              </div>
            }
          </section>
        }
      </div>
    </main>
  `,
  styles: [`
    .review-page {
      min-height: 100vh;
      padding: 28px 18px 48px;
      color: var(--text-main);
      background:
        radial-gradient(circle at 10% 8%, rgba(214, 40, 40, 0.10), transparent 260px),
        radial-gradient(circle at 90% 12%, rgba(31, 95, 67, 0.14), transparent 300px),
        linear-gradient(135deg, var(--cream), #fffaf2);
    }

    .review-shell {
      width: min(100%, 920px);
      margin: 0 auto;
    }

    .review-topbar {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      margin-bottom: 18px;
    }

    .back-button {
      border: 0;
      border-radius: 999px;
      padding: 10px 15px;
      color: var(--cedar-green-dark);
      background: var(--cedar-green-soft);
      font-weight: 900;
    }

    .flag-stripe {
      display: grid;
      grid-template-columns: 1fr 1.4fr 1fr;
      width: min(60vw, 380px);
      height: 8px;
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

    .review-hero,
    .review-card,
    .empty-card,
    .state-card {
      border: 1px solid var(--border-soft);
      border-radius: 32px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: var(--shadow-lifted);
    }

    .review-hero {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 28px;
      align-items: center;
      margin-bottom: 18px;
      padding: 30px;
      overflow: hidden;
      position: relative;
    }

    .review-hero::before {
      content: "";
      position: absolute;
      right: -60px;
      top: -70px;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: rgba(244, 185, 66, 0.16);
    }

    .review-hero > * {
      position: relative;
      z-index: 1;
    }

    .review-chip {
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

    .success-chip {
      color: #6f4c00;
      background: #fff1c9;
    }

    h1,
    h2 {
      margin: 0;
      color: var(--text-main);
      font-weight: 950;
      letter-spacing: -0.05em;
      line-height: 0.95;
    }

    .review-hero h1,
    .empty-card h1 {
      max-width: 560px;
      margin-top: 14px;
      font-size: clamp(44px, 6vw, 72px);
    }

    .review-hero p,
    .empty-card p {
      max-width: 540px;
      margin: 16px 0 0;
      color: var(--text-muted);
      font-size: 17px;
      font-weight: 650;
      line-height: 1.55;
    }

    .review-card {
      width: min(100%, 760px);
      margin: 0 auto;
      padding: 30px;
    }

    .review-header {
      display: grid;
      gap: 18px;
      margin-bottom: 18px;
    }

    .review-header h2 {
      margin-top: 16px;
      font-size: clamp(30px, 4vw, 44px);
      line-height: 1.05;
    }

    .review-progress-bar {
      height: 12px;
      overflow: hidden;
      border-radius: 999px;
      background: var(--cream-2);
    }

    .review-progress-bar div {
      height: 100%;
      border-radius: inherit;
      background:
        linear-gradient(
          90deg,
          var(--lb-red) 0 18%,
          var(--cedar-green) 18% 100%
        );
    }

    .review-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 22px;
    }

    .review-meta span {
      border-radius: 999px;
      padding: 7px 10px;
      color: var(--text-muted);
      background: #fffdf8;
      border: 1px solid var(--border-soft);
      font-size: 12px;
      font-weight: 850;
    }

    .options,
    .typed-answer {
      display: grid;
      gap: 12px;
    }

    button {
      transition:
        background 0.14s ease,
        color 0.14s ease,
        border-color 0.14s ease,
        transform 0.14s ease,
        box-shadow 0.14s ease;
    }

    button:not(:disabled):hover {
      transform: translateY(-1px);
    }

    button:disabled {
      cursor: not-allowed;
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

    .primary-button:not(:disabled):hover {
      background: var(--cedar-green);
    }

    .option-button {
      width: 100%;
      border: 2px solid var(--border-soft);
      border-radius: 20px;
      padding: 16px 18px;
      color: var(--text-main);
      background: #fffdf8;
      box-shadow: none;
      text-align: left;
      font-size: 16px;
      font-weight: 900;
    }

    .option-button:not(:disabled):hover {
      border-color: rgba(31, 95, 67, 0.38);
      background: #f8fbf6;
      box-shadow: 0 10px 20px rgba(31, 41, 51, 0.08);
    }

    .option-button.selected {
      border-color: var(--cedar-green);
      background: var(--cedar-green-soft);
    }

    .option-button.correct-selected {
      border-color: var(--cedar-green);
      background: var(--cedar-green);
      color: white;
      box-shadow: 0 12px 24px rgba(31, 95, 67, 0.22);
    }

    .option-button.wrong-selected {
      border-color: var(--lb-red);
      background: var(--lb-red);
      color: white;
      box-shadow: 0 12px 24px rgba(214, 40, 40, 0.20);
    }

    .option-button:disabled:not(.correct-selected):not(.wrong-selected) {
      opacity: 0.48;
      background: #f4f1ea;
      color: var(--text-muted);
    }

    input {
      width: 100%;
      padding: 16px;
      border: 2px solid var(--border-soft);
      border-radius: 20px;
      background: #fffdf8;
      color: var(--text-main);
      font-size: 18px;
      font-weight: 800;
      outline: none;
    }

    input:focus {
      border-color: var(--cedar-green);
      box-shadow: 0 0 0 4px rgba(31, 95, 67, 0.10);
    }

    input:disabled {
      background: #f4f1ea;
      color: var(--text-muted);
    }

    .feedback-panel {
      display: grid;
      gap: 16px;
      margin-top: 20px;
      padding: 18px;
      border-radius: 24px;
      border: 1px solid var(--border-soft);
    }

    .feedback-panel.correct {
      background: #f3faf3;
      border-color: rgba(31, 95, 67, 0.22);
    }

    .feedback-panel.wrong {
      background: #fff1f1;
      border-color: rgba(214, 40, 40, 0.20);
    }

    .next-button {
      width: 100%;
    }

    .empty-card,
    .state-card {
      display: grid;
      gap: 22px;
      justify-items: start;
      padding: 30px;
    }

    .error-card {
      border-color: rgba(214, 40, 40, 0.25);
      background: var(--lb-red-soft);
    }

    @media (max-width: 780px) {
      .review-hero {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 560px) {
      .review-page {
        padding: 18px 12px 34px;
      }

      .review-hero,
      .review-card,
      .empty-card,
      .state-card {
        border-radius: 24px;
        padding: 20px;
      }

      .review-hero h1,
      .empty-card h1 {
        font-size: 42px;
      }

      .flag-stripe {
        width: 150px;
      }
    }
  `]
})
export class ReviewComponent implements OnInit {
  queue: ReviewItemResponse[] = [];
  currentItem: ReviewItemResponse | null = null;
  currentIndex = 0;

  typedAnswer = '';
  selectedAnswer = '';
  feedback = '';
  lastCorrect = false;

  loading = true;
  answering = false;
  finished = false;
  errorMessage = '';

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

    this.loadReviewQueue();
  }

  loadReviewQueue(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getReviewQueue().subscribe({
      next: queue => {
        this.queue = queue;
        this.currentIndex = 0;
        this.currentItem = this.queue[0] ?? null;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les révisions.';
        this.loading = false;
      }
    });
  }

  hasOptions(): boolean {
    return (this.currentItem?.options.length ?? 0) > 0;
  }

  reviewProgressPercent(): number {
    if (this.queue.length === 0) {
      return 0;
    }

    return ((this.currentIndex + 1) * 100) / this.queue.length;
  }

  reviewMascotMessage(): string {
    if (!this.currentItem) {
      return 'On révise ce qui mérite un rappel.';
    }

    if (this.currentItem.failureCount >= 3) {
      return 'Ce mot résiste un peu. On le casse ensemble.';
    }

    return 'Petite révision rapide. Pas besoin de stress.';
  }

  answerWithOption(answer: string): void {
    this.selectedAnswer = answer;
    this.submitAnswer(answer);
  }

  answerWithText(): void {
    const answer = this.typedAnswer.trim();

    if (!answer) {
      return;
    }

    this.submitAnswer(answer);
  }

  submitAnswer(answer: string): void {
    if (!this.currentItem || this.answering || this.feedback) {
      return;
    }

    this.answering = true;

    this.api.answerReviewItem(this.currentItem.id, answer).subscribe({
      next: response => this.handleAnswerResponse(response),
      error: () => {
        this.answering = false;
        this.errorMessage = 'Impossible de valider la réponse.';
      }
    });
  }

  handleAnswerResponse(response: ReviewAnswerResponse): void {
    this.lastCorrect = response.correct;
    this.feedback = response.correct
      ? 'Correct'
      : `Presque. Réponse attendue : ${response.expectedAnswer}`;

    this.answering = false;
  }

  nextReviewItem(): void {
    this.currentIndex++;

    if (this.currentIndex >= this.queue.length) {
      this.finished = true;
      this.currentItem = null;
      this.resetAnswerState();
      return;
    }

    this.currentItem = this.queue[this.currentIndex];
    this.resetAnswerState();
  }

  resetAnswerState(): void {
    this.typedAnswer = '';
    this.selectedAnswer = '';
    this.feedback = '';
    this.lastCorrect = false;
    this.answering = false;
  }

  isLastItem(): boolean {
    return this.currentIndex >= this.queue.length - 1;
  }

  backToCourse(): void {
    this.router.navigateByUrl('/course');
  }
}