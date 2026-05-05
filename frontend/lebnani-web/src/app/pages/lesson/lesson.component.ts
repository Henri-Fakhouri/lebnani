import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';

import { ApiService, LessonContentBlockResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MascotComponent } from '../../shared/mascot/mascot.component';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [FormsModule, MascotComponent],
  template: `
    <main class="lesson-page">
      <div class="lesson-shell">
        <div class="lesson-topbar">
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
              message="Je prépare ta leçon... yalla."
            />
          </section>
        }

        @if (!loading && emptyLesson) {
          <section class="state-card">
            <div>
              <span class="lesson-chip">Leçon vide</span>
              <h1>Leçon vide</h1>
              <p>Cette leçon n’a pas encore d’exercices.</p>
            </div>

            <app-mascot
              size="md"
              mood="sleepy"
              message="Rien à pratiquer ici pour le moment."
            />

            <button type="button" class="primary-button" (click)="backToCourse()">
              Retour au parcours
            </button>
          </section>
        }

        @if (!loading && !emptyLesson && readingMode && contentBlocks.length > 0) {
          <section class="lesson-hero">
            <div>
              <span class="lesson-chip">Cours</span>
              <h1>{{ lessonTitle }}</h1>
              <p>
                Lis l’explication, repère les mots importants, puis passe aux exercices.
              </p>
            </div>

            <app-mascot
              size="md"
              mood="happy"
              message="D’abord on comprend. Ensuite on pratique."
            />
          </section>

          <section class="content-card">
            <div class="course-content">
              @for (block of contentBlocks; track block.id) {
                @if (block.type === 'HEADING') {
                  <div class="content-heading-block">
                    <span>Sujet</span>
                    <h2>{{ block.content }}</h2>
                  </div>
                }

                @if (block.type === 'MARKDOWN') {
                  <div class="markdown-block" [innerHTML]="renderMarkdown(block.content)"></div>
                }

                @if (block.type === 'NOTE') {
                  <div class="note-block">
                    <span>À retenir</span>
                    <p>{{ block.content }}</p>
                  </div>
                }

                @if (block.type === 'EXAMPLE') {
                  <div class="example-block">
                    <span>Exemple libanais</span>
                    <p>{{ block.content }}</p>
                  </div>
                }
              }
            </div>

            <button type="button" class="primary-button next-button" (click)="startExercises()">
              Commencer les exercices
            </button>
          </section>
        }

        @if (!loading && completed && result) {
          <section class="result-card">
            <div class="result-header">
              <div>
                <span class="lesson-chip success-chip">Leçon terminée</span>
                <h1>Résultat</h1>
                <p>{{ result.scorePercent }}% de réussite. Yalla, on avance.</p>
              </div>

              <app-mascot
                size="lg"
                mood="proud"
                [message]="result.xpAwarded === 0 ? 'Déjà validée, mais réviser reste utile.' : 'Bravo. XP gagnés.'"
              />
            </div>

            <div class="result-grid">
              <div>
                <strong>{{ result.scorePercent }}%</strong>
                <span>score</span>
              </div>

              <div>
                <strong>{{ result.correctAnswers }}/{{ result.totalExercises }}</strong>
                <span>bonnes réponses</span>
              </div>

              <div>
                <strong>{{ result.xpAwarded }}</strong>
                <span>XP gagnés</span>
              </div>
            </div>

            @if (result.xpAwarded === 0) {
              <p class="hint">
                Cette leçon était déjà terminée, donc aucun XP supplémentaire n’a été accordé.
              </p>
            }

            <button type="button" class="primary-button" (click)="backToCourse()">
              Retour au parcours
            </button>
          </section>
        }

        @if (!loading && !completed && !readingMode && exercise) {
          <section class="exercise-card">
            <div class="exercise-header">
              <div>
                <span class="lesson-chip">Question {{ index + 1 }} / {{ exercises.length }}</span>
                <h1>{{ exercise.promptFr }}</h1>
              </div>

              <div class="question-progress-bar">
                <div [style.width.%]="((index + 1) * 100) / exercises.length"></div>
              </div>
            </div>

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

            @if (feedback) {
              <div class="feedback-panel" [class.correct]="lastCorrect" [class.wrong]="!lastCorrect">
                <app-mascot
                  size="sm"
                  [mood]="lastCorrect ? 'excited' : 'thinking'"
                  [message]="feedback"
                />

                <button type="button" class="primary-button next-button" (click)="next()">
                  Continuer
                </button>
              </div>
            }
          </section>
        }

        @if (!loading && errorMessage) {
          <section class="error-card">
            <app-mascot
              size="sm"
              mood="wrong"
              [message]="errorMessage"
            />

            <button type="button" class="primary-button" (click)="backToCourse()">
              Retour au parcours
            </button>
          </section>
        }
      </div>
    </main>
  `,
  styles: [`
    .lesson-page {
      min-height: 100vh;
      padding: 28px 18px 48px;
      color: var(--text-main);
      background:
        radial-gradient(circle at 10% 8%, rgba(214, 40, 40, 0.10), transparent 260px),
        radial-gradient(circle at 90% 12%, rgba(31, 95, 67, 0.14), transparent 300px),
        linear-gradient(135deg, var(--cream), #fffaf2);
    }

    .lesson-shell {
      width: min(100%, 920px);
      margin: 0 auto;
    }

    .lesson-topbar {
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

    .lesson-hero,
    .content-card,
    .exercise-card,
    .result-card,
    .state-card,
    .error-card {
      border: 1px solid var(--border-soft);
      border-radius: 32px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: var(--shadow-lifted);
    }

    .lesson-hero {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 28px;
      align-items: center;
      margin-bottom: 18px;
      padding: 30px;
      overflow: hidden;
      position: relative;
    }

    .lesson-hero::before {
      content: "";
      position: absolute;
      right: -60px;
      top: -70px;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: rgba(31, 95, 67, 0.08);
    }

    .lesson-hero > * {
      position: relative;
      z-index: 1;
    }

    .lesson-chip {
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

    .lesson-hero h1 {
      max-width: 560px;
      margin-top: 14px;
      font-size: clamp(42px, 6vw, 68px);
    }

    .lesson-hero p {
      max-width: 540px;
      margin: 16px 0 0;
      color: var(--text-muted);
      font-size: 17px;
      font-weight: 650;
      line-height: 1.55;
    }

    .content-card,
    .exercise-card,
    .result-card,
    .state-card,
    .error-card {
      padding: 28px;
    }

    .course-content {
      display: grid;
      gap: 18px;
      margin-bottom: 24px;
    }

    .content-heading-block {
      padding: 20px;
      border-radius: 24px;
      background:
        linear-gradient(135deg, var(--cedar-green-soft), rgba(255, 255, 255, 0.88));
      border: 1px solid rgba(31, 95, 67, 0.15);
    }

    .content-heading-block span,
    .note-block span,
    .example-block span {
      display: inline-flex;
      margin-bottom: 10px;
      color: var(--cedar-green-dark);
      font-size: 12px;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .content-heading-block h2 {
      font-size: 34px;
    }

    .markdown-block {
      padding: 22px;
      border: 1px solid var(--border-soft);
      border-radius: 24px;
      background: #fffdf8;
      color: #2d3a30;
      font-size: 16px;
      line-height: 1.7;
    }

    :host ::ng-deep .markdown-block p {
      color: #2d3a30;
      margin: 0 0 14px;
    }

    :host ::ng-deep .markdown-block p:last-child {
      margin-bottom: 0;
    }

    :host ::ng-deep .markdown-block strong {
      color: var(--lb-red-dark);
      font-weight: 950;
    }

    :host ::ng-deep .markdown-block table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 16px 0;
      overflow: hidden;
      border: 1px solid var(--border-soft);
      border-radius: 16px;
    }

    :host ::ng-deep .markdown-block th,
    :host ::ng-deep .markdown-block td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-soft);
      text-align: left;
    }

    :host ::ng-deep .markdown-block th {
      color: var(--cedar-green-dark);
      background: var(--cedar-green-soft);
      font-weight: 950;
    }

    :host ::ng-deep .markdown-block td {
      color: var(--text-main);
      background: var(--white);
      font-weight: 650;
    }

    :host ::ng-deep .markdown-block tr:last-child td {
      border-bottom: 0;
    }

    .note-block,
    .example-block {
      border-radius: 22px;
      padding: 18px;
      line-height: 1.5;
      font-weight: 750;
    }

    .note-block {
      color: #6a5320;
      background: #fff7df;
      border: 1px solid rgba(244, 185, 66, 0.45);
    }

    .example-block {
      color: var(--cedar-green-dark);
      background: #f3faf3;
      border: 1px solid rgba(31, 95, 67, 0.18);
    }

    .note-block p,
    .example-block p {
      margin: 0;
    }

    .exercise-card {
      width: min(100%, 760px);
      margin: 0 auto;
    }

    .exercise-header {
      display: grid;
      gap: 18px;
      margin-bottom: 24px;
    }

    .exercise-header h1 {
      margin-top: 16px;
      font-size: clamp(30px, 4vw, 44px);
      line-height: 1.05;
    }

    .question-progress-bar {
      height: 12px;
      overflow: hidden;
      border-radius: 999px;
      background: var(--cream-2);
    }

    .question-progress-bar div {
      height: 100%;
      border-radius: inherit;
      background:
        linear-gradient(
          90deg,
          var(--lb-red) 0 20%,
          var(--cedar-green) 20% 100%
        );
    }

    .options {
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

    .typed-answer {
      display: grid;
      gap: 12px;
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

    .result-header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      align-items: center;
      margin-bottom: 24px;
    }

    .result-header h1 {
      margin-top: 16px;
      color: var(--cedar-green);
      font-size: clamp(46px, 7vw, 78px);
    }

    .result-header p {
      max-width: 520px;
      margin: 12px 0 0;
      color: var(--text-muted);
      font-size: 17px;
      font-weight: 700;
      line-height: 1.5;
    }

    .result-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }

    .result-grid div {
      padding: 18px;
      border: 1px solid var(--border-soft);
      border-radius: 22px;
      background: #fffdf8;
    }

    .result-grid strong {
      display: block;
      color: var(--cedar-green-dark);
      font-size: 34px;
      font-weight: 950;
      letter-spacing: -0.04em;
    }

    .result-grid span {
      display: block;
      margin-top: 4px;
      color: var(--text-muted);
      font-weight: 800;
    }

    .hint {
      padding: 14px 16px;
      border-radius: 18px;
      color: #6a5320;
      background: #fff7df;
      font-weight: 750;
    }

    .state-card,
    .error-card {
      display: grid;
      gap: 18px;
      justify-items: start;
    }

    .state-card h1 {
      margin: 12px 0 8px;
      font-size: 38px;
    }

    .state-card p {
      margin: 0;
      color: var(--text-muted);
      font-weight: 700;
    }

    .error-card {
      margin-top: 18px;
      border-color: rgba(214, 40, 40, 0.25);
      background: var(--lb-red-soft);
    }

    @media (max-width: 780px) {
      .lesson-hero,
      .result-header {
        grid-template-columns: 1fr;
      }

      .result-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 560px) {
      .lesson-page {
        padding: 18px 12px 34px;
      }

      .lesson-hero,
      .content-card,
      .exercise-card,
      .result-card,
      .state-card,
      .error-card {
        border-radius: 24px;
        padding: 20px;
      }

      .lesson-hero h1 {
        font-size: 42px;
      }

      .flag-stripe {
        width: 150px;
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
    private readonly router: Router
  ) {}

  get lessonTitle(): string {
    return this.contentBlocks.find(block => block.type === 'HEADING')?.content ?? `Leçon ${this.lessonId}`;
  }

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

  loadExercises(): void {
    this.api.getExercises(this.lessonId).subscribe({
      next: exercises => {
        this.exercises = exercises;

        if (this.exercises.length === 0) {
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

  handleAnswerResult(correct: boolean, expectedAnswer: string): void {
    this.lastCorrect = correct;
    this.feedback = correct
      ? 'Correct'
      : `Incorrect. Réponse attendue : ${expectedAnswer}`;
    this.answering = false;
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