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

        @if (!loading && exercise) {
          <p class="progress">Question {{ index + 1 }} / {{ exercises.length }}</p>

          <h1>{{ exercise.promptFr }}</h1>

          @if (exercise.type === 'MULTIPLE_CHOICE') {
            <div class="options">
              @for (opt of exercise.options; track opt.id) {
                <button type="button" (click)="answerMC(opt.id)" [disabled]="answering">
                  {{ opt.text }}
                </button>
              }
            </div>
          }

          @if (exercise.type === 'TYPE_ANSWER') {
            <div class="typed-answer">
              <input
                [(ngModel)]="textAnswer"
                [disabled]="answering"
                placeholder="Ta réponse"
                (keyup.enter)="answerText()"
              />
              <button type="button" (click)="answerText()" [disabled]="answering">
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
      max-width: 640px;
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
        next: () => this.router.navigateByUrl('/course'),
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
    if (this.answering) {
      return;
    }

    this.answering = true;

    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      selectedOptionId: optionId
    }).subscribe({
      next: res => this.handleAnswerResult(res.correct),
      error: () => {
        this.answering = false;
        this.errorMessage = 'Impossible de valider la réponse.';
      }
    });
  }

  answerText(): void {
    if (this.answering || !this.textAnswer.trim()) {
      return;
    }

    this.answering = true;

    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      answer: this.textAnswer
    }).subscribe({
      next: res => this.handleAnswerResult(res.correct),
      error: () => {
        this.answering = false;
        this.errorMessage = 'Impossible de valider la réponse.';
      }
    });
  }

  handleAnswerResult(correct: boolean): void {
    this.lastCorrect = correct;
    this.feedback = correct ? 'Correct' : 'Faux';

    setTimeout(() => this.next(), 800);
  }

  backToCourse(): void {
    this.router.navigateByUrl('/course');
  }
}