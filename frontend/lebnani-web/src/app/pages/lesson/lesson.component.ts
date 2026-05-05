import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, LessonContentBlockResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="lesson-page">
      <section class="lesson-card">
        @if (loading) {
          <p>Chargement...</p>
        }

        @if (!loading && emptyLesson) {
          <h1>Leçon vide</h1>
          <p>Cette leçon n’a pas encore d’exercices.</p>
          <button type="button" class="primary-button" (click)="backToCourse()">Retour au parcours</button>
        }

        @if (!loading && !emptyLesson && readingMode && contentBlocks.length > 0) {
          <p class="progress">Cours</p>

          <div class="course-content">
            @for (block of contentBlocks; track block.id) {
              @if (block.type === 'HEADING') {
                <h1>{{ block.content }}</h1>
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

          <button type="button" class="primary-button next-button" (click)="startExercises()">
            Commencer les exercices
          </button>
        }

        @if (!loading && completed && result) {
          <p class="progress">Leçon terminée</p>

          <h1>Résultat</h1>

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

          <button type="button" class="primary-button" (click)="backToCourse()">Retour au parcours</button>
        }

        @if (!loading && !completed && !readingMode && exercise) {
          <p class="progress">Question {{ index + 1 }} / {{ exercises.length }}</p>

          <div class="question-progress-bar">
            <div [style.width.%]="((index + 1) * 100) / exercises.length"></div>
          </div>

          <h1>{{ exercise.promptFr }}</h1>

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
            <p class="feedback" [class.correct]="lastCorrect" [class.wrong]="!lastCorrect">
              {{ feedback }}
            </p>

            <button type="button" class="primary-button next-button" (click)="next()">
              Continuer
            </button>
          }
        }

        @if (!loading && errorMessage) {
          <p class="error">{{ errorMessage }}</p>
          <button type="button" class="primary-button" (click)="backToCourse()">Retour au parcours</button>
        }
      </section>
    </main>
  `,
    styles: [`
    .lesson-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px;
      background: #f5f2ea;
      font-family: Arial, sans-serif;
      color: #18251d;
    }

    .lesson-card {
      width: 100%;
      max-width: 760px;
      background: white;
      border-radius: 22px;
      padding: 32px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
    }

    h1 {
      margin: 0 0 24px;
      font-size: 28px;
    }

    p {
      margin: 0 0 18px;
      color: #667064;
    }

    .progress {
      font-weight: 700;
      color: #253d2c;
    }

    .course-content {
      display: grid;
      gap: 18px;
      margin-bottom: 24px;
    }

    .markdown-block {
      color: #2d3a30;
      line-height: 1.65;
    }

    :host ::ng-deep .markdown-block p {
      color: #2d3a30;
      margin-bottom: 14px;
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

    .note-block {
      background: #fff7df;
      color: #6a5320;
      border-radius: 14px;
      padding: 14px;
      line-height: 1.5;
      font-weight: 600;
    }

    .example-block {
      background: #f3faf3;
      color: #253d2c;
      border-radius: 14px;
      padding: 14px;
      line-height: 1.5;
      font-weight: 600;
    }

    .question-progress-bar {
      height: 10px;
      margin: 0 0 24px;
      background: #e7e1d6;
      border-radius: 999px;
      overflow: hidden;
    }

    .question-progress-bar div {
      height: 100%;
      background: #253d2c;
    }

    .options {
      display: grid;
      gap: 12px;
    }

    button {
      padding: 14px 18px;
      border: 0;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 700;
      font-size: 15px;
      transition:
        background 0.12s ease,
        color 0.12s ease,
        border-color 0.12s ease,
        transform 0.12s ease,
        box-shadow 0.12s ease;
    }

    button:disabled {
      cursor: default;
    }

    .primary-button {
      background: #253d2c;
      color: white;
    }

    .primary-button:disabled {
      opacity: 0.55;
    }

    .option-button {
      width: 100%;
      background: #fffdf8;
      color: #18251d;
      border: 2px solid #e7e1d6;
      text-align: left;
      box-shadow: none;
    }

    .option-button:not(:disabled):hover {
      transform: translateY(-1px);
      border-color: #253d2c;
      background: #f8fbf6;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
    }

    .option-button.selected {
      border-color: #253d2c;
      background: #eef4ed;
      color: #18251d;
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

    input {
      padding: 14px;
      border: 1px solid #ddd;
      border-radius: 14px;
      font-size: 16px;
    }

    input:disabled {
      background: #f4f1ea;
      color: #667064;
    }

    .feedback {
      margin-top: 18px;
      padding: 12px 14px;
      border-radius: 12px;
      font-weight: 700;
    }

    .feedback.correct {
      color: #1b7f3a;
      background: #f3faf3;
    }

    .feedback.wrong {
      color: #b00020;
      background: #fff1f1;
    }

    .next-button {
      width: 100%;
      margin-top: 12px;
    }

    .error {
      color: #b00020;
    }

    .result-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .result-grid div {
      border: 1px solid #eee8dc;
      background: #fffdf8;
      border-radius: 16px;
      padding: 16px;
    }

    .result-grid strong {
      display: block;
      font-size: 28px;
      color: #253d2c;
    }

    .result-grid span {
      display: block;
      margin-top: 4px;
      color: #667064;
      font-size: 14px;
    }

    .hint {
      background: #fff7df;
      color: #6a5320;
      border-radius: 14px;
      padding: 12px 14px;
      margin-bottom: 18px;
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
    const normalizedContent = content.replaceAll('\\n', '\n');

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