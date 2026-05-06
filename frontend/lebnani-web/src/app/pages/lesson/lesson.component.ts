import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import { ApiService, LessonContentBlockResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MascotComponent, MascotMood } from '../../shared/mascot/mascot.component';
import { SoundService } from '../../core/sound.service';
import { MatchPairsExerciseComponent } from './match-pairs-exercise.component';
import { WordBankSentenceExerciseComponent } from './word-bank-sentence-exercise.component';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [FormsModule, MascotComponent, MatchPairsExerciseComponent, WordBankSentenceExerciseComponent],
  template: `
    <main class="lesson-page">
      <div class="lesson-shell">
        <div class="lesson-flag"></div>

        <header class="lesson-topbar">
          <button type="button" class="ghost-button" (click)="backToCourse()">
            ← Parcours
          </button>

          @if (!loading && !completed && !readingMode && exercise) {
            <span class="chip">
              Question {{ index + 1 }} / {{ exercises.length }}
            </span>
          }

          @if (!loading && readingMode && !emptyLesson && contentBlocks.length > 0) {
            <span class="chip">
              Cours
            </span>
          }

          @if (!loading && completed && result) {
            <span class="chip chip-gold">
              Leçon terminée
            </span>
          }
        </header>

        <section class="lesson-card">
          @if (loading) {
            <div class="state-panel">
              <app-mascot
                mood="thinking"
                size="lg"
                message="Je charge la leçon. Deux secondes."
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

              <div class="state-actions">
                <button type="button" class="primary-button" (click)="backToCourse()">
                  Retour au parcours
                </button>
              </div>
            </div>
          }

          @if (!loading && !errorMessage && emptyLesson) {
            <div class="state-panel">
              <app-mascot
                mood="encouraging"
                size="lg"
                message="Cette leçon n’a pas encore d’exercices."
              />

              <h1 class="state-title">Leçon vide</h1>

              <div class="state-actions">
                <button type="button" class="primary-button" (click)="backToCourse()">
                  Retour au parcours
                </button>
              </div>
            </div>
          }

          @if (!loading && !errorMessage && !emptyLesson && readingMode && contentBlocks.length > 0) {
            <section class="reading-hero">
              <div class="hero-copy">
                <span class="eyebrow">Lecture rapide</span>
                <h1>On lit d’abord, puis on pratique.</h1>
                <p>
                  Le but est simple : comprendre les bases avant de répondre.
                </p>
              </div>

              <app-mascot
                mood="proud"
                size="lg"
                message="Lis tranquillement. Après ça, on passe aux questions."
              />
            </section>

            <div class="course-content">
              @for (block of contentBlocks; track block.id) {
                @if (block.type === 'HEADING') {
                  <h2 class="content-heading">{{ block.content }}</h2>
                }

                @if (block.type === 'MARKDOWN') {
                  <div class="markdown-block" [innerHTML]="renderMarkdown(block.content)"></div>
                }

                @if (block.type === 'NOTE') {
                  <div class="note-block">
                    {{ block.content }}
                  </div>
                }

                @if (block.type === 'EXAMPLE') {
                  <div class="example-block">
                    {{ block.content }}
                  </div>
                }
              }
                       </div>

            @if (exercises.length > 0) {
              <button type="button" class="primary-button full-width next-button" (click)="startExercises()">
                Commencer les exercices
              </button>
            }

            @if (exercises.length === 0) {
              <button type="button" class="primary-button full-width next-button" (click)="completeCourseOnlyLesson()">
                Terminer la lecture
              </button>
            }
          }

          @if (!loading && !errorMessage && !completed && !readingMode && exercise) {
            <section class="exercise-hero">
              <div class="exercise-copy">
  <span [class]="exerciseTypeChipClass(exercise.type)">
    {{ exerciseTypeLabel(exercise.type) }}
  </span>

  @if (promptHasTarget(exercise.promptFr)) {
    <div class="prompt-stack">
      <span class="prompt-instruction">
        {{ promptInstruction(exercise.promptFr) }}
      </span>

      <h1 class="prompt-target">
        {{ promptTarget(exercise.promptFr) }}
      </h1>
    </div>
  } @else {
    <h1>{{ exercise.promptFr }}</h1>
  }

  <div class="question-progress-bar">
    <div [style.width.%]="questionProgressPercent"></div>
  </div>
</div>

              <app-mascot
                [mood]="currentMascotMood"
                size="md"
                [message]="currentMascotMessage"
              />
            </section>

            @if (exercise.type === 'MULTIPLE_CHOICE') {
              <div class="options">
                @for (opt of exercise.options; track opt.id) {
                  <button
                    type="button"
                    class="option-button"
                    [class.selected]="selectedOptionId === opt.id"
                    [class.correct-selected]="selectedOptionId === opt.id && feedback && lastCorrect"
                    [class.wrong-selected]="selectedOptionId === opt.id && feedback && !lastCorrect"
                    (click)="answerMC(opt.id)"
                    [disabled]="answering || !!feedback"
                  >
                    {{ opt.text }}
                  </button>
                }
              </div>
            }

            @if (exercise.type === 'TYPE_ANSWER') {
              <div class="typed-answer">
                <input
                  [(ngModel)]="textAnswer"
                  [disabled]="answering || !!feedback"
                  placeholder="Ta réponse"
                  (keyup.enter)="answerText()"
                />

                <button
                  type="button"
                  class="primary-button"
                  (click)="answerText()"
                  [disabled]="answering || !!feedback || !textAnswer.trim()"
                >
                  Valider
                </button>
              </div>
            }

                      @if (exercise.type === 'WORD_BANK_SENTENCE') {
            <app-word-bank-sentence-exercise
              [exercise]="exercise"
              [disabled]="answering || !!feedback"
              (submitted)="answerWordBankSentence($event)"
            />
          }
            
                      @if (exercise.type === 'MATCH_PAIRS') {
            <app-match-pairs-exercise
              [exercise]="exercise"
              [disabled]="answering || !!feedback"
              (completed)="answerMatchPairs($event)"
            />
          }
            
            @if (feedback) {
              <div class="feedback-panel" [class.correct]="lastCorrect" [class.wrong]="!lastCorrect">
                <div class="feedback-head">
                  <app-mascot
                    [mood]="feedbackMascotMood"
                    size="sm"
                    [message]="feedbackMascotMessage"
                  />
                </div>

                <p class="feedback-text">
                  {{ feedback }}
                </p>

                <button type="button" class="primary-button full-width next-button" (click)="next()">
                  Continuer
                </button>
              </div>
            }
          }

          @if (!loading && !errorMessage && completed && result) {
            <section class="result-hero">
              <div class="hero-copy">
                <span class="eyebrow">Résultat</span>
                <h1>Leçon terminée</h1>
                <p>
                  Voilà le résultat de cette tentative.
                </p>
              </div>

              <app-mascot
                [mood]="resultMascotMood"
                size="lg"
                [message]="resultMascotMessage"
              />
            </section>

            <div class="result-grid">
              <div class="result-item">
                <strong>{{ result.scorePercent }}%</strong>
                <span>score</span>
              </div>

              <div class="result-item">
                <strong>{{ result.correctAnswers }}/{{ result.totalExercises }}</strong>
                <span>bonnes réponses</span>
              </div>

              <div class="result-item">
                <strong>{{ result.xpAwarded }}</strong>
                <span>XP gagnés</span>
              </div>
            </div>

            @if (result.xpAwarded === 0) {
              <p class="hint">
                Cette leçon était déjà terminée, donc aucun XP supplémentaire n’a été accordé.
              </p>
            }

            <button type="button" class="primary-button full-width" (click)="backToCourse()">
              Retour au parcours
            </button>
          }
        </section>
      </div>
    </main>
  `,
  styles: [`
    .lesson-page {
      min-height: 100vh;
      padding: 32px 20px;
      background:
        radial-gradient(circle at 12% 10%, rgba(214, 40, 40, 0.08), transparent 28%),
        radial-gradient(circle at 88% 18%, rgba(31, 95, 67, 0.12), transparent 30%),
        linear-gradient(135deg, var(--cream, #f8f4ec), #fffaf2);
      color: var(--text-main, #1f2933);
    }

    .lesson-shell {
      width: min(100%, 980px);
      margin: 0 auto;
    }

    .lesson-flag {
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

    .lesson-flag::after {
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

    .lesson-topbar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }

    .lesson-card {
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

    .full-width {
      width: 100%;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      padding: 6px 10px;
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
      font-size: 13px;
      font-weight: 800;
    }

    .chip-gold {
      background: #fff1c9;
      color: #6f4c00;
    }

    .state-panel,
    .reading-hero,
    .exercise-hero,
    .result-hero {
      display: grid;
      gap: 20px;
      align-items: center;
    }

    .reading-hero,
    .exercise-hero,
    .result-hero {
      grid-template-columns: minmax(0, 1fr) auto;
      margin-bottom: 24px;
    }

    .hero-copy h1,
    .exercise-copy h1 {
      margin: 8px 0 12px;
      font-size: clamp(32px, 4vw, 48px);
      line-height: 0.95;
      letter-spacing: -0.04em;
    }

    .hero-copy p,
    .exercise-copy p,
    .state-panel p {
      margin: 0;
      color: var(--text-muted, #65726a);
      font-weight: 600;
      line-height: 1.5;
    }

        .exercise-type-chip {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding: 7px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .type-choice {
      color: var(--cedar-green-dark, #143d2b);
      background: var(--cedar-green-soft, #dceee3);
    }

    .type-written {
      color: #6f4c00;
      background: #fff1c9;
    }

    .type-match {
      color: var(--lb-red-dark, #a61f1f);
      background: var(--lb-red-soft, #fde2e2);
    }

    .type-sentence {
      color: #1b5f82;
      background: rgba(77, 168, 218, 0.16);
    }

    .prompt-stack {
      display: grid;
      gap: 6px;
    }

    .prompt-instruction {
      color: var(--text-muted, #65726a);
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    .prompt-target {
      color: var(--text-main, #1f2933);
      font-size: clamp(36px, 5vw, 58px);
      font-weight: 950;
      letter-spacing: -0.055em;
      line-height: 0.95;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      border-radius: 999px;
      padding: 6px 10px;
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .state-title {
      margin: 0;
      font-size: 32px;
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .state-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .question-progress-bar {
      height: 12px;
      margin-top: 16px;
      border-radius: 999px;
      overflow: hidden;
      background: var(--cream-2, #efe7da);
    }

    .question-progress-bar div {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--cedar-green, #1f5f43), #2f8b61);
    }

    .course-content {
      display: grid;
      gap: 18px;
      margin-bottom: 24px;
    }

    .content-heading {
      margin: 0;
      font-size: 28px;
      line-height: 1.05;
    }

    .markdown-block {
      color: #2d3a30;
      line-height: 1.65;
    }

    :host ::ng-deep .markdown-block p {
      color: #2d3a30;
      margin: 0 0 14px;
    }

    :host ::ng-deep .markdown-block strong {
      color: #18251d;
      font-weight: 800;
    }

    :host ::ng-deep .markdown-block table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e7e1d6;
    }

    :host ::ng-deep .markdown-block th,
    :host ::ng-deep .markdown-block td {
      border: 1px solid #e7e1d6;
      padding: 10px 12px;
      text-align: left;
    }

    :host ::ng-deep .markdown-block th {
      background: #eef4ed;
      color: #253d2c;
      font-weight: 800;
    }

    :host ::ng-deep .markdown-block td {
      background: #fffdf8;
      color: #18251d;
    }

    :host ::ng-deep .markdown-block ul,
    :host ::ng-deep .markdown-block ol {
      margin: 0 0 14px 22px;
      padding: 0;
    }

    :host ::ng-deep .markdown-block li {
      margin-bottom: 6px;
    }

    .note-block,
    .example-block {
      border-radius: 18px;
      padding: 16px;
      line-height: 1.55;
      font-weight: 700;
    }

    .note-block {
      background: #fff7df;
      color: #6a5320;
      border: 1px solid #f3e1a5;
    }

    .example-block {
      background: #f3faf3;
      color: #253d2c;
      border: 1px solid #d7ebd7;
    }

    .options {
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

    .option-button.selected {
      border-color: var(--cedar-green, #1f5f43);
      background: #eef4ed;
    }

    .option-button.correct-selected {
      border-color: #1b7f3a;
      background: #1b7f3a;
      color: white;
      box-shadow: 0 8px 18px rgba(27, 127, 58, 0.18);
    }

    .option-button.wrong-selected {
      border-color: #b00020;
      background: #b00020;
      color: white;
      box-shadow: 0 8px 18px rgba(176, 0, 32, 0.18);
    }

    .option-button:disabled:not(.correct-selected):not(.wrong-selected) {
      opacity: 0.55;
      background: #f4f1ea;
      color: #667064;
      border-color: #e7e1d6;
    }

    .typed-answer {
      display: grid;
      gap: 12px;
    }

    .typed-answer input {
      padding: 14px;
      border: 1px solid #ddd;
      border-radius: 16px;
      font-size: 16px;
      background: white;
    }

    .typed-answer input:disabled {
      background: #f4f1ea;
      color: #667064;
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

    .feedback-head {
      margin-bottom: 12px;
    }

    .feedback-text {
      margin: 0 0 14px;
      font-weight: 800;
      line-height: 1.45;
      color: #1f2933;
    }

    .result-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 20px;
    }

    .result-item {
      border: 1px solid #eee8dc;
      background: #fffdf8;
      border-radius: 18px;
      padding: 18px;
    }

    .result-item strong {
      display: block;
      font-size: 30px;
      color: var(--cedar-green, #1f5f43);
    }

    .result-item span {
      display: block;
      margin-top: 4px;
      color: var(--text-muted, #65726a);
      font-size: 14px;
      font-weight: 700;
    }

    .hint {
      margin: 0 0 18px;
      background: #fff7df;
      color: #6a5320;
      border: 1px solid #f3e1a5;
      border-radius: 16px;
      padding: 12px 14px;
      font-weight: 700;
    }

    @media (max-width: 900px) {
      .reading-hero,
      .exercise-hero,
      .result-hero {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 680px) {
      .lesson-page {
        padding: 20px 14px;
      }

      .lesson-card {
        padding: 20px;
      }

      .result-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LessonComponent implements OnInit {
  lessonId!: number;
  attemptId!: number;

  contentBlocks: LessonContentBlockResponse[] = [];
  exercises: any[] = [];
  index = 0;
  exercise: any = null;

  textAnswer = '';
  feedback = '';
  lastCorrect = false;
  selectedOptionId: number | null = null;

  loading = true;
  answering = false;
  readingMode = true;
  emptyLesson = false;
  completed = false;
  result: any = null;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly soundService: SoundService
  ) { }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.lessonId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getLessonContent(this.lessonId).subscribe({
      next: contentBlocks => {
        this.contentBlocks = contentBlocks;
        this.loadExercises();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger le contenu de la leçon.';
      }
    });
  }

  get questionProgressPercent(): number {
    if (this.exercises.length === 0) {
      return 0;
    }

    return ((this.index + 1) * 100) / this.exercises.length;
  }

  get currentMascotMood(): MascotMood {
    if (!this.feedback) {
      if (this.exercise?.type === 'TYPE_ANSWER') {
        return 'thinking';
      }

      return 'neutral';
    }

    if (!this.lastCorrect) {
      return 'thinking';
    }

    if (this.isLastQuestion) {
      return 'celebrate';
    }

    return 'happy';
  }

  get currentMascotMessage(): string {
    if (!this.feedback) {
      if (this.exercise?.type === 'TYPE_ANSWER') {
        return 'Écris ce que tu entends ou ce que tu comprends.';
      }

      return 'Choisis la bonne réponse.';
    }

    if (!this.lastCorrect) {
      return 'Presque. Regarde bien et réessaie au prochain.';
    }

    if (this.isLastQuestion) {
      return 'Nickel. Encore une et on boucle.';
    }

    return 'Bien joué. Continue comme ça.';
  }

  get feedbackMascotMood(): MascotMood {
    if (!this.lastCorrect) {
      return 'sad';
    }

    if (this.isLastQuestion) {
      return 'celebrate';
    }

    return 'happy';
  }

    exerciseTypeLabel(type: string): string {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'Choix multiple';
      case 'TYPE_ANSWER':
        return 'Réponse écrite';
      case 'MATCH_PAIRS':
        return 'Association';
      case 'WORD_BANK_SENTENCE':
        return 'Phrase à construire';
      default:
        return 'Exercice';
    }
  }

  exerciseTypeChipClass(type: string): string {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'exercise-type-chip type-choice';
      case 'TYPE_ANSWER':
        return 'exercise-type-chip type-written';
      case 'MATCH_PAIRS':
        return 'exercise-type-chip type-match';
      case 'WORD_BANK_SENTENCE':
        return 'exercise-type-chip type-sentence';
      default:
        return 'exercise-type-chip';
    }
  }

  promptHasTarget(prompt: string): boolean {
    return prompt.includes(':');
  }

  promptInstruction(prompt: string): string {
    const split = this.splitPrompt(prompt);
    return split.instruction;
  }

  promptTarget(prompt: string): string {
    const split = this.splitPrompt(prompt);
    return split.target;
  }

  private splitPrompt(prompt: string): { instruction: string; target: string } {
    const separatorIndex = prompt.indexOf(':');

    if (separatorIndex < 0) {
      return {
        instruction: '',
        target: prompt
      };
    }

    return {
      instruction: prompt.slice(0, separatorIndex).trim(),
      target: prompt.slice(separatorIndex + 1).trim()
    };
  }

  get feedbackMascotMessage(): string {
    return this.lastCorrect
      ? 'Sah. Bonne réponse.'
      : 'Oops. Ce n’était pas ça.';
  }

  get resultMascotMood(): MascotMood {
    if (!this.result) {
      return 'proud';
    }

    if (this.result.scorePercent === 100) {
      return 'celebrate';
    }

    if (this.result.scorePercent >= 70) {
      return 'proud';
    }

    return 'encouraging';
  }

  get resultMascotMessage(): string {
    if (!this.result) {
      return 'Leçon terminée.';
    }

    if (this.result.scorePercent === 100) {
      return 'Parfait. Là c’est propre.';
    }

    if (this.result.scorePercent >= 70) {
      return 'C’est bien. La base est là.';
    }

    return 'On continue. La prochaine sera meilleure.';
  }

  get isLastQuestion(): boolean {
    return this.index === this.exercises.length - 1;
  }

  loadExercises(): void {
    this.api.getExercises(this.lessonId).subscribe({
      next: exercises => {
        this.exercises = exercises;

        if (this.exercises.length === 0 && this.contentBlocks.length === 0) {
          this.loading = false;
          this.emptyLesson = true;
          return;
        }

        if (this.contentBlocks.length === 0) {
          this.startExercises();
          return;
        }

        this.loading = false;
        this.readingMode = true;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les exercices.';
      }
    });
  }

  startExercises(): void {
    this.loading = true;
    this.readingMode = false;

    this.api.startLesson(this.lessonId).subscribe({
      next: start => {
        this.attemptId = start.attemptId;
        this.exercise = this.exercises[this.index];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de démarrer la leçon.';
      }
    });
  }


  completeCourseOnlyLesson(): void {
    if (this.answering || this.completed) {
      return;
    }

    this.loading = true;
    this.answering = true;

    this.api.startLesson(this.lessonId).subscribe({
      next: start => {
        this.attemptId = start.attemptId;

        this.api.completeLesson(this.attemptId).subscribe({
          next: result => {
            this.result = result;
            this.completed = true;
            this.readingMode = false;
            this.exercise = null;
            this.feedback = '';
            this.answering = false;
            this.loading = false;
            this.soundService.playComplete();
          },
          error: () => {
            this.answering = false;
            this.loading = false;
            this.errorMessage = 'Impossible de terminer la lecture.';
          }
        });
      },
      error: () => {
        this.answering = false;
        this.loading = false;
        this.errorMessage = 'Impossible de démarrer la lecture.';
      }
    });
  }

  next(): void {
    this.index++;

    if (this.index >= this.exercises.length) {
      this.api.completeLesson(this.attemptId).subscribe({
        next: result => {
          this.result = result;
          this.completed = true;
          this.exercise = null;
          this.feedback = '';
          this.answering = false;
          this.selectedOptionId = null;
          this.soundService.playComplete();
        },
        error: () => {
          this.answering = false;
          this.errorMessage = 'Impossible de terminer la leçon.';
        }
      });
      return;
    }

    this.exercise = this.exercises[this.index];
    this.feedback = '';
    this.textAnswer = '';
    this.selectedOptionId = null;
    this.answering = false;
  }

  answerMC(optionId: number): void {
    if (this.answering || this.feedback) {
      return;
    }

    this.selectedOptionId = optionId;
    this.answering = true;

    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      selectedOptionId: optionId
    }).subscribe({
      next: res => this.handleAnswerResult(res.correct, res.expectedAnswer),
      error: () => {
        this.answering = false;
        this.errorMessage = 'Impossible de valider la réponse.';
      }
    });
  }

  answerText(): void {
    if (this.answering || this.feedback || !this.textAnswer.trim()) {
      return;
    }

    this.answering = true;

    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      answer: this.textAnswer
    }).subscribe({
      next: res => this.handleAnswerResult(res.correct, res.expectedAnswer),
      error: () => {
        this.answering = false;
        this.errorMessage = 'Impossible de valider la réponse.';
      }
    });
  }

  answerMatchPairs(answer: string): void {
    if (this.answering || this.feedback || !answer.trim()) {
      return;
    }

    this.answering = true;

    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      answer
    }).subscribe({
      next: res => this.handleAnswerResult(res.correct, res.expectedAnswer),
      error: () => {
        this.answering = false;
        this.errorMessage = 'Impossible de valider les paires.';
      }
    });
  }

  answerWordBankSentence(answer: string): void {
    if (this.answering || this.feedback || !answer.trim()) {
      return;
    }

    this.answering = true;

    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      answer
    }).subscribe({
      next: res => this.handleAnswerResult(res.correct, res.expectedAnswer),
      error: () => {
        this.answering = false;
        this.errorMessage = 'Impossible de valider la phrase.';
      }
    });
  }

  handleAnswerResult(correct: boolean, expectedAnswer: string): void {
    this.lastCorrect = correct;
    this.feedback = correct
      ? 'Correct'
      : `Incorrect. Réponse attendue : ${expectedAnswer}`;
    this.answering = false;

    if (correct) {
      this.soundService.playCorrect();
      return;
    }

    this.soundService.playWrong();
  }

  renderMarkdown(content: string): string {
    const normalizedContent = content.replaceAll(String.raw`\n`, '\n');

    return marked.parse(normalizedContent, {
      async: false,
      gfm: true,
      breaks: true
    });
  }

  backToCourse(): void {
    this.router.navigateByUrl('/course');
  }
}