import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  ApiService,
  CourseProgressResponse,
  LessonProgressResponse,
  UnitProgressResponse
} from '../../core/api.service';
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
              des révisions, de l'XP et Arzi, ton petit cèdre coach.
            </p>

            <div class="hero-actions">
              @if (isAdmin) {
                <button type="button" class="ghost-button" (click)="openAdminImport()">
                  Import JSON
                </button>

                <button type="button" class="ghost-button" (click)="openImportHistory()">
                  Historique
                </button>
              }

              <button type="button" class="ghost-button review-button" (click)="openReview()">
                Révisions
              </button>

              <button type="button" class="logout-button" (click)="logout()">
                Déconnexion
              </button>
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

        @if (!loading && nextLesson) {
          <section class="continue-bar fade-in">
            <div class="continue-info">
              <span class="continue-label">Continuer</span>
              <span class="continue-lesson">{{ nextLesson.title }}</span>
            </div>

            <button type="button" class="primary-button" (click)="openLesson(nextLesson.lessonId)">
              Reprendre →
            </button>
          </section>
        }

        @if (loading) {
          <section class="state-card">
            <app-mascot
              size="sm"
              mood="thinking"
              message="Je charge ton parcours..."
            />
          </section>
        }

        @if (errorMessage) {
          <section class="state-card error-state">
            <app-mascot
              size="sm"
              mood="wrong"
              [message]="errorMessage"
            />
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
              <small>jours d'affilée</small>
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
              Les cartes vertes sont terminées. Les sections verrouillées se débloquent
              quand la section précédente est complète.
            </p>
          </section>

          <section class="units">
            @for (unit of progress.units; track unit.unitId) {
              <article
                class="unit-card"
                [class.unit-completed]="unit.completionPercent === 100"
                [class.unit-locked]="isUnitLocked(unit)"
              >
                <div
                  class="unit-top"
                  (click)="unit.completionPercent === 100 && toggleUnit(unit.unitId)"
                >
                  <div class="unit-title-block">
                    <span class="unit-number">{{ unit.displayOrder }}</span>

                    <div>
                      <h3>{{ unit.title }}</h3>
                      <p>{{ unit.completedLessons }}/{{ unit.totalLessons }} leçons</p>
                    </div>
                  </div>

                  <div class="unit-right">
                    @if (isUnitLocked(unit)) {
                      <span class="lock-badge">🔒</span>
                    }

                    @if (unit.completionPercent === 100 && !isUnitLocked(unit)) {
                      <span class="complete-badge">✓ Terminé</span>

                      <button
                        type="button"
                        class="collapse-toggle"
                        (click)="$event.stopPropagation(); toggleUnit(unit.unitId)"
                      >
                        {{ isUnitCollapsed(unit.unitId) ? '▼' : '▲' }}
                      </button>
                    }

                    @if (unit.completionPercent > 0 && unit.completionPercent < 100) {
                      <div class="unit-progress-ring">
                        <svg viewBox="0 0 36 36">
                          <circle class="ring-bg" cx="18" cy="18" r="15"></circle>
                          <circle
                            class="ring-fg"
                            cx="18"
                            cy="18"
                            r="15"
                            [style.stroke-dashoffset]="unitRingOffset(unit.completionPercent)"
                          ></circle>
                        </svg>

                        <span>{{ unit.completionPercent }}%</span>
                      </div>
                    }
                  </div>
                </div>

                @if (!isUnitLocked(unit) && !(isUnitCollapsed(unit.unitId) && unit.completionPercent === 100)) {
                  <div class="lessons">
                    @for (lesson of unit.lessons; track lesson.lessonId) {
                      <button
                        type="button"
                        class="lesson-node"
                        [class.lesson-completed]="lesson.completed"
                        [class.lesson-perfect]="lesson.completed && lesson.bestScorePercent === 100"
                        [class.lesson-replay]="lesson.completed && lesson.bestScorePercent < 100"
                        (click)="openLesson(lesson.lessonId)"
                      >
                        <div class="lesson-node-left">
                          <span class="lesson-mode-icon">{{ lessonModeIcon(lesson.lessonMode) }}</span>
                          <span class="lesson-title">{{ lesson.title }}</span>
                        </div>

                        <div class="lesson-node-right">
                          @if (lesson.completed && lesson.bestScorePercent === 100) {
                            <span class="badge badge-perfect" title="Score parfait">⭐</span>
                          }

                          @if (lesson.completed && lesson.bestScorePercent < 100) {
                            <span class="badge badge-done" title="Terminé – rejouer pour améliorer">✓</span>
                          }

                          @if (!lesson.completed) {
                            <span class="badge badge-todo">→</span>
                          }
                        </div>
                      </button>
                    }
                  </div>
                }

                @if (isUnitLocked(unit)) {
                  <div class="locked-overlay">
                    <p class="locked-msg">Termine l'unité précédente pour débloquer.</p>
                  </div>
                }
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
      padding: 32px 20px;
      background:
        radial-gradient(circle at 12% 10%, rgba(214, 40, 40, 0.08), transparent 28%),
        radial-gradient(circle at 88% 18%, rgba(31, 95, 67, 0.12), transparent 30%),
        linear-gradient(135deg, var(--cream, #f8f4ec), #fffaf2);
      color: var(--text-main, #1f2933);
    }

    .course-shell {
      width: min(100%, 920px);
      margin: 0 auto;
      display: grid;
      gap: 22px;
    }

    .flag-stripe {
      position: relative;
      height: 8px;
      overflow: hidden;
      border-radius: 999px;
      background:
        linear-gradient(
          90deg,
          var(--lb-red, #d62828) 0 28%,
          #fff 28% 72%,
          var(--lb-red, #d62828) 72% 100%
        );
    }

    .flag-stripe::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 14px;
      height: 10px;
      transform: translate(-50%, -50%);
      background: var(--cedar-green, #1f5f43);
      clip-path: polygon(50% 0%, 76% 24%, 62% 24%, 90% 50%, 70% 50%, 100% 76%, 58% 76%, 58% 100%, 42% 100%, 42% 76%, 0% 76%, 30% 50%, 10% 50%, 38% 24%, 24% 24%);
    }

    .hero-card {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 28px;
      align-items: center;
      border: 1px solid var(--border-soft, #e8ded0);
      border-radius: 28px;
      padding: 28px 32px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: 0 14px 35px rgba(31, 41, 51, 0.08);
    }

    .brand-chip,
    .section-chip {
      display: inline-flex;
      border-radius: 999px;
      padding: 5px 12px;
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
      font-size: 12px;
      font-weight: 900;
    }

    .brand-chip {
      margin-bottom: 8px;
    }

    .section-chip {
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .hero-copy h1 {
      margin: 0 0 8px;
      font-size: clamp(28px, 4vw, 44px);
      font-weight: 900;
      letter-spacing: -0.04em;
    }

    .hero-subtitle {
      max-width: 420px;
      margin: 0 0 12px;
      color: var(--text-muted, #65726a);
      font-weight: 700;
    }

    .hero-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .continue-bar {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      border-radius: 22px;
      padding: 16px 22px;
      background: linear-gradient(135deg, var(--cedar-green, #1f5f43), #2d7a58);
      color: white;
    }

    .continue-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .continue-label {
      opacity: 0.75;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .continue-lesson {
      font-size: 17px;
      font-weight: 900;
    }

    .continue-bar .primary-button {
      flex-shrink: 0;
      background: white;
      color: var(--cedar-green-dark, #143d2b);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 14px;
    }

    .stat-card {
      display: grid;
      gap: 6px;
      border: 1px solid var(--border-soft, #e8ded0);
      border-radius: 22px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: 0 8px 22px rgba(31, 41, 51, 0.06);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-kicker {
      color: var(--text-muted, #65726a);
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .stat-card h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    .stat-card p {
      margin: 0;
      color: var(--text-muted, #65726a);
      font-weight: 700;
    }

    .progress-track {
      height: 10px;
      overflow: hidden;
      border-radius: 999px;
      background: var(--cream-2, #efe7da);
    }

    .progress-track div {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--cedar-green, #1f5f43), #2f8b61);
      transition: width 0.6s ease;
    }

    .small-card {
      text-align: center;
      justify-items: center;
    }

    .small-card span {
      color: var(--text-muted, #65726a);
      font-size: 13px;
      font-weight: 800;
    }

    .small-card strong {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: -0.04em;
    }

    .small-card small {
      color: var(--text-muted, #65726a);
      font-size: 12px;
      font-weight: 700;
    }

    .xp-card strong {
      color: var(--cedar-green, #1f5f43);
    }

    .streak-card strong {
      color: var(--lb-red, #d62828);
    }

    .best-card strong {
      color: #c07d00;
    }

    .path-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
      flex-wrap: wrap;
    }

    .path-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.03em;
    }

    .path-header p {
      max-width: 320px;
      margin: 0;
      color: var(--text-muted, #65726a);
      font-size: 14px;
      font-weight: 700;
      text-align: right;
    }

    .units {
      display: grid;
      gap: 14px;
    }

    .unit-card {
      overflow: hidden;
      border: 1px solid var(--border-soft, #e8ded0);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: 0 8px 22px rgba(31, 41, 51, 0.06);
      transition: box-shadow 0.2s ease;
    }

    .unit-card:hover {
      box-shadow: 0 12px 30px rgba(31, 41, 51, 0.1);
    }

    .unit-completed {
      border-color: rgba(31, 95, 67, 0.3);
    }

    .unit-locked {
      opacity: 0.62;
    }

    .unit-top {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
      padding: 18px 22px;
    }

    .unit-title-block {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .unit-number {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
      font-size: 13px;
      font-weight: 900;
      flex-shrink: 0;
    }

    .unit-title-block h3 {
      margin: 0 0 3px;
      font-size: 17px;
      font-weight: 900;
      letter-spacing: -0.02em;
    }

    .unit-title-block p {
      margin: 0;
      color: var(--text-muted, #65726a);
      font-size: 13px;
      font-weight: 700;
    }

    .unit-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .lock-badge {
      font-size: 20px;
    }

    .complete-badge {
      display: inline-flex;
      border-radius: 999px;
      padding: 5px 12px;
      background: var(--cedar-green, #1f5f43);
      color: white;
      font-size: 12px;
      font-weight: 900;
    }

    .collapse-toggle {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
      font-size: 11px;
      font-weight: 900;
      cursor: pointer;
      transition: background 0.14s ease;
    }

    .collapse-toggle:hover {
      background: #c5e3d0;
    }

    .unit-progress-ring {
      position: relative;
      width: 36px;
      height: 36px;
    }

    .unit-progress-ring svg {
      width: 36px;
      height: 36px;
      transform: rotate(-90deg);
    }

    .unit-progress-ring span {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--cedar-green-dark, #143d2b);
      font-size: 8px;
      font-weight: 900;
    }

    .ring-bg {
      fill: none;
      stroke: #e8ded0;
      stroke-width: 3;
    }

    .ring-fg {
      fill: none;
      stroke: var(--cedar-green, #1f5f43);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-dasharray: 94.2;
    }

    .lessons {
      display: grid;
      border-top: 1px solid var(--border-soft, #e8ded0);
    }

    .lesson-node {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
      border: 0;
      border-bottom: 1px solid rgba(232, 222, 208, 0.5);
      padding: 13px 22px;
      background: transparent;
      color: var(--text-main, #1f2933);
      text-align: left;
      cursor: pointer;
      transition: background 0.14s ease;
    }

    .lesson-node:last-child {
      border-bottom: 0;
    }

    .lesson-node:hover {
      background: rgba(31, 95, 67, 0.04);
    }

    .lesson-completed {
      background: rgba(31, 95, 67, 0.03);
    }

    .lesson-perfect:hover {
      background: rgba(245, 158, 11, 0.06);
    }

    .lesson-node-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .lesson-mode-icon {
      font-size: 15px;
      flex-shrink: 0;
    }

    .lesson-title {
      font-size: 15px;
      font-weight: 800;
    }

    .lesson-node-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .badge {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 26px;
      height: 26px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 900;
    }

    .badge-perfect {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-done {
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
    }

    .badge-todo {
      background: var(--cream-2, #efe7da);
      color: var(--text-muted, #65726a);
    }

    .locked-overlay {
      border-top: 1px solid var(--border-soft, #e8ded0);
      padding: 14px 22px;
      background: rgba(248, 244, 236, 0.7);
    }

    .locked-msg {
      margin: 0;
      color: var(--text-muted, #65726a);
      font-size: 13px;
      font-weight: 700;
      text-align: center;
    }

    .state-card {
      border: 1px solid var(--border-soft, #e8ded0);
      border-radius: 22px;
      padding: 28px;
      background: rgba(255, 255, 255, 0.94);
      text-align: center;
    }

    .error-state {
      border-color: rgba(214, 40, 40, 0.26);
      background: var(--lb-red-soft, #fde2e2);
    }

    .primary-button,
    .ghost-button,
    .logout-button {
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      transition:
        transform 0.14s ease,
        box-shadow 0.14s ease;
    }

    .primary-button {
      background: var(--cedar-green, #1f5f43);
      color: white;
      box-shadow: 0 10px 24px rgba(31, 95, 67, 0.24);
    }

    .ghost-button {
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
    }

    .review-button {
      background: #fff1c9;
      color: #6f4c00;
    }

    .logout-button {
      background: var(--cream-2, #efe7da);
      color: var(--text-muted, #65726a);
    }

    .primary-button:hover,
    .ghost-button:hover,
    .logout-button:hover {
      transform: translateY(-1px);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .fade-in {
      animation: fadeIn 0.32s ease both;
    }

    @media (max-width: 860px) {
      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }

      .hero-card {
        grid-template-columns: 1fr;
      }

      .path-header {
        align-items: flex-start;
        flex-direction: column;
      }

      .path-header p {
        text-align: left;
      }
    }

    @media (max-width: 580px) {
      .course-page {
        padding: 20px 14px;
      }

      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }

      .hero-card {
        padding: 20px 18px;
      }

      .continue-bar {
        align-items: flex-start;
        flex-direction: column;
      }

      .continue-bar .primary-button {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class CourseProgressComponent implements OnInit {
  progress: CourseProgressResponse | null = null;
  userProgress: UserProgressResponse | null = null;

  loading = true;
  errorMessage = '';

  collapsedUnits = new Set<number>();

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.loadDashboard();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get nextLesson(): LessonProgressResponse | null {
    for (const unit of this.progress?.units ?? []) {
      if (this.isUnitLocked(unit)) {
        continue;
      }

      for (const lesson of unit.lessons) {
        if (!lesson.completed) {
          return lesson;
        }
      }
    }

    return null;
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getCourseProgress(1).subscribe({
      next: progress => {
        this.progress = progress;
        this.autoCollapseCompletedUnits(progress);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le parcours.';
        this.loading = false;
      }
    });

    this.apiService.getUserProgress().subscribe({
      next: userProgress => {
        this.userProgress = userProgress;
      },
      error: () => {
        this.userProgress = null;
      }
    });
  }

  isUnitLocked(unit: UnitProgressResponse): boolean {
    if (this.isAdmin || !this.progress) {
      return false;
    }

    if (unit.completedLessons > 0) {
      return false;
    }

    const unitIndex = this.progress.units.findIndex(candidate => candidate.unitId === unit.unitId);

    if (unitIndex <= 0) {
      return false;
    }

    const previousUnit = this.progress.units[unitIndex - 1];

    if (!previousUnit || previousUnit.totalLessons === 0) {
      return false;
    }

    return previousUnit.completionPercent < 100;
  }

  toggleUnit(unitId: number): void {
    if (this.collapsedUnits.has(unitId)) {
      this.collapsedUnits.delete(unitId);
      return;
    }

    this.collapsedUnits.add(unitId);
  }

  isUnitCollapsed(unitId: number): boolean {
    return this.collapsedUnits.has(unitId);
  }

  lessonModeIcon(mode: string): string {
    const icons: Record<string, string> = {
      COURSE_AND_EXERCISE: '📖',
      COURSE_ONLY: '📖',
      PRACTICE_ONLY: '✏️',
      EMPTY: '🔲'
    };

    return icons[mode] ?? '·';
  }

  unitRingOffset(percent: number): number {
    const circumference = 2 * Math.PI * 15;
    return circumference * (1 - percent / 100);
  }

  mascotMessage(): string {
    if (!this.progress) {
      return 'Mar7aba ! Chargement en cours.';
    }

    const percent = this.progress.completionPercent;

    if (percent === 100) {
      return 'Khalas ! Tu as tout terminé. Bravo.';
    }

    if (percent >= 75) {
      return 'Tu es presque au bout. Yalla.';
    }

    if (percent >= 40) {
      return 'Bonne progression. Continue.';
    }

    if (percent > 0) {
      return 'Tu es lancé. Chaque leçon compte.';
    }

    return 'Mar7aba ! Par où on commence ?';
  }

  openLesson(lessonId: number): void {
    this.router.navigate(['/lesson', lessonId]);
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

  private autoCollapseCompletedUnits(progress: CourseProgressResponse): void {
    this.collapsedUnits.clear();

    for (const unit of progress.units) {
      if (unit.completionPercent === 100) {
        this.collapsedUnits.add(unit.unitId);
      }
    }
  }
}