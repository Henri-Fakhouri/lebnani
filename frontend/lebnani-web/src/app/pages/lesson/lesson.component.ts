import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
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
          <button type="button" class="ghost-button" (click)="backToCourse()">← Parcours</button>

          @if (!loading && !completed && !readingMode && !transitioning && exercise) {
            <span class="chip">Question {{ index + 1 }} / {{ exercises.length }}</span>
          }

          @if (!loading && readingMode && !emptyLesson && contentBlocks.length > 0) {
            <span class="chip">Cours</span>
          }

          @if (!loading && completed && result) {
            <span class="chip chip-gold">Leçon terminée</span>
          }
        </header>

        <section class="lesson-card">
          @if (loading) {
            <div class="state-panel fade-in">
              <app-mascot mood="thinking" size="lg" message="Je charge la leçon. Deux secondes." />
            </div>
          }

          @if (!loading && errorMessage) {
            <div class="state-panel fade-in">
              <app-mascot mood="sad" size="lg" [message]="errorMessage" />
              <div class="state-actions">
                <button type="button" class="primary-button" (click)="backToCourse()">Retour au parcours</button>
              </div>
            </div>
          }

          @if (!loading && !errorMessage && emptyLesson) {
            <div class="state-panel fade-in">
              <app-mascot mood="encouraging" size="lg" message="Cette leçon n’a pas encore d’exercices." />
              <h1 class="state-title">Leçon vide</h1>
              <p class="state-sub">Reviens bientôt, le contenu arrive.</p>
              <div class="state-actions">
                <button type="button" class="primary-button" (click)="backToCourse()">Retour au parcours</button>
              </div>
            </div>
          }

          @if (!loading && !errorMessage && !emptyLesson && readingMode && contentBlocks.length > 0) {
            <section class="reading-hero fade-in">
              <div class="hero-copy">
                <span class="eyebrow">Cours</span>
                <h1>On lit d’abord, puis on pratique.</h1>
                <p>Le but est simple : comprendre les bases avant de répondre.</p>
              </div>
              <app-mascot mood="proud" size="lg" message="Lis tranquillement. Après ça, on passe aux questions." />
            </section>

            <div class="course-content fade-in">
              @for (block of contentBlocks; track block.id) {
                @if (block.type === 'HEADING') {
                  <h2 class="content-heading">{{ block.content }}</h2>
                }
                @if (block.type === 'MARKDOWN') {
                  <div class="markdown-block" [innerHTML]="renderMarkdown(block.content)"></div>
                }
                @if (block.type === 'NOTE') {
                  <div class="note-block"><span class="block-label">Note</span><p>{{ block.content }}</p></div>
                }
                @if (block.type === 'EXAMPLE') {
                  <div class="example-block"><span class="block-label">Exemple</span><p>{{ block.content }}</p></div>
                }
              }
            </div>

            @if (exercises.length > 0) {
              <button type="button" class="primary-button full-width next-button" (click)="beginTransition()">Commencer les exercices →</button>
            }
            @if (exercises.length === 0) {
              <button type="button" class="primary-button full-width next-button" [disabled]="answering" (click)="completeCourseOnlyLesson()">Terminer la lecture ✓</button>
            }
          }

          @if (!loading && transitioning) {
            <div class="state-panel fade-in">
              <app-mascot mood="excited" size="lg" message="C’est parti pour les exercices !" />
              <div class="transition-spinner"></div>
            </div>
          }

          @if (!loading && !errorMessage && !emptyLesson && !readingMode && !transitioning && !completed && exercise) {
            <section class="exercise-section fade-in">
              <div class="exercise-hero">
                <div class="exercise-copy">
                  <span [class]="exerciseTypeChipClass(exercise.type)">{{ exerciseTypeLabel(exercise.type) }}</span>

                  @if (promptHasTarget(exercise.promptFr)) {
                    <div class="prompt-stack">
                      <span [class]="promptInstructionClass(exercise.promptFr)">{{ promptInstruction(exercise.promptFr) }}</span>
                      <h1 class="prompt-target">{{ promptTarget(exercise.promptFr) }}</h1>
                    </div>
                  } @else {
                    <h1 class="prompt-target">{{ exercise.promptFr }}</h1>
                  }

                  <div class="question-progress-bar"><div [style.width.%]="questionProgressPercent"></div></div>
                </div>

                <app-mascot [mood]="currentMascotMood" size="md" [message]="currentMascotMessage" />
              </div>

              @if (exercise.type === 'MULTIPLE_CHOICE') {
                <div class="options">
                  @for (opt of exercise.options; track opt.id; let optionIndex = $index) {
                    <button
                      type="button"
                      class="option-button"
                      [class.selected]="selectedOptionId === opt.id"
                      [class.correct-selected]="showFeedback && opt.id === correctOptionId"
                      [class.wrong-selected]="showFeedback && selectedOptionId === opt.id && !lastCorrect"
                      [disabled]="answering || !!feedback"
                      (click)="answerMC(opt.id)"
                    >
                      <span class="option-letter">{{ optionLetter(optionIndex) }}</span>
                      <span>{{ opt.text }}</span>
                    </button>
                  }
                </div>
              }

              @if (exercise.type === 'TYPE_ANSWER') {
                <div class="typed-answer">
                  <input [(ngModel)]="textAnswer" [disabled]="answering || !!feedback" placeholder="Ta réponse" (keyup.enter)="answerText()" />
                  <button type="button" class="primary-button" [disabled]="answering || !!feedback || !textAnswer.trim()" (click)="answerText()">Valider</button>
                </div>
              }

              @if (exercise.type === 'WORD_BANK_SENTENCE') {
                <app-word-bank-sentence-exercise [exercise]="exercise" [disabled]="answering || !!feedback" (submitted)="answerWordBankSentence($event)" />
              }

              @if (exercise.type === 'MATCH_PAIRS') {
                <app-match-pairs-exercise [exercise]="exercise" [disabled]="answering || !!feedback" (completed)="answerMatchPairs($event)" />
              }

              @if (feedback) {
                <div class="feedback-panel fade-in" [class.correct]="lastCorrect" [class.wrong]="!lastCorrect">
                  <div class="feedback-header">
                    <app-mascot [mood]="feedbackMascotMood" size="sm" [message]="feedbackMascotMessage" />
                    <span class="feedback-badge" [class.correct-badge]="lastCorrect" [class.wrong-badge]="!lastCorrect">{{ lastCorrect ? 'Correct !' : 'Incorrect' }}</span>
                  </div>

                  <p class="feedback-text">{{ feedback }}</p>

                  @if (!lastCorrect && lastExpectedAnswer) {
                    <div class="correct-answer-reveal"><span>Bonne réponse :</span><strong>{{ lastExpectedAnswer }}</strong></div>
                  }

                  @if (showNextButton) {
                    <button type="button" class="primary-button full-width next-button fade-in" (click)="next()">{{ isLastQuestion ? 'Terminer la leçon' : 'Continuer' }}</button>
                  }
                </div>
              }
            </section>
          }

          @if (!loading && !errorMessage && completed && result) {
            <section class="result-screen fade-in">
              <div class="result-hero">
                <div class="score-circle-wrap pop-in">
                  <svg class="score-ring" viewBox="0 0 100 100">
                    <circle class="ring-track" cx="50" cy="50" r="40"></circle>
                    <circle class="ring-fill" [class.ring-perfect]="result.scorePercent === 100" cx="50" cy="50" r="40" [style.stroke-dashoffset]="scoreCircleOffset"></circle>
                  </svg>
                  <div class="score-overlay"><strong>{{ result.scorePercent }}%</strong><span>score</span></div>
                </div>

                <div class="hero-copy">
                  <span class="eyebrow">Résultat</span>
                  <h1>Leçon terminée</h1>
                  <p>{{ resultMascotMessage }}</p>
                  @if (result.xpAwarded > 0) {
                    <div class="xp-badge pop-in">⭐ +{{ result.xpAwarded }} XP</div>
                  }
                </div>

                <app-mascot [mood]="resultMascotMood" size="lg" [message]="resultMascotMessage" />
              </div>

              <div class="result-grid">
                <div class="result-item"><strong>{{ result.correctAnswers }}/{{ result.totalExercises }}</strong><span>bonnes réponses</span></div>
                <div class="result-item"><strong>{{ result.wrongAnswers }}</strong><span>erreurs</span></div>
                <div class="result-item"><strong>{{ result.xpAwarded }}</strong><span>XP gagnés</span></div>
              </div>

              @if (result.xpAwarded === 0) {
                <p class="hint">Cette leçon était déjà terminée, donc aucun XP supplémentaire n’a été accordé.</p>
              }

              @if (wrongAnswerDetails.length > 0) {
                <section class="wrong-section">
                  <h2>Ce qui mérite attention</h2>
                  <div class="wrong-list">
                    @for (wrong of wrongAnswerDetails; track wrong.promptFr + wrong.submittedAnswer + wrong.correctAnswer) {
                      <article class="wrong-card">
                        <p class="wrong-prompt">{{ wrong.promptFr }}</p>
                        <div><span>Ta réponse :</span> <strong class="wrong-value">{{ wrong.submittedAnswer }}</strong></div>
                        <div><span>Bonne réponse :</span> <strong class="correct-value">{{ wrong.correctAnswer }}</strong></div>
                      </article>
                    }
                  </div>
                </section>
              }

              <div class="result-actions">
                <button type="button" class="ghost-button" (click)="replayLesson()">🔁 Rejouer</button>

                @if (nextLesson) {
                  <button type="button" class="primary-button" (click)="goToNextLesson()">Leçon suivante : {{ nextLessonTitle }} →</button>
                }

                <button type="button" class="primary-button" (click)="backToCourse()">Retour au parcours</button>
              </div>
            </section>
          }
        </section>
      </div>
    </main>
  `,
  styles: [`
    .lesson-page { min-height: 100vh; padding: 32px 20px; background: linear-gradient(135deg, var(--cream, #f8f4ec), #fffaf2); color: var(--text-main, #1f2933); }
    .lesson-shell { width: min(100%, 980px); margin: 0 auto; }
    .lesson-flag { height: 8px; margin-bottom: 18px; border-radius: 999px; background: linear-gradient(90deg, var(--lb-red, #d62828) 0 28%, #fff 28% 72%, var(--lb-red, #d62828) 72% 100%); }
    .lesson-topbar, .result-actions, .state-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .lesson-topbar { justify-content: space-between; margin-bottom: 18px; }
    .lesson-card { padding: 28px; border: 1px solid var(--border-soft, #e8ded0); border-radius: 28px; background: rgba(255,255,255,0.94); box-shadow: var(--shadow-soft, 0 14px 35px rgba(31,41,51,0.08)); }
    .ghost-button, .primary-button { border: 0; border-radius: 999px; padding: 12px 18px; font-size: 15px; font-weight: 800; cursor: pointer; }
    .ghost-button { color: var(--cedar-green-dark, #143d2b); background: var(--cedar-green-soft, #dceee3); }
    .primary-button { color: white; background: var(--cedar-green, #1f5f43); box-shadow: 0 10px 24px rgba(31,95,67,0.24); }
    .primary-button:disabled { opacity: 0.55; cursor: default; }
    .full-width { width: 100%; }
    .chip, .eyebrow, .exercise-type-chip { display: inline-flex; width: fit-content; align-items: center; border-radius: 999px; font-weight: 900; }
    .chip { gap: 6px; padding: 6px 10px; color: var(--cedar-green-dark, #143d2b); background: var(--cedar-green-soft, #dceee3); font-size: 13px; }
    .chip-gold { color: #6f4c00; background: #fff1c9; }
    .eyebrow, .exercise-type-chip { padding: 7px 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.07em; }
    .eyebrow, .type-choice { color: var(--cedar-green-dark, #143d2b); background: var(--cedar-green-soft, #dceee3); }
    .type-written { color: #6f4c00; background: #fff1c9; }
    .type-match { color: var(--lb-red-dark, #a61f1f); background: var(--lb-red-soft, #fde2e2); }
    .type-sentence { color: #1b5f82; background: rgba(77,168,218,0.16); }
    .state-panel, .reading-hero, .exercise-hero, .result-hero { display: grid; gap: 20px; align-items: center; }
    .state-panel { text-align: center; justify-items: center; }
    .reading-hero, .exercise-hero, .result-hero { grid-template-columns: minmax(0, 1fr) auto; margin-bottom: 24px; }
    .hero-copy h1, .exercise-copy h1 { margin: 8px 0 12px; font-size: clamp(32px, 4vw, 48px); line-height: 0.95; letter-spacing: -0.04em; }
    .hero-copy p, .state-sub { margin: 0; color: var(--text-muted, #65726a); font-weight: 600; line-height: 1.5; }
    .state-title { margin: 0; font-size: 32px; line-height: 1; letter-spacing: -0.04em; }
    .prompt-stack { display: grid; gap: 6px; }
    .prompt-instruction { color: var(--text-muted, #65726a); font-size: 18px; font-weight: 900; letter-spacing: -0.02em; }
    .prompt-instruction.lang-libanais { color: var(--lb-red, #d62828); }
    .prompt-instruction.lang-francais { color: var(--sea-blue, #4da8da); }
    .prompt-target { color: var(--text-main, #1f2933); font-size: clamp(36px, 5vw, 58px); font-weight: 950; line-height: 0.95; letter-spacing: -0.055em; }
    .question-progress-bar { height: 12px; margin-top: 16px; overflow: hidden; border-radius: 999px; background: var(--cream-2, #efe7da); }
    .question-progress-bar div { height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--cedar-green, #1f5f43), #2f8b61); }
    .course-content { display: grid; gap: 18px; margin-bottom: 24px; }
    .content-heading { margin: 0; font-size: 28px; line-height: 1.05; }
    .markdown-block { color: #2d3a30; line-height: 1.65; }
    :host ::ng-deep .markdown-block p { margin: 0 0 14px; color: #2d3a30; }
    :host ::ng-deep .markdown-block table { width: 100%; margin: 16px 0; border: 1px solid #e7e1d6; border-collapse: collapse; }
    :host ::ng-deep .markdown-block th, :host ::ng-deep .markdown-block td { border: 1px solid #e7e1d6; padding: 10px 12px; text-align: left; }
    .note-block, .example-block { border-radius: 18px; padding: 16px; line-height: 1.55; font-weight: 700; }
    .note-block { color: #6a5320; background: #fff7df; border: 1px solid #f3e1a5; }
    .example-block { color: #253d2c; background: #f3faf3; border: 1px solid #d7ebd7; }
    .block-label { display: block; margin-bottom: 6px; font-size: 12px; font-weight: 950; text-transform: uppercase; letter-spacing: 0.07em; }
    .note-block p, .example-block p { margin: 0; }
    .options, .typed-answer { display: grid; gap: 12px; }
    .option-button { width: 100%; display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center; border: 2px solid #e7e1d6; border-radius: 18px; padding: 14px 16px; color: #18251d; background: #fffdf8; text-align: left; font-size: 15px; font-weight: 850; }
    .option-letter { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 999px; color: var(--cedar-green-dark, #143d2b); background: var(--cedar-green-soft, #dceee3); font-size: 12px; font-weight: 950; }
    .option-button.selected { border-color: var(--cedar-green, #1f5f43); background: #f8fbf6; }
    .option-button.correct-selected { border-color: #1b7f3a; color: white; background: #1b7f3a; }
    .option-button.wrong-selected { border-color: #b00020; color: white; background: #b00020; animation: shake 0.25s ease; }
    .option-button.correct-selected .option-letter, .option-button.wrong-selected .option-letter { color: inherit; background: rgba(255,255,255,0.18); }
    .option-button:disabled:not(.correct-selected):not(.wrong-selected) { opacity: 0.55; color: #667064; background: #f4f1ea; border-color: #e7e1d6; }
    .typed-answer input { padding: 14px; border: 1px solid #ddd; border-radius: 16px; background: white; font-size: 16px; }
    .typed-answer input:disabled { color: #667064; background: #f4f1ea; }
    .feedback-panel { margin-top: 18px; border: 1px solid #d7ebd7; border-radius: 22px; padding: 16px; background: #f3faf3; }
    .feedback-panel.wrong { border-color: #ffd0d0; background: #fff4f4; }
    .feedback-header { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
    .feedback-badge { display: inline-flex; border-radius: 999px; padding: 6px 10px; font-size: 13px; font-weight: 900; }
    .correct-badge { color: #14532d; background: #dcfce7; }
    .wrong-badge { color: #7f1d1d; background: #fee2e2; }
    .feedback-text { margin: 0 0 14px; color: #1f2933; font-weight: 800; line-height: 1.45; }
    .correct-answer-reveal, .hint { border-radius: 16px; padding: 12px 14px; font-weight: 800; }
    .correct-answer-reveal { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; background: rgba(255,255,255,0.75); }
    .correct-answer-reveal span { color: var(--text-muted, #65726a); font-size: 13px; }
    .correct-answer-reveal strong { color: #14532d; }
    .result-screen { display: grid; gap: 22px; }
    .score-circle-wrap { position: relative; width: 120px; height: 120px; }
    .score-ring { width: 120px; height: 120px; transform: rotate(-90deg); }
    .ring-track, .ring-fill { fill: none; stroke-width: 8; }
    .ring-track { stroke: #e8ded0; }
    .ring-fill { stroke: var(--cedar-green, #1f5f43); stroke-linecap: round; stroke-dasharray: 251.3; transition: stroke-dashoffset 1s ease; }
    .ring-perfect { stroke: #f59e0b; }
    .score-overlay { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
    .score-overlay strong { font-size: 26px; color: var(--cedar-green, #1f5f43); }
    .score-overlay span { color: var(--text-muted, #65726a); font-size: 12px; font-weight: 800; }
    .xp-badge { display: inline-flex; width: fit-content; margin-top: 10px; border-radius: 999px; padding: 10px 16px; color: #92400e; background: linear-gradient(135deg, #fef3c7, #fde68a); font-weight: 950; }
    .result-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .result-item { border: 1px solid #eee8dc; border-radius: 18px; padding: 18px; background: #fffdf8; }
    .result-item strong { display: block; color: var(--cedar-green, #1f5f43); font-size: 30px; }
    .result-item span { display: block; margin-top: 4px; color: var(--text-muted, #65726a); font-size: 14px; font-weight: 700; }
    .hint { margin: 0; color: #6a5320; background: #fff7df; border: 1px solid #f3e1a5; }
    .wrong-section h2 { margin: 0 0 12px; font-size: 20px; }
    .wrong-list { display: grid; gap: 10px; }
    .wrong-card { display: grid; gap: 8px; border: 1px solid #fecaca; border-radius: 18px; padding: 14px 16px; background: #fff5f5; }
    .wrong-card p { margin: 0; }
    .wrong-card span { color: var(--text-muted, #65726a); font-weight: 800; }
    .wrong-value { color: #b00020; }
    .correct-value { color: #14532d; }
    .transition-spinner { width: 40px; height: 40px; border: 3px solid var(--cedar-green-soft, #dceee3); border-top-color: var(--cedar-green, #1f5f43); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes popIn { 0% { opacity: 0; transform: scale(0.7); } 70% { transform: scale(1.06); } 100% { opacity: 1; transform: scale(1); } }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fade-in { animation: fadeIn 0.32s ease both; }
    .pop-in { animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both; }
    @media (max-width: 900px) { .reading-hero, .exercise-hero, .result-hero { grid-template-columns: 1fr; } }
    @media (max-width: 680px) { .lesson-page { padding: 20px 14px; } .lesson-card { padding: 20px; } .result-grid { grid-template-columns: 1fr; } .result-actions { flex-direction: column; } .result-actions button { width: 100%; } }
  `]
})
export class LessonComponent implements OnInit, OnDestroy {
  lessonId!: number;
  attemptId = 0;

  contentBlocks: LessonContentBlockResponse[] = [];
  exercises: any[] = [];
  index = 0;
  exercise: any = null;

  textAnswer = '';
  feedback = '';
  lastCorrect = false;
  selectedOptionId: number | null = null;
  correctOptionId: number | null = null;
  lastExpectedAnswer = '';

  loading = true;
  answering = false;
  submittingAnswer = false;
  readingMode = true;
  transitioning = false;
  emptyLesson = false;
  completed = false;
  result: any = null;
  nextLesson: any = null;
  errorMessage = '';
  showFeedback = false;
  showNextButton = false;

  private routeSubscription: Subscription | null = null;
  private nextButtonTimer: ReturnType<typeof setTimeout> | null = null;
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;

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

    if (this.route.paramMap) {
      this.routeSubscription = this.route.paramMap.subscribe(params => {
        this.loadLessonFromRouteId(Number.parseInt(params.get('id') ?? '0', 10));
      });
      return;
    }

    this.loadLessonFromRouteId(Number.parseInt(this.route.snapshot.paramMap.get('id') ?? '0', 10));
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.clearTimers();
  }

  private loadLessonFromRouteId(nextLessonId: number): void {
    if (!Number.isFinite(nextLessonId) || nextLessonId <= 0) {
      this.resetLessonStateForLoad();
      this.loading = false;
      this.errorMessage = 'Leçon introuvable.';
      return;
    }

    this.lessonId = nextLessonId;
    this.resetLessonStateForLoad();
    this.loadLesson();
  }


  get questionProgressPercent(): number {
    if (this.exercises.length === 0) {
      return 0;
    }

    return ((this.index + 1) * 100) / this.exercises.length;
  }

  get currentMascotMood(): MascotMood {
    if (!this.feedback) {
      return this.exercise?.type === 'TYPE_ANSWER' ? 'thinking' : 'neutral';
    }

    if (!this.lastCorrect) {
      return 'thinking';
    }

    return this.isLastQuestion ? 'celebrate' : 'happy';
  }

  get currentMascotMessage(): string {
    if (!this.feedback) {
      if (this.exercise?.type === 'TYPE_ANSWER') {
        return 'Écris ce que tu entends ou ce que tu comprends.';
      }

      if (this.exercise?.type === 'WORD_BANK_SENTENCE') {
        return 'Remets les mots dans le bon ordre.';
      }

      if (this.exercise?.type === 'MATCH_PAIRS') {
        return 'Associe chaque mot à sa traduction.';
      }

      return 'Choisis la bonne réponse.';
    }

    if (!this.lastCorrect) {
      return 'Presque. Regarde bien et réessaie au prochain.';
    }

    return this.isLastQuestion ? 'Nickel. Encore une et on boucle.' : 'Bien joué. Continue comme ça.';
  }

  get feedbackMascotMood(): MascotMood {
    if (!this.lastCorrect) {
      return 'sad';
    }

    return this.isLastQuestion ? 'celebrate' : 'happy';
  }

  get feedbackMascotMessage(): string {
    return this.lastCorrect ? 'Sah. Bonne réponse.' : 'Oops. Ce n’était pas ça.';
  }

  get resultMascotMood(): MascotMood {
    if (!this.result) {
      return 'proud';
    }

    if (this.result.scorePercent === 100) {
      return 'celebrate';
    }

    return this.result.scorePercent >= 70 ? 'proud' : 'encouraging';
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

  get scoreCircleOffset(): number {
    const circumference = 2 * Math.PI * 40;
    const score = this.result?.scorePercent ?? 0;
    return circumference * (1 - score / 100);
  }

  get wrongAnswerDetails(): any[] {
    return this.result?.wrongAnswerDetails ?? [];
  }

  get nextLessonTitle(): string {
    return this.nextLesson?.lessonTitle ?? this.nextLesson?.title ?? 'Leçon suivante';
  }

  loadLesson(): void {
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

  beginTransition(): void {
    if (this.answering || this.transitioning) {
      return;
    }

    this.readingMode = false;
    this.transitioning = true;
    this.loading = false;
    this.startExercises();
  }

  startExercises(): void {
    this.loading = true;
    this.readingMode = false;

    this.api.startLesson(this.lessonId).subscribe({
      next: start => {
        this.attemptId = start.attemptId;
        this.exercise = this.exercises[this.index] ?? null;
        this.loading = false;
        this.transitioning = false;
      },
      error: () => {
        this.loading = false;
        this.transitioning = false;
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
            this.applyCompletionResult(result);
            this.loading = false;
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
      this.finishLesson();
      return;
    }

    this.exercise = this.exercises[this.index];
    this.feedback = '';
    this.textAnswer = '';
    this.selectedOptionId = null;
    this.correctOptionId = null;
    this.lastExpectedAnswer = '';
    this.showFeedback = false;
    this.showNextButton = false;
    this.answering = false;
    this.submittingAnswer = false;
  }

  nextExercise(): void {
    this.next();
  }

  answerMC(optionId: number): void {
    if (this.answering || this.feedback) {
      return;
    }

    this.selectedOptionId = optionId;
    this.answering = true;
    this.submittingAnswer = true;

    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      selectedOptionId: optionId
    }).subscribe({
      next: res => this.handleAnswerResult(res.correct, res.expectedAnswer),
      error: () => {
        this.answering = false;
        this.submittingAnswer = false;
        this.errorMessage = 'Impossible de valider la réponse.';
      }
    });
  }

  selectOption(optionId: number): void {
    this.answerMC(optionId);
  }

  answerText(): void {
    if (this.answering || this.feedback || !this.textAnswer.trim()) {
      return;
    }

    this.answering = true;
    this.submittingAnswer = true;

    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      answer: this.textAnswer
    }).subscribe({
      next: res => this.handleAnswerResult(res.correct, res.expectedAnswer),
      error: () => {
        this.answering = false;
        this.submittingAnswer = false;
        this.errorMessage = 'Impossible de valider la réponse.';
      }
    });
  }

  submitTypedAnswer(): void {
    this.answerText();
  }

  answerMatchPairs(answer: string): void {
    if (this.answering || this.feedback || !answer.trim()) {
      return;
    }

    this.answering = true;
    this.submittingAnswer = true;

    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      answer
    }).subscribe({
      next: res => this.handleAnswerResult(res.correct, res.expectedAnswer),
      error: () => {
        this.answering = false;
        this.submittingAnswer = false;
        this.errorMessage = 'Impossible de valider les paires.';
      }
    });
  }

  submitMatchPairs(answer: string): void {
    this.answerMatchPairs(answer);
  }

  answerWordBankSentence(answer: string): void {
    if (this.answering || this.feedback || !answer.trim()) {
      return;
    }

    this.answering = true;
    this.submittingAnswer = true;

    this.api.submitAnswer(this.attemptId, {
      exerciseId: this.exercise.id,
      answer
    }).subscribe({
      next: res => this.handleAnswerResult(res.correct, res.expectedAnswer),
      error: () => {
        this.answering = false;
        this.submittingAnswer = false;
        this.errorMessage = 'Impossible de valider la phrase.';
      }
    });
  }

  submitWordBank(answer: string): void {
    this.answerWordBankSentence(answer);
  }

  handleAnswerResult(correct: boolean, expectedAnswer: string): void {
    this.lastCorrect = correct;
    this.lastExpectedAnswer = expectedAnswer ?? '';
    this.feedback = correct ? 'Correct' : `Incorrect. Réponse attendue : ${this.lastExpectedAnswer}`;
    this.answering = false;
    this.submittingAnswer = false;
    this.showFeedback = true;
    this.showNextButton = correct;
    this.correctOptionId = this.resolveCorrectOptionId(expectedAnswer);

    if (correct) {
      this.soundService.playCorrect();
      return;
    }

    this.soundService.playWrong();
    this.clearNextButtonTimer();
    this.nextButtonTimer = setTimeout(() => {
      this.showNextButton = true;
    }, 900);
  }

  replayLesson(): void {
    this.clearTimers();
    this.index = 0;
    this.exercise = null;
    this.attemptId = 0;
    this.completed = false;
    this.result = null;
    this.nextLesson = null;
    this.feedback = '';
    this.textAnswer = '';
    this.selectedOptionId = null;
    this.correctOptionId = null;
    this.lastExpectedAnswer = '';
    this.lastCorrect = false;
    this.showFeedback = false;
    this.showNextButton = false;
    this.answering = false;
    this.submittingAnswer = false;
    this.errorMessage = '';

    if (this.contentBlocks.length > 0) {
      this.readingMode = true;
      this.loading = false;
      return;
    }

    this.startExercises();
  }

  goToNextLesson(): void {
    if (!this.nextLesson) {
      return;
    }

    const nextLessonId = this.nextLesson.lessonId ?? this.nextLesson.id;

    if (!nextLessonId) {
      return;
    }

    this.router.navigateByUrl(`/lesson/${nextLessonId}`);
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

  promptHasTarget(prompt: string | null | undefined): boolean {
    return this.safePrompt(prompt).includes(':');
  }

  promptInstruction(prompt: string | null | undefined): string {
    return this.splitPrompt(prompt).instruction;
  }

  promptTarget(prompt: string | null | undefined): string {
    return this.splitPrompt(prompt).target;
  }

  promptInstructionClass(prompt: string | null | undefined): string {
    const instruction = this.promptInstruction(prompt).toLowerCase();

    if (instruction.includes('libanais')) {
      return 'prompt-instruction lang-libanais';
    }

    if (instruction.includes('français') || instruction.includes('francais')) {
      return 'prompt-instruction lang-francais';
    }

    return 'prompt-instruction';
  }

  promptTargetClass(_prompt: string | null | undefined): string {
    return 'prompt-target';
  }

  optionLetter(index: number): string {
    return String.fromCodePoint(65 + index);
  }

  renderMarkdown(content: string): string {
    const normalizedContent = (content ?? '').replaceAll(String.raw`\n`, '\n');
    return marked.parse(normalizedContent, {
      async: false,
      gfm: true,
      breaks: true
    });
  }

  backToCourse(): void {
    this.router.navigateByUrl('/course');
  }

  private finishLesson(): void {
    this.api.completeLesson(this.attemptId).subscribe({
      next: result => this.applyCompletionResult(result),
      error: () => {
        this.answering = false;
        this.submittingAnswer = false;
        this.errorMessage = 'Impossible de terminer la leçon.';
      }
    });
  }

  private applyCompletionResult(result: any): void {
    this.result = this.normalizeResult(result);
    this.completed = true;
    this.readingMode = false;
    this.transitioning = false;
    this.exercise = null;
    this.feedback = '';
    this.answering = false;
    this.submittingAnswer = false;
    this.selectedOptionId = null;
    this.correctOptionId = null;
    this.showFeedback = false;
    this.showNextButton = false;
    this.soundService.playComplete();
    this.loadNextLesson();
  }

  private loadNextLesson(): void {
    const apiWithNextLesson = this.api as ApiService & {
      getNextLesson?: (lessonId: number) => { subscribe: (observer: { next: (next: any) => void; error: () => void }) => void };
    };

    if (!apiWithNextLesson.getNextLesson) {
      this.nextLesson = null;
      return;
    }

    apiWithNextLesson.getNextLesson(this.lessonId).subscribe({
      next: next => {
        this.nextLesson = next;
      },
      error: () => {
        this.nextLesson = null;
      }
    });
  }

  private normalizeResult(result: any): any {
    const normalizedResult = {
      ...result,
      wrongAnswerDetails: result?.wrongAnswerDetails ?? []
    };

    if (typeof normalizedResult.wrongAnswers !== 'number') {
      normalizedResult.wrongAnswers = Math.max(
        0,
        (normalizedResult.answeredExercises ?? 0) - (normalizedResult.correctAnswers ?? 0)
      );
    }

    return normalizedResult;
  }

  private resolveCorrectOptionId(expectedAnswer: string): number | null {
    if (this.exercise?.type !== 'MULTIPLE_CHOICE') {
      return null;
    }

    const options = this.exercise.options ?? [];
    const expected = this.safePrompt(expectedAnswer).trim();
    const correctOption = options.find((option: any) => option.text === expected || option.correct === true);
    return correctOption?.id ?? null;
  }

  private resetLessonStateForLoad(): void {
    this.clearTimers();
    this.loading = true;
    this.errorMessage = '';
    this.emptyLesson = false;
    this.readingMode = true;
    this.transitioning = false;
    this.completed = false;
    this.contentBlocks = [];
    this.exercises = [];
    this.index = 0;
    this.exercise = null;
    this.attemptId = 0;
    this.textAnswer = '';
    this.feedback = '';
    this.lastCorrect = false;
    this.selectedOptionId = null;
    this.correctOptionId = null;
    this.lastExpectedAnswer = '';
    this.showFeedback = false;
    this.showNextButton = false;
    this.answering = false;
    this.submittingAnswer = false;
    this.result = null;
    this.nextLesson = null;
  }

  private splitPrompt(prompt: string | null | undefined): { instruction: string; target: string } {
    const safePrompt = this.safePrompt(prompt);
    const separatorIndex = safePrompt.indexOf(':');

    if (separatorIndex < 0) {
      return { instruction: '', target: safePrompt };
    }

    return {
      instruction: safePrompt.slice(0, separatorIndex).trim(),
      target: safePrompt.slice(separatorIndex + 1).trim()
    };
  }

  private safePrompt(prompt: string | null | undefined): string {
    return prompt ?? '';
  }

  private clearTimers(): void {
    this.clearNextButtonTimer();

    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
  }

  private clearNextButtonTimer(): void {
    if (this.nextButtonTimer) {
      clearTimeout(this.nextButtonTimer);
      this.nextButtonTimer = null;
    }
  }
}
