import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, ReviewItemResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MascotComponent, MascotMood } from '../../shared/mascot/mascot.component';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [FormsModule, MascotComponent],
  template: `
    <main class="review-page">
      <div class="review-shell">
        <div class="review-flag"></div>

        <header class="review-topbar">
          <button type="button" class="ghost-button" (click)="backToCourse()">
            ← Parcours
          </button>

          @if (!loading && currentItem) {
            <span class="chip">
              Carte {{ index + 1 }} / {{ reviewItems.length }}
            </span>
          }
        </header>

        <section class="review-card">
          @if (loading) {
            <div class="state-panel">
              <app-mascot
                mood="thinking"
                size="lg"
                message="Je prépare la révision du jour."
              />
            </div>
          }

          @if (!loading && errorMessage) {
            <div class="state-panel">
              <app-mascot
                mood="sad"
                size="lg"
                [message]="errorMessage"
              />

              <button type="button" class="primary-button" (click)="backToCourse()">
                Retour au parcours
              </button>
            </div>
          }

          @if (!loading && !errorMessage && reviewItems.length === 0) {
            <div class="state-panel">
              <app-mascot
                mood="proud"
                size="lg"
                message="Aucune révision pour le moment. C’est propre."
              />

              <button type="button" class="primary-button" (click)="backToCourse()">
                Retour au parcours
              </button>
            </div>
          }

          @if (!loading && !errorMessage && currentItem) {
            <section class="review-hero">
              <div class="hero-copy">
                <span class="eyebrow">Révision du jour</span>
                <h1>{{ currentItem.promptFr }}</h1>

                <div class="review-progress-bar">
                  <div [style.width.%]="progressPercent"></div>
                </div>

                <div class="meta-row">
                  <span class="mini-chip">Échecs : {{ currentItem.failureCount }}</span>
                  <span class="mini-chip">Réussites : {{ currentItem.successCount }}</span>
                  <span class="mini-chip">Status : {{ currentItem.status }}</span>
                </div>
              </div>

              <app-mascot
                [mood]="currentMascotMood"
                size="md"
                [message]="currentMascotMessage"
              />
            </section>

            @if (currentItem.exerciseType === 'MULTIPLE_CHOICE') {
              <div class="options">
                @for (option of currentItem.options; track option.id) {
                  <button
                    type="button"
                    class="option-button"
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
                  class="primary-button"
                  [disabled]="answering || !textAnswer.trim()"
                  (click)="answer(textAnswer)"
                >
                  Valider
                </button>
              </div>
            }

            @if (feedback) {
              <div class="feedback-panel" [class.correct]="lastCorrect" [class.wrong]="!lastCorrect">
                <app-mascot
                  [mood]="feedbackMascotMood"
                  size="sm"
                  [message]="feedbackMascotMessage"
                />

                <p class="feedback-text">
                  {{ feedback }}
                </p>
              </div>
            }
          }
        </section>
      </div>
    </main>
  `,
  styles: [`
    .review-page {
      min-height: 100vh;
      padding: 32px 20px;
      background:
        radial-gradient(circle at 12% 10%, rgba(214, 40, 40, 0.08), transparent 28%),
        radial-gradient(circle at 88% 18%, rgba(31, 95, 67, 0.12), transparent 30%),
        linear-gradient(135deg, var(--cream, #f8f4ec), #fffaf2);
      color: var(--text-main, #1f2933);
    }

    .review-shell {
      width: min(100%, 920px);
      margin: 0 auto;
    }

    .review-flag {
      position: relative;
      height: 8px;
      margin-bottom: 18px;
      border-radius: 999px;
      overflow: hidden;
      background:
        linear-gradient(
          90deg,
          var(--lb-red, #d62828) 0 28%,
          var(--white, #ffffff) 28% 72%,
          var(--lb-red, #d62828) 72% 100%
        );
    }

    .review-flag::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 14px;
      height: 10px;
      transform: translate(-50%, -50%);
      background: var(--cedar-green, #1f5f43);
      clip-path: polygon(
        50% 0%,
        76% 24%,
        62% 24%,
        90% 50%,
        70% 50%,
        100% 76%,
        58% 76%,
        58% 100%,
        42% 100%,
        42% 76%,
        0% 76%,
        30% 50%,
        10% 50%,
        38% 24%,
        24% 24%
      );
    }

    .review-topbar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    .review-card {
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid var(--border-soft, #e8ded0);
      border-radius: 28px;
      padding: 28px;
      box-shadow: var(--shadow-soft, 0 14px 35px rgba(31, 41, 51, 0.08));
    }

    .ghost-button,
    .primary-button {
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      font-weight: 800;
      font-size: 15px;
      transition:
        transform 0.14s ease,
        box-shadow 0.14s ease,
        background 0.14s ease,
        color 0.14s ease;
    }

    .ghost-button {
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
    }

    .primary-button {
      background: var(--cedar-green, #1f5f43);
      color: white;
      box-shadow: 0 10px 24px rgba(31, 95, 67, 0.24);
    }

    .ghost-button:hover,
    .primary-button:hover {
      transform: translateY(-1px);
    }

    .primary-button:disabled {
      opacity: 0.55;
      cursor: default;
    }

    .chip,
    .eyebrow,
    .mini-chip {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      border-radius: 999px;
      padding: 6px 10px;
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
      font-size: 13px;
      font-weight: 800;
    }

    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 900;
    }

    .state-panel,
    .review-hero {
      display: grid;
      gap: 20px;
      align-items: center;
    }

    .review-hero {
      grid-template-columns: minmax(0, 1fr) auto;
      margin-bottom: 24px;
    }

    .hero-copy h1 {
      margin: 8px 0 12px;
      font-size: clamp(32px, 4vw, 48px);
      line-height: 0.95;
      letter-spacing: -0.04em;
    }

    .review-progress-bar {
      height: 12px;
      border-radius: 999px;
      overflow: hidden;
      background: var(--cream-2, #efe7da);
      margin-bottom: 12px;
    }

    .review-progress-bar div {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--cedar-green, #1f5f43), #2f8b61);
    }

    .meta-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .options,
    .typed-answer {
      display: grid;
      gap: 12px;
    }

    .option-button {
      width: 100%;
      border: 2px solid #e7e1d6;
      border-radius: 18px;
      padding: 16px 18px;
      background: #fffdf8;
      color: #18251d;
      text-align: left;
      font-weight: 800;
      font-size: 15px;
      transition:
        background 0.14s ease,
        border-color 0.14s ease,
        transform 0.14s ease,
        box-shadow 0.14s ease;
    }

    .option-button:not(:disabled):hover {
      transform: translateY(-1px);
      border-color: var(--cedar-green, #1f5f43);
      background: #f8fbf6;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
    }

    .typed-answer input {
      padding: 14px;
      border: 1px solid #ddd;
      border-radius: 16px;
      font-size: 16px;
      background: white;
    }

    .feedback-panel {
      margin-top: 18px;
      border-radius: 22px;
      padding: 16px;
      border: 1px solid #d7ebd7;
      background: #f3faf3;
    }

    .feedback-panel.wrong {
      border-color: #ffd0d0;
      background: #fff4f4;
    }

    .feedback-text {
      margin: 12px 0 0;
      font-weight: 800;
      line-height: 1.45;
      color: #1f2933;
    }

    @media (max-width: 860px) {
      .review-hero {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 680px) {
      .review-page {
        padding: 20px 14px;
      }

      .review-card {
        padding: 20px;
      }
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
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loadReviewQueue();
  }

  get progressPercent(): number {
    if (this.reviewItems.length === 0) {
      return 0;
    }

    return ((this.index + 1) * 100) / this.reviewItems.length;
  }

  get currentMascotMood(): MascotMood {
    if (this.feedback) {
      return this.lastCorrect ? 'happy' : 'sad';
    }

    if (!this.currentItem) {
      return 'proud';
    }

    if (this.currentItem.failureCount >= 2) {
      return 'encouraging';
    }

    return this.currentItem.exerciseType === 'TYPE_ANSWER'
      ? 'thinking'
      : 'neutral';
  }

  get currentMascotMessage(): string {
    if (this.feedback) {
      return this.lastCorrect
        ? 'Bien. Cette carte repart plus loin.'
        : 'Pas grave. Elle reviendra.';
    }

    if (!this.currentItem) {
      return 'File vide.';
    }

    if (this.currentItem.failureCount >= 2) {
      return 'Celle-là mérite un peu plus d’attention.';
    }

    return 'Petite révision rapide. Pas besoin de stress.';
  }

  get feedbackMascotMood(): MascotMood {
    return this.lastCorrect ? 'happy' : 'sad';
  }

  get feedbackMascotMessage(): string {
    return this.lastCorrect
      ? 'Sah. C’était correct.'
      : 'Oops. On la reverra encore.';
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