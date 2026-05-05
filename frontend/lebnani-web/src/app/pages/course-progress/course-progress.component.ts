import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, CourseProgressResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MascotComponent } from '../../shared/mascot/mascot.component';

interface UserProgressResponse {
  totalXp: number;
  completedLessons: number;
  currentStreak: number;
  longestStreak: number;
}

@Component({
  selector: 'app-course-progress',
  standalone: true,
  imports: [MascotComponent],
  template: `
    <main class="course-page">
      <div class="course-shell">
        <div class="flag-stripe"></div>

        <header class="hero-card">
          <div class="hero-copy">
            <span class="brand-chip">🇱🇧 Libanais parlé</span>

            <h1>{{ progress?.courseTitle || 'Lebnani' }}</h1>

            <p class="hero-subtitle">
              Apprends le libanais parlé pas à pas, avec des leçons courtes,
              des révisions, de l’XP et Arzi, ton petit cèdre coach.
            </p>

            @if (currentUser) {
              <p class="user-line">
                Mar7aba {{ currentUser.displayName }}
                <span>·</span>
                <strong>{{ currentUser.role }}</strong>
              </p>
            }

            <div class="hero-actions">
              @if (isAdmin) {
                <button type="button" class="ghost-button" (click)="openAdminImport()">Import JSON</button>
                <button type="button" class="ghost-button" (click)="openImportHistory()">Historique</button>
              }

              <button type="button" class="ghost-button review-button" (click)="openReview()">Révisions</button>
              <button type="button" class="logout-button" (click)="logout()">Déconnexion</button>
            </div>
          </div>

          <div class="hero-mascot">
            <app-mascot
              size="lg"
              mood="excited"
              [message]="mascotMessage()"
            />
          </div>
        </header>

        @if (loading) {
          <section class="state-card">
            <app-mascot size="sm" mood="thinking" message="Je charge ton parcours..." />
          </section>
        }

        @if (errorMessage) {
          <section class="state-card error-state">
            <app-mascot size="sm" mood="wrong" [message]="errorMessage" />
          </section>
        }

        @if (progress) {
          <section class="stats-grid">
            <article class="stat-card progress-card">
              <div class="stat-header">
                <span class="stat-kicker">Progression</span>
                <strong>{{ progress.completionPercent }}%</strong>
              </div>

              <h2>{{ progress.completedLessons }}/{{ progress.totalLessons }} leçons terminées</h2>

              <div class="progress-track">
                <div [style.width.%]="progress.completionPercent"></div>
              </div>

              <p>
                @if (progress.completionPercent === 100) {
                  Khalas, ce cours est terminé. Tu peux rejouer ou réviser.
                } @else {
                  Continue comme ça. Chaque petite leçon ajoute quelque chose.
                }
              </p>
            </article>

            <article class="stat-card small-card xp-card">
              <span>XP total</span>
              <strong>{{ userProgress?.totalXp ?? 0 }}</strong>
              <small>points gagnés</small>
            </article>

            <article class="stat-card small-card streak-card">
              <span>Série</span>
              <strong>{{ userProgress?.currentStreak ?? 0 }}</strong>
              <small>jours d’affilée</small>
            </article>

            <article class="stat-card small-card best-card">
              <span>Record</span>
              <strong>{{ userProgress?.longestStreak ?? 0 }}</strong>
              <small>meilleure série</small>
            </article>
          </section>

          <section class="path-header">
            <div>
              <span class="section-chip">Parcours</span>
              <h2>Choisis ta prochaine leçon</h2>
            </div>

            <p>
              Les cartes vertes sont déjà terminées. Les cartes blanches sont à commencer.
            </p>
          </section>

          <section class="units">
            @for (unit of progress.units; track unit.unitId) {
              <article
                class="unit-card"
                [class.unit-completed]="unit.completionPercent === 100"
              >
                <div class="unit-top">
                  <div class="unit-title-block">
                    <span class="unit-number">{{ unit.displayOrder }}</span>

                    <div>
                      <h3>{{ unit.title }}</h3>
                      <p>{{ unit.completedLessons }}/{{ unit.totalLessons }} leçons terminées</p>
                    </div>
                  </div>

                  <div class="unit-percent">
                    {{ unit.completionPercent }}%
                  </div>
                </div>

                <div class="mini-progress">
                  <div [style.width.%]="unit.completionPercent"></div>
                </div>

                <div class="lesson-path">
                  @for (lesson of unit.lessons; track lesson.lessonId) {
                    <button
                      type="button"
                      class="lesson-node"
                      [class.completed]="lesson.completed"
                      [class.perfect]="lesson.completed && lesson.bestScorePercent === 100"
                      (click)="openLesson(lesson.lessonId)"
                    >
                      <span class="lesson-icon">
                        @if (lesson.completed && lesson.bestScorePercent === 100) {
                          ★
                        } @else if (lesson.completed) {
                          ✓
                        } @else {
                          {{ lesson.displayOrder }}
                        }
                      </span>

                      <span class="lesson-content">
                        <strong>{{ lesson.title }}</strong>

                        <small>
                          @if (lesson.completed) {
                            Meilleur score : {{ lesson.bestScorePercent }}%
                          } @else {
                            Nouvelle leçon
                          }
                        </small>
                      </span>

                      <span class="lesson-action">
                        {{ lesson.completed ? 'Rejouer' : 'Commencer' }}
                      </span>
                    </button>
                  }
                </div>
              </article>
            }
          </section>
        }
      </div>
    </main>
  `,
  styles: [`
    .course-page {
      min-height: 100vh;
      padding: 28px 20px 48px;
      color: var(--text-main);
      background:
        radial-gradient(circle at top left, rgba(214, 40, 40, 0.10), transparent 260px),
        radial-gradient(circle at top right, rgba(31, 95, 67, 0.14), transparent 320px),
        linear-gradient(135deg, var(--cream), #fffaf2);
    }

    .course-shell {
      width: min(100%, 1040px);
      margin: 0 auto;
    }

    .flag-stripe {
      height: 10px;
      margin-bottom: 18px;
      border-radius: 999px;
      background:
        linear-gradient(
          90deg,
          var(--lb-red) 0 30%,
          var(--white) 30% 70%,
          var(--cedar-green) 70% 100%
        );
      box-shadow: 0 10px 22px rgba(31, 41, 51, 0.08);
    }

    .hero-card {
      position: relative;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 32px;
      align-items: center;
      overflow: hidden;
      padding: 34px;
      border: 1px solid var(--border-soft);
      border-radius: 34px;
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 250, 242, 0.92));
      box-shadow: var(--shadow-lifted);
    }

    .hero-card::before {
      content: "";
      position: absolute;
      inset: -70px -40px auto auto;
      width: 260px;
      height: 260px;
      border-radius: 50%;
      background: rgba(31, 95, 67, 0.08);
    }

    .hero-card::after {
      content: "";
      position: absolute;
      inset: auto auto -80px -80px;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      background: rgba(214, 40, 40, 0.07);
    }

    .hero-copy,
    .hero-mascot {
      position: relative;
      z-index: 1;
    }

    .brand-chip,
    .section-chip {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-radius: 999px;
      color: var(--cedar-green-dark);
      background: var(--cedar-green-soft);
      font-size: 13px;
      font-weight: 900;
    }

    .hero-card h1 {
      max-width: 560px;
      margin: 16px 0 0;
      color: var(--text-main);
      font-size: clamp(42px, 6vw, 72px);
      font-weight: 950;
      letter-spacing: -0.065em;
      line-height: 0.9;
    }

    .hero-subtitle {
      max-width: 610px;
      margin: 18px 0 0;
      color: var(--text-muted);
      font-size: 17px;
      font-weight: 650;
      line-height: 1.55;
    }

    .user-line {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin: 14px 0 0;
      color: var(--text-muted);
      font-weight: 750;
    }

    .user-line strong {
      color: var(--lb-red-dark);
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 22px;
    }

    button {
      border: 0;
      font-weight: 900;
      transition:
        transform 0.14s ease,
        box-shadow 0.14s ease,
        background 0.14s ease;
    }

    button:not(:disabled):hover {
      transform: translateY(-1px);
    }

    .ghost-button,
    .logout-button {
      padding: 11px 15px;
      border-radius: 999px;
    }

    .ghost-button {
      color: var(--cedar-green-dark);
      background: var(--cedar-green-soft);
    }

    .ghost-button:hover {
      box-shadow: 0 10px 18px rgba(31, 95, 67, 0.12);
    }

    .review-button {
      color: #6f4c00;
      background: #fff1c9;
    }

    .logout-button {
      color: var(--white);
      background: var(--cedar-green-dark);
      box-shadow: 0 12px 24px rgba(20, 61, 43, 0.22);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 2fr repeat(3, 1fr);
      gap: 14px;
      margin-top: 18px;
    }

    .stat-card,
    .unit-card,
    .state-card {
      border: 1px solid var(--border-soft);
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: var(--shadow-soft);
    }

    .stat-card {
      min-height: 148px;
      padding: 22px;
    }

    .progress-card {
      position: relative;
      overflow: hidden;
    }

    .progress-card::after {
      content: "";
      position: absolute;
      right: -30px;
      bottom: -40px;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: rgba(31, 95, 67, 0.07);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
      margin-bottom: 12px;
    }

    .stat-kicker,
    .small-card span {
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .stat-header strong {
      color: var(--cedar-green);
      font-size: 24px;
      font-weight: 950;
    }

    .progress-card h2 {
      margin: 0;
      font-size: 28px;
      letter-spacing: -0.04em;
    }

    .progress-card p {
      position: relative;
      z-index: 1;
      margin: 10px 0 0;
      color: var(--text-muted);
      font-weight: 650;
    }

    .progress-track,
    .mini-progress {
      overflow: hidden;
      border-radius: 999px;
      background: var(--cream-2);
    }

    .progress-track {
      height: 13px;
      margin-top: 18px;
    }

    .mini-progress {
      height: 9px;
      margin: 16px 0 18px;
    }

    .progress-track div,
    .mini-progress div {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--cedar-green), #2f8b61);
    }

    .small-card {
      display: grid;
      align-content: center;
      gap: 7px;
    }

    .small-card strong {
      color: var(--cedar-green-dark);
      font-size: 38px;
      font-weight: 950;
      letter-spacing: -0.05em;
    }

    .small-card small {
      color: var(--text-muted);
      font-weight: 700;
    }

    .xp-card strong {
      color: var(--lb-red);
    }

    .streak-card strong {
      color: #d17b00;
    }

    .best-card strong {
      color: var(--cedar-green);
    }

    .path-header {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: end;
      margin: 34px 0 16px;
    }

    .path-header h2 {
      margin: 10px 0 0;
      font-size: 34px;
      letter-spacing: -0.045em;
    }

    .path-header p {
      max-width: 360px;
      margin: 0;
      color: var(--text-muted);
      font-weight: 650;
      line-height: 1.45;
      text-align: right;
    }

    .units {
      display: grid;
      gap: 18px;
    }

    .unit-card {
      position: relative;
      overflow: hidden;
      padding: 24px;
    }

    .unit-card::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 8px;
      background: var(--lb-red);
    }

    .unit-card.unit-completed::before {
      background: var(--cedar-green);
    }

    .unit-top {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: center;
    }

    .unit-title-block {
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .unit-number {
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      border-radius: 16px;
      color: var(--white);
      background: var(--cedar-green);
      font-size: 20px;
      font-weight: 950;
      box-shadow: 0 10px 20px rgba(31, 95, 67, 0.20);
    }

    .unit-top h3 {
      margin: 0;
      font-size: 25px;
      letter-spacing: -0.035em;
    }

    .unit-top p {
      margin: 4px 0 0;
      color: var(--text-muted);
      font-weight: 700;
    }

    .unit-percent {
      min-width: 64px;
      padding: 8px 12px;
      border-radius: 999px;
      color: var(--cedar-green-dark);
      background: var(--cedar-green-soft);
      text-align: center;
      font-weight: 950;
    }

    .lesson-path {
      display: grid;
      gap: 10px;
    }

    .lesson-node {
      width: 100%;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 14px;
      align-items: center;
      padding: 14px;
      border: 2px solid var(--border-soft);
      border-radius: 20px;
      color: var(--text-main);
      background: #fffdf8;
      text-align: left;
      box-shadow: none;
    }

    .lesson-node:hover {
      border-color: rgba(31, 95, 67, 0.34);
      box-shadow: 0 12px 22px rgba(31, 41, 51, 0.08);
    }

    .lesson-node.completed {
      border-color: rgba(31, 95, 67, 0.26);
      background: linear-gradient(135deg, #f3faf3, #ffffff);
    }

    .lesson-node.perfect {
      border-color: rgba(244, 185, 66, 0.55);
      background:
        linear-gradient(135deg, #fff8dd, #f3faf3);
    }

    .lesson-icon {
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      color: var(--white);
      background: var(--cedar-green);
      font-weight: 950;
      box-shadow: 0 10px 18px rgba(31, 95, 67, 0.18);
    }

    .lesson-node.perfect .lesson-icon {
      color: #6f4c00;
      background: var(--gold);
    }

    .lesson-content {
      display: grid;
      gap: 3px;
    }

    .lesson-content strong {
      font-size: 15px;
    }

    .lesson-content small {
      color: var(--text-muted);
      font-weight: 700;
    }

    .lesson-action {
      color: var(--cedar-green-dark);
      font-weight: 950;
    }

    .state-card {
      margin-top: 18px;
      padding: 22px;
    }

    .error-state {
      border-color: rgba(214, 40, 40, 0.28);
      background: var(--lb-red-soft);
    }

    @media (max-width: 900px) {
      .hero-card {
        grid-template-columns: 1fr;
      }

      .hero-mascot {
        justify-self: start;
      }

      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }

      .progress-card {
        grid-column: 1 / -1;
      }

      .path-header {
        align-items: flex-start;
        flex-direction: column;
      }

      .path-header p {
        text-align: left;
      }
    }

    @media (max-width: 640px) {
      .course-page {
        padding: 18px 12px 34px;
      }

      .hero-card,
      .stat-card,
      .unit-card {
        border-radius: 22px;
        padding: 20px;
      }

      .hero-card h1 {
        font-size: 44px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .unit-top {
        align-items: flex-start;
        flex-direction: column;
      }

      .lesson-node {
        grid-template-columns: auto 1fr;
      }

      .lesson-action {
        grid-column: 2;
      }
    }
  `]
})
export class CourseProgressComponent implements OnInit {
  progress: CourseProgressResponse | null = null;
  userProgress: UserProgressResponse | null = null;

  currentUser: any = null;
  isAdmin = false;
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

    this.currentUser = this.authService.getUser();
    this.isAdmin = this.authService.isAdmin();

    this.loadDashboard();
  }

  mascotMessage(): string {
    if (!this.progress) {
      return 'Yalla, on charge ton parcours.';
    }

    if (this.progress.completionPercent === 100) {
      return 'Bravo. Le cours est terminé, mais les révisions gardent ton libanais vivant.';
    }

    if ((this.userProgress?.currentStreak ?? 0) > 0) {
      return `Yalla ${this.currentUser?.displayName ?? ''}, garde ta série de ${this.userProgress?.currentStreak} jour(s).`;
    }

    return 'Mar7aba. Une petite leçon aujourd’hui et ton libanais avance.';
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

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

  openAdminImport(): void {
    this.router.navigateByUrl('/admin/import');
  }

  openImportHistory(): void {
    this.router.navigateByUrl('/admin/imports');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}