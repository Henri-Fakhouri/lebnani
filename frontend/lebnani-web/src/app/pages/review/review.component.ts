import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ApiService, ReviewItemResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MascotComponent, MascotMood } from '../../shared/mascot/mascot.component';

interface UnitFilter {
  id: number;
  title: string;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [FormsModule, MascotComponent],
  template: `
    <main class="review-page">
      <div class="review-shell">
        <div class="review-flag"></div>

        <header class="review-topbar">
          <button type="button" class="ghost-button" (click)="backToCourse()">← Parcours</button>

          @if (!loading && !sessionDone && filteredItems.length > 0) {
            <div class="progress-capsule">
              <div class="capsule-bar" [style.width.%]="progressPercent"></div>
              <span>{{ index + 1 }} / {{ filteredItems.length }}</span>
            </div>
          }
        </header>

        @if (loading) {
          <section class="review-card fade-in">
            <div class="state-panel">
              <app-mascot mood="thinking" size="lg" message="Je prépare la file de révision." />
            </div>
          </section>
        }

        @if (!loading) {
          <nav class="filter-bar fade-in">
            <button
              type="button"
              class="filter-tab"
              [class.active]="activeFilter === 'all'"
              (click)="applyFilter('all')"
            >
              Tout
              @if (allReviewItems.length > 0) {
                <span class="filter-count">{{ allReviewItems.length }}</span>
              }
            </button>

            @for (unit of unitFilters; track unit.id) {
              <button
                type="button"
                class="filter-tab"
                [class.active]="activeFilter === 'unit-' + unit.id"
                (click)="applyFilter('unit-' + unit.id)"
              >
                {{ unit.title }}
              </button>
            }

            @if (difficultItems.length > 0) {
              <button
                type="button"
                class="filter-tab filter-tab-difficult"
                [class.active]="activeFilter === 'difficult'"
                (click)="applyFilter('difficult')"
              >
                ⚠️ Difficile
                <span class="filter-count">{{ difficultItems.length }}</span>
              </button>
            }
          </nav>

          @if (errorMessage) {
            <section class="review-card fade-in">
              <div class="state-panel">
                <app-mascot mood="sad" size="lg" [message]="errorMessage" />
                <button type="button" class="primary-button" (click)="backToCourse()">
                  Retour au parcours
                </button>
              </div>
            </section>
          }

          @if (!errorMessage && filteredItems.length === 0 && !sessionDone) {
            <section class="review-card fade-in">
              <div class="state-panel">
                <app-mascot
                  mood="proud"
                  size="lg"
                  [message]="emptyQueueMessage"
                />
                <button type="button" class="primary-button" (click)="backToCourse()">
                  Retour au parcours
                </button>
              </div>
            </section>
          }

          @if (!errorMessage && sessionDone) {
            <section class="review-card fade-in">
              <div class="session-summary">
                <app-mascot
                  [mood]="summaryMascotMood"
                  size="lg"
                  [message]="summaryMascotMessage"
                />

                <div class="summary-stats">
                  <div class="summary-stat">
                    <strong>{{ sessionCorrect }}</strong>
                    <span>corrects</span>
                  </div>

                  <div class="summary-stat summary-stat-wrong">
                    <strong>{{ sessionTotal - sessionCorrect }}</strong>
                    <span>incorrects</span>
                  </div>

                  <div class="summary-stat summary-stat-xp">
                    <strong>+{{ sessionXp }}</strong>
                    <span>XP gagnés</span>
                  </div>
                </div>

                <div class="summary-score-bar">
                  <div [style.width.%]="summaryScorePercent"></div>
                </div>

                <div class="summary-actions">
                  <button type="button" class="ghost-button" (click)="restartSession()">
                    🔁 Recommencer
                  </button>

                  <button type="button" class="primary-button" (click)="backToCourse()">
                    Retour au parcours
                  </button>
                </div>
              </div>
            </section>
          }

          @if (!errorMessage && !sessionDone && currentItem && filteredItems.length > 0) {
            <section class="review-card">
              <div class="card-hero" [class.slide-out]="slideOut">
                <div class="card-hero-left">
                  <div class="item-meta-row">
                    <span class="item-unit-chip">{{ currentItem.unitTitle || 'Révision' }}</span>

                    @if (currentItem.failureCount >= 3) {
                      <span class="difficult-chip">⚠️ Difficile</span>
                    }
                  </div>

                  <h2 class="card-prompt">{{ currentItem.promptFr }}</h2>

                  <div class="spaced-rep-row">
                    <span class="rep-dot" [class.filled]="currentItem.successCount >= 1" title="1 réussite"></span>
                    <span class="rep-dot" [class.filled]="currentItem.successCount >= 2" title="2 réussites"></span>
                    <span class="rep-dot" [class.filled]="currentItem.successCount >= 3" title="Maîtrisé"></span>

                    <span class="rep-label">
                      @if (currentItem.successCount >= 3) {
                        Maîtrisé ✓
                      } @else {
                        {{ 3 - currentItem.successCount }} réussite(s) pour maîtriser
                      }
                    </span>
                  </div>
                </div>

                <app-mascot [mood]="cardMascotMood" size="sm" />
              </div>

              @if (!showFeedback && !answering) {
                <button type="button" class="hint-toggle" (click)="toggleHint()">
                  {{ hintButtonLabel }}
                </button>

                @if (showHint) {
                  <div class="hint-panel fade-in">{{ currentItem.correctAnswer }}</div>
                }
              }

              @if (showMultipleChoiceOptions) {
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

              @if (showTextInput) {
                <div class="typed-answer">
                  <input
                    [(ngModel)]="textAnswer"
                    [disabled]="answering"
                    [placeholder]="answerPlaceholder"
                    class="type-input"
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

              @if (showFeedback) {
                <div
                  class="feedback-panel fade-in"
                  [class.feedback-correct]="lastCorrect"
                  [class.feedback-wrong]="!lastCorrect"
                >
                  <div class="feedback-header">
                    <span class="feedback-icon">{{ lastCorrect ? '✓' : '✗' }}</span>
                    <span class="feedback-label">{{ lastCorrect ? 'Correct !' : 'Incorrect' }}</span>

                    @if (lastCorrect && lastXpAwarded > 0) {
                      <span class="xp-flash pop-in">+{{ lastXpAwarded }} XP ⭐</span>
                    }
                  </div>

                  @if (!lastCorrect) {
                    <div class="correct-reveal">
                      <span class="reveal-label">Bonne réponse :</span>
                      <strong class="reveal-value">{{ lastExpectedAnswer }}</strong>
                    </div>
                  }

                  <button type="button" class="next-btn" (click)="nextItem()">
                    {{ isLastItem ? 'Terminer la révision' : 'Suivant →' }}
                  </button>
                </div>
              }
            </section>
          }
        }
      </div>
    </main>
  `,
  styles: [`
    .review-page {
      min-height: 100vh;
      padding: 32px 20px;
      background:
        radial-gradient(circle at 12% 10%, rgba(214,40,40,0.08), transparent 28%),
        radial-gradient(circle at 88% 18%, rgba(31,95,67,0.12), transparent 30%),
        linear-gradient(135deg, var(--cream,#f8f4ec), #fffaf2);
      color: var(--text-main,#1f2933);
    }

    .review-shell {
      width: min(100%, 780px);
      margin: 0 auto;
      display: grid;
      gap: 18px;
    }

    .review-flag {
      position: relative;
      height: 8px;
      border-radius: 999px;
      overflow: hidden;
      background: linear-gradient(90deg, var(--lb-red,#d62828) 0 28%, #fff 28% 72%, var(--lb-red,#d62828) 72% 100%);
    }

    .review-flag::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 14px;
      height: 10px;
      transform: translate(-50%,-50%);
      background: var(--cedar-green,#1f5f43);
      clip-path: polygon(50% 0%,76% 24%,62% 24%,90% 50%,70% 50%,100% 76%,58% 76%,58% 100%,42% 100%,42% 76%,0% 76%,30% 50%,10% 50%,38% 24%,24% 24%);
    }

    .review-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .progress-capsule {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 999px;
      height: 28px;
      min-width: 120px;
      padding: 0 12px;
      background: #e8ded0;
      overflow: hidden;
      font-size: 13px;
      font-weight: 800;
    }

    .capsule-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background: linear-gradient(90deg, var(--cedar-green,#1f5f43), #2f8b61);
      border-radius: inherit;
      transition: width 0.4s ease;
      z-index: 0;
    }

    .progress-capsule span {
      position: relative;
      z-index: 1;
      color: white;
      mix-blend-mode: difference;
    }

    .filter-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 2px solid var(--border-soft,#e8ded0);
      border-radius: 999px;
      padding: 8px 16px;
      background: white;
      color: var(--text-main,#1f2933);
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.14s ease, border-color 0.14s ease, color 0.14s ease;
    }

    .filter-tab:hover {
      border-color: var(--cedar-green,#1f5f43);
    }

    .filter-tab.active {
      background: var(--cedar-green,#1f5f43);
      border-color: var(--cedar-green,#1f5f43);
      color: white;
    }

    .filter-tab-difficult.active {
      background: #92400e;
      border-color: #92400e;
    }

    .filter-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      border-radius: 999px;
      background: rgba(255,255,255,0.25);
      font-size: 11px;
      font-weight: 900;
      padding: 0 5px;
    }

    .filter-tab:not(.active) .filter-count {
      background: var(--cedar-green-soft,#dceee3);
      color: var(--cedar-green-dark,#143d2b);
    }

    .review-card {
      background: rgba(255,255,255,0.94);
      border: 1px solid var(--border-soft,#e8ded0);
      border-radius: 28px;
      padding: 28px;
      box-shadow: 0 14px 35px rgba(31,41,51,0.08);
      display: grid;
      gap: 20px;
    }

    .state-panel {
      display: grid;
      gap: 18px;
      place-items: center;
      padding: 8px;
    }

    .card-hero {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 14px;
      align-items: start;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }

    .card-hero.slide-out {
      transform: translateX(-48px);
      opacity: 0;
    }

    .item-meta-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .item-unit-chip,
    .difficult-chip {
      display: inline-flex;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 800;
    }

    .item-unit-chip {
      background: var(--cedar-green-soft,#dceee3);
      color: var(--cedar-green-dark,#143d2b);
    }

    .difficult-chip {
      background: #fef3c7;
      color: #92400e;
    }

    .card-prompt {
      margin: 0 0 12px;
      font-size: clamp(26px,4vw,42px);
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    .spaced-rep-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .rep-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--cedar-green,#1f5f43);
      background: transparent;
      transition: background 0.2s ease;
    }

    .rep-dot.filled {
      background: var(--cedar-green,#1f5f43);
    }

    .rep-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted,#65726a);
    }

    .hint-toggle {
      border: 0;
      background: transparent;
      color: var(--text-muted,#65726a);
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      text-align: left;
      padding: 0;
      transition: color 0.14s ease;
    }

    .hint-toggle:hover {
      color: var(--cedar-green,#1f5f43);
    }

    .hint-panel {
      padding: 12px 16px;
      border-radius: 16px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      font-weight: 800;
      color: #92400e;
      font-size: 16px;
    }

    .options {
      display: grid;
      gap: 10px;
    }

    .option-button {
      width: 100%;
      border: 2px solid #e7e1d6;
      border-radius: 18px;
      padding: 15px 18px;
      background: #fffdf8;
      color: #18251d;
      text-align: left;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      transition: background 0.14s ease, border-color 0.14s ease, transform 0.14s ease;
    }

    .option-button:not(:disabled):hover {
      transform: translateY(-1px);
      border-color: var(--cedar-green,#1f5f43);
      background: #f4faf7;
    }

    .option-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .typed-answer {
      display: grid;
      gap: 10px;
    }

    .type-input {
      padding: 14px 16px;
      border: 2px solid #e7e1d6;
      border-radius: 18px;
      font-size: 16px;
      font-weight: 700;
      background: white;
      color: #18251d;
      outline: none;
      transition: border-color 0.14s ease;
    }

    .type-input:focus {
      border-color: var(--cedar-green,#1f5f43);
    }

    .feedback-panel {
      border-radius: 22px;
      padding: 18px 20px;
      display: grid;
      gap: 12px;
      border: 2px solid;
    }

    .feedback-correct {
      border-color: #16a34a;
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    }

    .feedback-wrong {
      border-color: #dc2626;
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
    }

    .feedback-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .feedback-icon {
      font-size: 22px;
      font-weight: 900;
    }

    .feedback-label {
      font-size: 18px;
      font-weight: 900;
    }

    .xp-flash {
      display: inline-flex;
      border-radius: 999px;
      padding: 5px 12px;
      background: linear-gradient(135deg,#fef3c7,#fde68a);
      color: #92400e;
      font-size: 13px;
      font-weight: 900;
      margin-left: auto;
    }

    .correct-reveal {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 14px;
      background: rgba(255,255,255,0.7);
    }

    .reveal-label {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-muted,#65726a);
      white-space: nowrap;
    }

    .reveal-value {
      font-size: 17px;
      font-weight: 900;
      color: #14532d;
    }

    .next-btn {
      border: 0;
      border-radius: 999px;
      padding: 12px 20px;
      background: var(--cedar-green,#1f5f43);
      color: white;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      align-self: end;
      justify-self: end;
      transition: transform 0.14s ease;
    }

    .next-btn:hover {
      transform: translateY(-1px);
    }

    .session-summary {
      display: grid;
      gap: 22px;
      place-items: center;
      text-align: center;
      padding: 8px;
    }

    .summary-stats {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .summary-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      border-radius: 18px;
      padding: 14px 22px;
      background: #dcfce7;
      min-width: 80px;
    }

    .summary-stat strong {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: -0.04em;
      color: #14532d;
    }

    .summary-stat span {
      font-size: 12px;
      font-weight: 800;
      color: #166534;
    }

    .summary-stat-wrong {
      background: #fee2e2;
    }

    .summary-stat-wrong strong {
      color: #7f1d1d;
    }

    .summary-stat-wrong span {
      color: #991b1b;
    }

    .summary-stat-xp {
      background: #fef3c7;
    }

    .summary-stat-xp strong {
      color: #92400e;
    }

    .summary-stat-xp span {
      color: #a16207;
    }

    .summary-score-bar {
      width: 100%;
      height: 10px;
      border-radius: 999px;
      background: #fee2e2;
      overflow: hidden;
    }

    .summary-score-bar div {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--cedar-green,#1f5f43), #2f8b61);
      transition: width 0.8s ease;
    }

    .summary-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .primary-button,
    .ghost-button {
      border: 0;
      border-radius: 999px;
      padding: 13px 22px;
      font-weight: 800;
      font-size: 15px;
      cursor: pointer;
      transition: transform 0.14s ease, box-shadow 0.14s ease;
    }

    .primary-button {
      background: var(--cedar-green,#1f5f43);
      color: white;
      box-shadow: 0 10px 24px rgba(31,95,67,0.24);
    }

    .ghost-button {
      background: var(--cedar-green-soft,#dceee3);
      color: var(--cedar-green-dark,#143d2b);
    }

    .primary-button:hover,
    .ghost-button:hover {
      transform: translateY(-1px);
    }

    .primary-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.7);
      }

      70% {
        transform: scale(1.08);
      }

      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    .fade-in {
      animation: fadeIn 0.32s ease both;
    }

    .pop-in {
      animation: popIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
    }

    @media (max-width: 640px) {
      .review-page {
        padding: 20px 14px;
      }

      .review-card {
        padding: 20px 16px;
      }

      .card-hero {
        grid-template-columns: 1fr;
      }

      .summary-actions {
        flex-direction: column;
        width: 100%;
      }

      .summary-actions button {
        width: 100%;
      }
    }
  `]
})
export class ReviewComponent implements OnInit {
  allReviewItems: ReviewItemResponse[] = [];
  difficultItems: ReviewItemResponse[] = [];
  filteredItems: ReviewItemResponse[] = [];

  activeFilter = 'all';
  index = 0;
  textAnswer = '';
  showHint = false;

  showFeedback = false;
  lastCorrect = false;
  lastExpectedAnswer = '';
  lastXpAwarded = 0;
  answering = false;
  slideOut = false;

  sessionCorrect = 0;
  sessionTotal = 0;
  sessionXp = 0;
  sessionDone = false;

  loading = true;
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

    this.loadAll();
  }

  get currentItem(): ReviewItemResponse | null {
    return this.filteredItems[this.index] ?? null;
  }

  get isLastItem(): boolean {
    return this.index >= this.filteredItems.length - 1;
  }

  get progressPercent(): number {
    if (this.filteredItems.length === 0) {
      return 0;
    }

    return ((this.index + 1) * 100) / this.filteredItems.length;
  }

  get summaryScorePercent(): number {
    if (this.sessionTotal === 0) {
      return 0;
    }

    return (this.sessionCorrect * 100) / this.sessionTotal;
  }

  get unitFilters(): UnitFilter[] {
    const map = new Map<number, string>();

    for (const item of this.allReviewItems) {
      if (item.unitId && item.unitTitle) {
        map.set(item.unitId, item.unitTitle);
      }
    }

    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }

  get cardMascotMood(): MascotMood {
    if (!this.currentItem) {
      return 'neutral';
    }

    if (this.currentItem.failureCount >= 3) {
      return 'encouraging';
    }

    if (this.currentItem.successCount >= 2) {
      return 'happy';
    }

    return 'thinking';
  }

  get summaryMascotMood(): MascotMood {
    if (this.sessionTotal === 0) {
      return 'neutral';
    }

    const rate = this.sessionCorrect / this.sessionTotal;

    if (rate === 1) {
      return 'excited';
    }

    if (rate >= 0.7) {
      return 'happy';
    }

    if (rate >= 0.4) {
      return 'encouraging';
    }

    return 'sad';
  }

  get summaryMascotMessage(): string {
    if (this.sessionTotal === 0) {
      return 'Session terminée.';
    }

    const rate = this.sessionCorrect / this.sessionTotal;

    if (rate === 1) {
      return 'Parfait ! Zéro faute. Khalas.';
    }

    if (rate >= 0.7) {
      return 'Sah ! Bonne session.';
    }

    if (rate >= 0.4) {
      return 'Pas mal. Les mots finiront par rester.';
    }

    return 'C’était difficile. On repassera dessus.';
  }

  get emptyQueueMessage(): string {
    return this.activeFilter === 'difficult'
      ? 'Pas de mots difficiles. Bien joué.'
      : 'File vide. Rien à réviser pour le moment.';
  }

  get hintButtonLabel(): string {
    return this.showHint
      ? 'Cacher l’indice ▲'
      : 'Voir l’indice ▼';
  }

  get showMultipleChoiceOptions(): boolean {
    return !!this.currentItem
      && !this.showFeedback
      && this.currentItem.exerciseType === 'MULTIPLE_CHOICE'
      && this.currentItem.options.length > 0;
  }

  get showTextInput(): boolean {
    return !!this.currentItem
      && !this.showFeedback
      && !this.showMultipleChoiceOptions;
  }

  get answerPlaceholder(): string {
    if (!this.currentItem) {
      return 'Ta réponse...';
    }

    switch (this.currentItem.exerciseType) {
      case 'MATCH_PAIRS':
        return 'Ta réponse pour l’association...';
      case 'WORD_BANK_SENTENCE':
        return 'Écris la phrase complète...';
      case 'MULTIPLE_CHOICE':
        return 'Aucune option disponible, écris ta réponse...';
      default:
        return 'Ta réponse...';
    }
  }

  private loadAll(): void {
    let reviewDone = false;
    let difficultDone = false;

    this.apiService.getReviewQueue().subscribe({
      next: items => {
        this.allReviewItems = items;
        reviewDone = true;

        if (difficultDone) {
          this.finishLoading();
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la file de révision.';
        this.loading = false;
      }
    });

    this.apiService.getDifficultItems().subscribe({
      next: items => {
        this.difficultItems = items;
        difficultDone = true;

        if (reviewDone) {
          this.finishLoading();
        }
      },
      error: () => {
        difficultDone = true;

        if (reviewDone) {
          this.finishLoading();
        }
      }
    });
  }

  private finishLoading(): void {
    this.filteredItems = this.allReviewItems;
    this.loading = false;
  }

  applyFilter(filter: string): void {
    this.activeFilter = filter;
    this.resetSession();

    if (filter === 'all') {
      this.filteredItems = this.allReviewItems;
      return;
    }

    if (filter === 'difficult') {
      this.filteredItems = this.difficultItems;
      return;
    }

    if (filter.startsWith('unit-')) {
      const unitId = Number.parseInt(filter.replace('unit-', ''), 10);
      this.filteredItems = this.allReviewItems.filter(item => item.unitId === unitId);
    }
  }

  private resetSession(): void {
    this.index = 0;
    this.sessionCorrect = 0;
    this.sessionTotal = 0;
    this.sessionXp = 0;
    this.sessionDone = false;
    this.showFeedback = false;
    this.answering = false;
    this.textAnswer = '';
    this.showHint = false;
    this.slideOut = false;
    this.lastCorrect = false;
    this.lastExpectedAnswer = '';
    this.lastXpAwarded = 0;
  }

  toggleHint(): void {
    this.showHint = !this.showHint;
  }

  answer(answerText: string): void {
    const trimmedAnswer = answerText.trim();

    if (!this.currentItem || this.answering || !trimmedAnswer) {
      return;
    }

    this.answering = true;
    this.showHint = false;

    this.apiService.answerReviewItem(this.currentItem.id, trimmedAnswer).subscribe({
      next: result => {
        this.lastCorrect = result.correct;
        this.lastExpectedAnswer = result.expectedAnswer ?? '';
        this.lastXpAwarded = result.xpAwarded ?? 0;
        this.showFeedback = true;
        this.answering = false;
        this.sessionTotal++;

        if (result.correct) {
          this.sessionCorrect++;
          this.sessionXp += result.xpAwarded ?? 0;
        }
      },
      error: () => {
        this.answering = false;
        this.errorMessage = 'Impossible de valider la réponse.';
      }
    });
  }

  nextItem(): void {
    this.showFeedback = false;
    this.textAnswer = '';
    this.lastExpectedAnswer = '';
    this.lastXpAwarded = 0;
    this.showHint = false;

    if (this.isLastItem) {
      this.sessionDone = true;
      return;
    }

    this.slideOut = true;

    setTimeout(() => {
      this.index++;
      this.slideOut = false;
    }, 250);
  }

  restartSession(): void {
    this.resetSession();
  }

  backToCourse(): void {
    this.router.navigateByUrl('/course');
  }
}