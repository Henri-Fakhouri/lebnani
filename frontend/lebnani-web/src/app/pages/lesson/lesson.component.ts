import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';

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
          <button type="button" (click)="backToCourse()">Retour au parcours</button>
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

          <button type="button" (click)="backToCourse()">Retour au parcours</button>
        }

        @if (!loading && !completed && exercise) {
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

            <button type="button" class="next-button" (click)="next()">
              Continuer
            </button>
          }
        }

        @if (!loading && errorMessage) {
          <p class="error">{{ errorMessage }}</p>
          <button type="button" (click)="backToCourse()">Retour au parcours</button>
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
      max-width: 680px;
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

  exercises: any[] = [];
  index = 0;
  exercise: any = null;

  textAnswer = '';
  feedback = '';
  lastCorrect = false;

  loading = true;
  answering = false;
  emptyLesson = false;
  completed = false;
  result: any = null;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.lessonId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getExercises(this.lessonId).subscribe({
      next: exercises => {
        this.exercises = exercises;

        if (this.exercises.length === 0) {
          this.loading = false;
          this.emptyLesson = true;
          return;
        }

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
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les exercices.';
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
    this.answering = false;
  }

  answerMC(optionId: number): void {
    if (this.answering || this.feedback) {
      return;
    }

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

  backToCourse(): void {
    this.router.navigateByUrl('/course');
  }
}