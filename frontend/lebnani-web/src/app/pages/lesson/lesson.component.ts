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
      @if (!exercise) {
        <p>Chargement...</p>
      }

      @if (exercise) {
        <h1>{{ exercise.promptFr }}</h1>

        <!-- MULTIPLE CHOICE -->
        @if (exercise.type === 'MULTIPLE_CHOICE') {
          @for (opt of exercise.options; track opt.id) {
            <button (click)="answerMC(opt.id)">
              {{ opt.text }}
            </button>
          }
        }

        <!-- TYPE ANSWER -->
        @if (exercise.type === 'TYPE_ANSWER') {
          <input [(ngModel)]="textAnswer" />
          <button (click)="answerText()">Valider</button>
        }

        @if (feedback) {
          <p>{{ feedback }}</p>
        }
      }
    </main>
  `
})
export class LessonComponent implements OnInit {
  lessonId!: number;
  attemptId!: number;

  exercises: any[] = [];
  index = 0;
  exercise: any;

  textAnswer = '';
  feedback = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.lessonId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.startLesson(this.lessonId).subscribe(start => {
      this.attemptId = start.attemptId;

      this.api.getExercises(this.lessonId).subscribe(ex => {
        this.exercises = ex;
        this.exercise = this.exercises[this.index];
      });
    });
  }

  next() {
    this.index++;

    if (this.index >= this.exercises.length) {
      this.api.completeLesson(this.attemptId).subscribe(() => {
        this.router.navigateByUrl('/course');
      });
      return;
    }

    this.exercise = this.exercises[this.index];
    this.feedback = '';
    this.textAnswer = '';
  }

  answerMC(optionId: number) {
    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      selectedOptionId: optionId
    }).subscribe(res => {
      this.feedback = res.correct ? 'Correct' : 'Faux';
      setTimeout(() => this.next(), 800);
    });
  }

  answerText() {
    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      answer: this.textAnswer
    }).subscribe(res => {
      this.feedback = res.correct ? 'Correct' : 'Faux';
      setTimeout(() => this.next(), 800);
    });
  }
}