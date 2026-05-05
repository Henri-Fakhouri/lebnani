import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, CourseProgressResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

interface UserProgressResponse {
  totalXp: number;
  completedLessons: number;
  currentStreak: number;
  longestStreak: number;
}

@Component({
  selector: 'app-course-progress',
  standalone: true,
  template: `
    <main class="course-page">
      <header class="topbar">
        <div>
          <h1>{{ progress?.courseTitle || 'Lebnani' }}</h1>
          <p>Ton parcours de libanais parlé</p>
        </div>

        <div class="topbar-actions">
          <button type="button" class="secondary" (click)="openReview()">Révisions</button>
          <button type="button" (click)="logout()">Déconnexion</button>
        </div>
      </header>

      @if (loading) {
        <p class="state">Chargement...</p>
      }

      @if (errorMessage) {
        <p class="state error">{{ errorMessage }}</p>
      }

      @if (progress) {
        <section class="summary-grid">
          <article class="summary-card main-summary">
            <strong>{{ progress.completedLessons }}/{{ progress.totalLessons }}</strong>
            <span>leçons terminées</span>

            <div class="progress-bar">
              <div [style.width.%]="progress.completionPercent"></div>
            </div>

            <p>{{ progress.completionPercent }}% du cours terminé</p>
          </article>

          <article class="summary-card stat-card">
            <strong>{{ userProgress?.totalXp ?? 0 }}</strong>
            <span>XP total</span>
          </article>

          <article class="summary-card stat-card">
            <strong>{{ userProgress?.currentStreak ?? 0 }}</strong>
            <span>jours de série</span>
          </article>

          <article class="summary-card stat-card">
            <strong>{{ userProgress?.longestStreak ?? 0 }}</strong>
            <span>meilleure série</span>
          </article>
        </section>

        <section class="units">
          @for (unit of progress.units; track unit.unitId) {
            <article class="unit-card">
              <div class="unit-header">
                <div>
                  <h2>{{ unit.displayOrder }}. {{ unit.title }}</h2>
                  <p>{{ unit.completedLessons }}/{{ unit.totalLessons }} leçons terminées</p>
                </div>
                <span>{{ unit.completionPercent }}%</span>
              </div>

              <div class="lesson-list">
                @for (lesson of unit.lessons; track lesson.lessonId) {
                  <button
                    type="button"
                    class="lesson-row"
                    [class.completed]="lesson.completed"
                    (click)="openLesson(lesson.lessonId)"
                  >
                    <div>
                      <strong>{{ lesson.title }}</strong>
                      <small>
                        {{ lesson.completed ? 'Meilleur score: ' + lesson.bestScorePercent + '%' : 'Nouvelle leçon' }}
                      </small>
                    </div>

                    <span>
                      {{ lesson.completed ? 'Rejouer' : 'Commencer' }}
                    </span>
                  </button>
                }
              </div>
            </article>
          }
        </section>
      }
    </main>
  `,
  styles: [`
    .course-page {
      min-height: 100vh;
      padding: 32px;
      background: #f5f2ea;
      font-family: Arial, sans-serif;
      color: #18251d;
    }

    .topbar {
      max-width: 960px;
      margin: 0 auto 24px;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
    }

    .topbar-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    h1, h2, p {
      margin: 0;
    }

    .topbar h1 {
      font-size: 34px;
    }

    .topbar p {
      color: #667064;
      margin-top: 4px;
    }

    button {
      padding: 10px 16px;
      border: 0;
      border-radius: 999px;
      background: #253d2c;
      color: white;
      cursor: pointer;
      font-weight: 700;
    }

    button.secondary {
      background: #eef4ed;
      color: #253d2c;
    }

    .summary-grid {
      max-width: 960px;
      margin: 0 auto 18px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 14px;
    }

    .summary-card,
    .unit-card {
      background: white;
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
    }

    .unit-card {
      max-width: 960px;
      margin: 0 auto 18px;
    }

    .summary-card strong {
      font-size: 32px;
      display: block;
    }

    .summary-card span,
    .summary-card p {
      color: #667064;
    }

    .stat-card {
      display: grid;
      align-content: center;
    }

    .stat-card strong {
      color: #253d2c;
    }

    .progress-bar {
      height: 12px;
      margin: 16px 0 8px;
      background: #e7e1d6;
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-bar div {
      height: 100%;
      background: #253d2c;
    }

    .unit-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: start;
      margin-bottom: 16px;
    }

    .unit-header p {
      margin-top: 4px;
      color: #667064;
    }

    .unit-header span {
      background: #eef4ed;
      color: #253d2c;
      border-radius: 999px;
      padding: 6px 12px;
      font-weight: 700;
    }

    .lesson-list {
      display: grid;
      gap: 10px;
    }

    .lesson-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border: 1px solid #eee8dc;
      border-radius: 14px;
      background: #fffdf8;
      color: #18251d;
      text-align: left;
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
    }

    .lesson-row:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
      border-color: #c9d8c7;
    }

    .lesson-row.completed {
      border-color: #cfe1cf;
      background: #f3faf3;
    }

    .lesson-row small {
      display: block;
      color: #667064;
      margin-top: 4px;
    }

    .lesson-row span {
      font-weight: 700;
    }

    .state {
      max-width: 960px;
      margin: 32px auto;
    }

    .error {
      color: #b00020;
    }

    @media (max-width: 800px) {
      .topbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CourseProgressComponent implements OnInit {
  progress: CourseProgressResponse | null = null;
  userProgress: UserProgressResponse | null = null;

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

    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    this.apiService.getCourseProgress(1).subscribe({
      next: progress => {
        this.progress = progress;
        this.loadUserProgress();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la progression.';
        this.loading = false;
      }
    });
  }

  loadUserProgress(): void {
    this.apiService.getUserProgress().subscribe({
      next: progress => {
        this.userProgress = progress;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les statistiques.';
        this.loading = false;
      }
    });
  }

  openLesson(lessonId: number): void {
    this.router.navigateByUrl('/lesson/' + lessonId);
  }

  openReview(): void {
    this.router.navigateByUrl('/review');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}