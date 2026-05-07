import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';

import {
  ApiService,
  LessonContentBlockResponse
} from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MascotComponent, MascotMood } from '../../shared/mascot/mascot.component';
import { SoundService } from '../../core/sound.service';
import { MatchPairsExerciseComponent } from './match-pairs-exercise.component';
import { WordBankSentenceExerciseComponent } from './word-bank-sentence-exercise.component';

type NextLessonLike = {
  lessonId: number;
  lessonTitle?: string;
  title?: string;
};

type CompleteLessonLike = {
  attemptId?: number;
  lessonId?: number;
  status?: string;
  totalExercises: number;
  answeredExercises?: number;
  correctAnswers: number;
  wrongAnswers?: number;
  scorePercent: number;
  xpAwarded: number;
  wrongAnswerDetails?: WrongAnswerDetailLike[];
};

type WrongAnswerDetailLike = {
  promptFr: string;
  submittedAnswer: string;
  correctAnswer: string;
};

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [
    FormsModule,
    MascotComponent,
    MatchPairsExerciseComponent,
    WordBankSentenceExerciseComponent
  ],
  template: `
    <main class="lesson-page">
      <div class="lesson-shell">
        <div class="lesson-flag"></div>

        <header class="lesson-topbar">
          <button type="button" class="ghost-button" (click)="backToCourse()">
            ← Parcours
          </button>

          @if (!loading && !completed && !readingMode && !transitioning && exercise) {
            <span class="chip">
              Question {{ index + 1 }} / {{ exercises.length }}
            </span>
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
              <app-mascot
                mood="thinking"
                size="lg"
                message="Je charge la leçon. Deux secondes."
              />
            </div>
          }

          @if (!loading && errorMessage) {
            <div class="state-panel fade-in">
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
            <div class="state-panel fade-in">
              <app-mascot
                mood="encouraging"
                size="lg"
                message="Cette leçon n’a pas encore d’exercices."
              />

              <h1 class="state-title">Leçon vide</h1>
              <p class="state-sub">Reviens bientôt, le contenu arrive.</p>

              <div class="state-actions">
                <button type="button" class="primary-button" (click)="backToCourse()">
                  Retour au parcours
                </button>
              </div>
            </div>
          }

          @if (!loading && !errorMessage && !emptyLesson && readingMode && contentBlocks.length > 0) {
            <section class="reading-hero fade-in">
              <div class="hero-copy">
                <span class="eyebrow">Cours</span>
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

            <div class="course-content fade-in">
              @for (block of contentBlocks; track block.id) {
                @if (block.type === 'HEADING') {
                  <h2 class="content-heading">{{ block.content }}</h2>
                }

                @if (block.type === 'MARKDOWN') {
                  <div class="markdown-block" [innerHTML]="renderMarkdown(block.content)"></div>
                }

                @if (block.type === 'NOTE') {
                  <div class="note-block">
                    <span class="block-label">Note</span>
                    <p>{{ block.content }}</p>
                  </div>
                }

                @if (block.type === 'EXAMPLE') {
                  <div class="example-block">
                    <span class="block-label">Exemple</span>
                    <p>{{ block.content }}</p>
                  </div>
                }
              }
            </div>

            @if (exercises.length > 0) {
              <button type="button" class="primary-button full-width next-button" (click)="beginTransition()">
                Commencer les exercices →
              </button>
            }

            @if (exercises.length === 0) {
              <button
                type="button"
                class="primary-button full-width next-button"
                [disabled]="answering"
                (click)="completeCourseOnlyLesson()"
              >
                Terminer la lecture
              </button>
            }
          }

          @if (!loading && !errorMessage && transitioning) {
            <div class="state-panel fade-in">
              <app-mascot
                mood="excited"
                size="lg"
                message="C’est parti pour les exercices !"
              />
              <div class="transition-spinner"></div>
            </div>
          }

          @if (!loading && !errorMessage && !emptyLesson && !readingMode && !transitioning && !completed && exercise) {
            <section class="exercise-section fade-in">
              <section class="exercise-hero">
                <div class="exercise-copy">
                  <span [class]="exerciseTypeChipClass(exercise.type)">
                    {{ exerciseTypeLabel(exercise.type) }}
                  </span>

                  @if (promptHasTarget(exercise.promptFr)) {
                    <div class="prompt-stack">
                      <span [class]="promptInstructionClass(exercise.promptFr)">
                        {{ promptInstruction(exercise.promptFr) }}
                      </span>

                      <h1 [class]="promptTargetClass(exercise.promptFr)">
                        {{ promptTarget(exercise.promptFr) }}
                      </h1>
                    </div>
                  } @else {
                    <h1 [class]="promptTargetClass(exercise.promptFr)">
                      {{ exercise.promptFr }}
                    </h1>
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
                  @for (opt of exercise.options; track opt.id; let optionIndex = $index) {
                    <button
                      type="button"
                      class="option-button"
                      [class.selected]="selectedOptionId === opt.id"
                      [class.correct-selected]="showFeedback && opt.id === correctOptionId"
                      [class.wrong-selected]="showFeedback && selectedOptionId === opt.id && !lastCorrect"
                      [disabled]="answering || showFeedback"
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
                  <input
                    [(ngModel)]="textAnswer"
                    [disabled]="answering || showFeedback"
                    placeholder="Ta réponse"
                    (keyup.enter)="answerText()"
                  />

                  @if (!showFeedback) {
                    <button
                      type="button"
                      class="primary-button"
                      [disabled]="answering || !textAnswer.trim()"
                      (click)="answerText()"
                    >
                      Valider
                    </button>
                  }
                </div>
              }

              @if (exercise.type === 'WORD_BANK_SENTENCE') {
                <app-word-bank-sentence-exercise
                  [exercise]="exercise"
                  [disabled]="answering || showFeedback"
                  (submitted)="answerWordBankSentence($event)"
                />
              }

              @if (exercise.type === 'MATCH_PAIRS') {
                <app-match-pairs-exercise
                  [exercise]="exercise"
                  [disabled]="answering || showFeedback"
                  (completed)="answerMatchPairs($event)"
                />
              }

              @if (feedback) {
                <div class="feedback-panel fade-in" [class.correct]="lastCorrect" [class.wrong]="!lastCorrect">
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

                  @if (!lastCorrect && lastExpectedAnswer) {
                    <div class="correct-answer-reveal">
                      <span>Bonne réponse :</span>
                      <strong>{{ lastExpectedAnswer }}</strong>
                    </div>
                  }

                  @if (showNextButton) {
                    <button type="button" class="primary-button full-width next-button fade-in" (click)="next()">
                      {{ isLastQuestion ? 'Terminer la leçon' : 'Continuer' }}
                    </button>
                  }
                </div>
              }
            </section>
          }

          @if (!loading && !errorMessage && completed && result) {
            <section class="result-screen fade-in">
              <div class="result-top">
                <div class="score-circle-wrap pop-in">
                  <svg class="score-ring" viewBox="0 0 100 100">
                    <circle class="ring-track" cx="50" cy="50" r="40"></circle>
                    <circle
                      class="ring-fill"
                      [class.ring-perfect]="result.scorePercent === 100"
                      cx="50"
                      cy="50"
                      r="40"
                      [style.stroke-dashoffset]="scoreCircleOffset"
                    ></circle>
                  </svg>

                  <div class="score-overlay">
                    <span class="score-pct">{{ result.scorePercent }}%</span>
                    <span class="score-sub">score</span>
                  </div>
                </div>

                <div class="hero-copy">
                  <span class="eyebrow">Résultat</span>
                  <h1>Leçon terminée</h1>
                  <p>{{ resultMascotMessage }}</p>
                </div>

                <app-mascot
                  [mood]="resultMascotMood"
                  size="md"
                  [message]="resultMascotMessage"
                />
              </div>

              @if (result.xpAwarded > 0) {
                <div class="xp-badge pop-in">
                  +{{ result.xpAwarded }} XP ⭐
                </div>
              }

              @if (result.xpAwarded === 0) {
                <p class="hint">
                  Cette leçon était déjà terminée, donc aucun XP supplémentaire n’a été accordé.
                </p>
              }

              <div class="result-grid">
                <div class="result-item">
                  <strong>{{ result.correctAnswers }}/{{ result.totalExercises }}</strong>
                  <span>bonnes réponses</span>
                </div>

                <div class="result-item">
                  <strong>{{ resultWrongAnswers }}</strong>
                  <span>erreurs</span>
                </div>

                <div class="result-item">
                  <strong>{{ result.xpAwarded }}</strong>
                  <span>XP gagnés</span>
                </div>
              </div>

              @if (wrongAnswerDetails.length > 0) {
                <section class="wrong-section">
                  <h3>Ce qui mérite attention :</h3>

                  <div class="wrong-list">
                    @for (wrong of wrongAnswerDetails; track wrong.promptFr) {
                      <article class="wrong-card">
                        <p class="wrong-prompt">{{ wrong.promptFr }}</p>

                        <div class="wrong-line">
                          <span>Ta réponse :</span>
                          <strong class="wrong-value">{{ wrong.submittedAnswer }}</strong>
                        </div>

                        <div class="wrong-line">
                          <span>Bonne réponse :</span>
                          <strong class="correct-value">{{ wrong.correctAnswer }}</strong>
                        </div>
                      </article>
                    }
                  </div>
                </section>
              }

              <div class="result-actions">
                <button type="button" class="ghost-button" (click)="replayLesson()">
                  🔁 Rejouer
                </button>

                @if (nextLesson) {
                  <button type="button" class="primary-button next-lesson-button" (click)="goToNextLesson()">
                    <small>Leçon suivante</small>
                    <span>{{ nextLessonTitle }} →</span>
                  </button>
                }

                <button type="button" class="primary-button" (click)="backToCourse()">
                  Retour au parcours
                </button>
              </div>
            </section>
          }
        </section>
      </div>
    </main>
  `,
  styles: [`
    .lesson-page {
      min-height: 100vh;
      padding: 32px 20px;
      color: var(--text-main, #1f2933);
      background:
        radial-gradient(circle at 12% 10%, rgba(214, 40, 40, 0.08), transparent 28%),
        radial-gradient(circle at 88% 18%, rgba(31, 95, 67, 0.12), transparent 30%),
        linear-gradient(135deg, var(--cream, #f8f4ec), #fffaf2);
    }

    .lesson-shell {
      width: min(100%, 980px);
      margin: 0 auto;
    }

    .lesson-flag {
      position: relative;
      height: 8px;
      margin-bottom: 18px;
      overflow: hidden;
      border-radius: 999px;
      background: linear-gradient(
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
      clip-path: polygon(50% 0%, 76% 24%, 62% 24%, 90% 50%, 70% 50%, 100% 76%, 58% 76%, 58% 100%, 42% 100%, 42% 76%, 0% 76%, 30% 50%, 10% 50%, 38% 24%, 24% 24%);
    }

    .lesson-topbar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }

    .lesson-card {
      padding: 28px;
      border: 1px solid var(--border-soft, #e8ded0);
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: var(--shadow-soft, 0 14px 35px rgba(31, 41, 51, 0.08));
    }

    .ghost-button,
    .primary-button {
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
    }

    .ghost-button {
      color: var(--cedar-green-dark, #143d2b);
      background: var(--cedar-green-soft, #dceee3);
    }

    .primary-button {
      color: white;
      background: var(--cedar-green, #1f5f43);
      box-shadow: 0 10px 24px rgba(31, 95, 67, 0.24);
    }

    .ghost-button:hover,
    .primary-button:hover {
      transform: translateY(-1px);
    }

    .primary-button:disabled {
      opacity: 0.55;
      cursor: default;
      transform: none;
    }

    .full-width {
      width: 100%;
    }

    .chip,
    .eyebrow,
    .exercise-type-chip {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      border-radius: 999px;
      font-weight: 900;
    }

    .chip {
      gap: 6px;
      padding: 6px 10px;
      color: var(--cedar-green-dark, #143d2b);
      background: var(--cedar-green-soft, #dceee3);
      font-size: 13px;
    }

    .chip-gold {
      color: #6f4c00;
      background: #fff1c9;
    }

    .eyebrow,
    .exercise-type-chip {
      padding: 7px 12px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .eyebrow,
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

    .state-panel,
    .reading-hero,
    .exercise-hero {
      display: grid;
      gap: 20px;
      align-items: center;
    }

    .state-panel {
      text-align: center;
    }

    .reading-hero,
    .exercise-hero {
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
    .state-sub {
      margin: 0;
      color: var(--text-muted, #65726a);
      font-weight: 700;
      line-height: 1.5;
    }

    .state-title {
      margin: 0;
      font-size: 32px;
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .state-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .transition-spinner {
      width: 42px;
      height: 42px;
      margin: 0 auto;
      border: 4px solid var(--cedar-green-soft, #dceee3);
      border-top-color: var(--cedar-green, #1f5f43);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .question-progress-bar {
      height: 12px;
      margin-top: 16px;
      overflow: hidden;
      border-radius: 999px;
      background: var(--cream-2, #efe7da);
    }

    .question-progress-bar div {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--cedar-green, #1f5f43), #2f8b61);
    }

    .course-content,
    .exercise-section {
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
      margin: 0 0 14px;
      color: #2d3a30;
    }

    :host ::ng-deep .markdown-block strong {
      color: #18251d;
      font-weight: 800;
    }

    :host ::ng-deep .markdown-block table {
      width: 100%;
      margin: 16px 0;
      overflow: hidden;
      border: 1px solid #e7e1d6;
      border-radius: 12px;
      border-collapse: collapse;
    }

    :host ::ng-deep .markdown-block th,
    :host ::ng-deep .markdown-block td {
      border: 1px solid #e7e1d6;
      padding: 10px 12px;
      text-align: left;
    }

    :host ::ng-deep .markdown-block th {
      color: #253d2c;
      background: #eef4ed;
      font-weight: 800;
    }

    :host ::ng-deep .markdown-block td {
      color: #18251d;
      background: #fffdf8;
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
      color: #6a5320;
      background: #fff7df;
      border: 1px solid #f3e1a5;
    }

    .example-block {
      color: #253d2c;
      background: #f3faf3;
      border: 1px solid #d7ebd7;
    }

    .block-label {
      display: block;
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .note-block p,
    .example-block p {
      margin: 0;
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

    .prompt-instruction.lang-libanais {
      color: var(--lb-red, #d62828);
    }

    .prompt-instruction.lang-francais {
      color: var(--sea-blue, #4da8da);
    }

    .prompt-target {
      color: var(--text-main, #1f2933);
      font-size: clamp(36px, 5vw, 58px);
      font-weight: 950;
      line-height: 0.95;
      letter-spacing: -0.055em;
    }

    .options,
    .typed-answer {
      display: grid;
      gap: 12px;
    }

    .option-button {
      width: 100%;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 12px;
      align-items: center;
      border: 2px solid #e7e1d6;
      border-radius: 18px;
      padding: 14px 16px;
      color: #18251d;
      background: #fffdf8;
      text-align: left;
      font-size: 15px;
      font-weight: 850;
      cursor: pointer;
      transition: background 0.14s ease, border-color 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease;
    }

    .option-letter {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border-radius: 999px;
      color: var(--cedar-green-dark, #143d2b);
      background: var(--cedar-green-soft, #dceee3);
      font-size: 12px;
      font-weight: 950;
    }

    .option-button:not(:disabled):hover,
    .option-button.selected {
      border-color: var(--cedar-green, #1f5f43);
      background: #f8fbf6;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    .option-button.correct-selected {
      border-color: #1b7f3a;
      color: white;
      background: #1b7f3a;
      box-shadow: 0 8px 18px rgba(27, 127, 58, 0.18);
    }

    .option-button.wrong-selected {
      border-color: #b00020;
      color: white;
      background: #b00020;
      box-shadow: 0 8px 18px rgba(176, 0, 32, 0.18);
      animation: shake 0.25s ease;
    }

    .option-button.correct-selected .option-letter,
    .option-button.wrong-selected .option-letter {
      color: inherit;
      background: rgba(255, 255, 255, 0.18);
    }

    .option-button:disabled:not(.correct-selected):not(.wrong-selected) {
      opacity: 0.55;
      color: #667064;
      background: #f4f1ea;
      border-color: #e7e1d6;
      cursor: default;
    }

    .typed-answer input {
      padding: 14px;
      border: 1px solid #ddd;
      border-radius: 16px;
      background: white;
      font-size: 16px;
    }

    .typed-answer input:disabled {
      color: #667064;
      background: #f4f1ea;
    }

    .feedback-panel {
      margin-top: 18px;
      border: 1px solid #d7ebd7;
      border-radius: 22px;
      padding: 16px;
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
      color: #1f2933;
      font-weight: 800;
      line-height: 1.45;
    }

    .correct-answer-reveal {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 14px;
      border-radius: 16px;
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.72);
      font-weight: 850;
    }

    .correct-answer-reveal span {
      color: var(--text-muted, #65726a);
    }

    .correct-answer-reveal strong {
      color: #14532d;
    }

    .result-screen {
      display: grid;
      gap: 20px;
    }

    .result-top {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .score-circle-wrap {
      position: relative;
      width: 120px;
      height: 120px;
      flex-shrink: 0;
    }

    .score-ring {
      width: 120px;
      height: 120px;
      transform: rotate(-90deg);
    }

    .ring-track,
    .ring-fill {
      fill: none;
      stroke-width: 8;
    }

    .ring-track {
      stroke: #e8ded0;
    }

    .ring-fill {
      stroke: var(--cedar-green, #1f5f43);
      stroke-linecap: round;
      stroke-dasharray: 251.3;
      transition: stroke-dashoffset 1s ease;
    }

    .ring-perfect {
      stroke: #f59e0b;
    }

    .score-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      display: grid;
      gap: 2px;
      text-align: center;
      transform: translate(-50%, -50%);
    }

    .score-pct {
      font-size: 24px;
      font-weight: 950;
      letter-spacing: -0.04em;
    }

    .score-sub {
      color: var(--text-muted, #65726a);
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .xp-badge {
      width: fit-content;
      border-radius: 999px;
      padding: 10px 16px;
      background: #fff1c9;
      color: #6f4c00;
      font-weight: 950;
      box-shadow: 0 8px 20px rgba(251, 191, 36, 0.22);
    }

    .hint {
      margin: 0;
      padding: 12px 14px;
      border: 1px solid #f3e1a5;
      border-radius: 16px;
      background: #fff7df;
      color: #6a5320;
      font-weight: 800;
    }

    .result-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }

    .result-item {
      border: 1px solid #eee8dc;
      border-radius: 18px;
      padding: 18px;
      background: #fffdf8;
    }

    .result-item strong {
      display: block;
      color: var(--cedar-green, #1f5f43);
      font-size: 30px;
    }

    .result-item span {
      display: block;
      margin-top: 4px;
      color: var(--text-muted, #65726a);
      font-size: 14px;
      font-weight: 700;
    }

    .wrong-section h3 {
      margin: 0 0 12px;
      font-size: 18px;
    }

    .wrong-list {
      display: grid;
      gap: 10px;
    }

    .wrong-card {
      display: grid;
      gap: 8px;
      border: 1px solid #ffd0d0;
      border-radius: 18px;
      padding: 14px;
      background: #fff4f4;
    }

    .wrong-prompt {
      margin: 0;
      font-weight: 900;
    }

    .wrong-line {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 14px;
      font-weight: 800;
    }

    .wrong-line span {
      color: var(--text-muted, #65726a);
    }

    .wrong-value {
      color: #b00020;
    }

    .correct-value {
      color: #14532d;
    }

    .result-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .next-lesson-button {
      display: grid;
      gap: 2px;
      text-align: left;
    }

    .next-lesson-button small {
      opacity: 0.85;
      font-size: 11px;
      font-weight: 700;
    }

    .next-lesson-button span {
      font-weight: 950;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.72);
      }
      70% {
        transform: scale(1.06);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      25% {
        transform: translateX(-4px);
      }
      75% {
        transform: translateX(4px);
      }
    }

    .fade-in {
      animation: fadeIn 0.3s ease both;
    }

    .pop-in {
      animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    @media (max-width: 900px) {
      .reading-hero,
      .exercise-hero {
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

      .result-actions button {
        width: 100%;
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
  lastExpectedAnswer = '';
  selectedOptionId: number | null = null;
  correctOptionId: number | null = null;

  loading = true;
  answering = false;
  readingMode = true;
  transitioning = false;
  emptyLesson = false;
  completed = false;
  showFeedback = false;
  showNextButton = false;
  result: CompleteLessonLike = null as unknown as CompleteLessonLike;
  nextLesson: NextLessonLike | null = null;
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
    this.loadLesson(this.lessonId);
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

  get resultWrongAnswers(): number {
    if (!this.result) {
      return 0;
    }

    return this.result.wrongAnswers ?? Math.max(0, this.result.totalExercises - this.result.correctAnswers);
  }

  get wrongAnswerDetails(): WrongAnswerDetailLike[] {
    return this.result?.wrongAnswerDetails ?? [];
  }

  get scoreCircleOffset(): number {
    const circumference = 2 * Math.PI * 40;
    const score = this.result?.scorePercent ?? 0;
    return circumference * (1 - score / 100);
  }

  get nextLessonTitle(): string {
    return this.nextLesson?.lessonTitle ?? this.nextLesson?.title ?? 'Leçon suivante';
  }

  private loadLesson(lessonId: number): void {
    this.resetBeforeLoad();
    this.lessonId = lessonId;

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

  private resetBeforeLoad(): void {
    this.contentBlocks = [];
    this.exercises = [];
    this.index = 0;
    this.exercise = null;
    this.textAnswer = '';
    this.feedback = '';
    this.lastCorrect = false;
    this.lastExpectedAnswer = '';
    this.selectedOptionId = null;
    this.correctOptionId = null;
    this.loading = true;
    this.answering = false;
    this.readingMode = true;
    this.transitioning = false;
    this.emptyLesson = false;
    this.completed = false;
    this.showFeedback = false;
    this.showNextButton = false;
    this.result = null as unknown as CompleteLessonLike;
    this.nextLesson = null;
    this.errorMessage = '';
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
  this.loading = false;
  this.readingMode = false;
  this.transitioning = true;

  this.api.startLesson(this.lessonId).subscribe({
    next: start => {
      this.attemptId = start.attemptId;
      this.exercise = this.exercises[this.index];

      window.setTimeout(() => {
        this.transitioning = false;
        this.loading = false;
      }, 250);
    },
    error: () => {
      this.loading = false;
      this.transitioning = false;
      this.errorMessage = 'Impossible de démarrer la leçon.';
    }
  });
}

  startExercises(): void {
    this.loading = true;
    this.readingMode = false;
    this.transitioning = false;

    this.api.startLesson(this.lessonId).subscribe({
      next: start => {
        this.attemptId = start.attemptId;
        this.exercise = this.exercises[this.index];
        this.loading = false;
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
            this.setCompletedResult(result);
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
    this.showFeedback = false;
    this.showNextButton = false;
    this.textAnswer = '';
    this.selectedOptionId = null;
    this.correctOptionId = null;
    this.lastExpectedAnswer = '';
    this.answering = false;
  }

  nextExercise(): void {
    this.next();
  }

  private finishLesson(): void {
    this.api.completeLesson(this.attemptId).subscribe({
      next: result => {
        this.setCompletedResult(result);
      },
      error: () => {
        this.answering = false;
        this.errorMessage = 'Impossible de terminer la leçon.';
      }
    });
  }

  private setCompletedResult(result: CompleteLessonLike): void {
    this.result = {
      ...result,
      wrongAnswers: result.wrongAnswers ?? Math.max(0, result.totalExercises - result.correctAnswers),
      wrongAnswerDetails: result.wrongAnswerDetails ?? []
    };

    this.completed = true;
    this.readingMode = false;
    this.transitioning = false;
    this.emptyLesson = false;
    this.exercise = null;
    this.feedback = '';
    this.showFeedback = false;
    this.showNextButton = false;
    this.answering = false;
    this.loading = false;
    this.selectedOptionId = null;
    this.correctOptionId = null;

    this.soundService.playComplete();
    this.loadNextLesson();
  }

  private loadNextLesson(): void {
    const apiWithNextLesson = this.api as ApiService & {
      getNextLesson?: (lessonId: number) => { subscribe: (observer: {
        next: (nextLesson: NextLessonLike | null) => void;
        error: () => void;
      }) => void };
    };

    if (typeof apiWithNextLesson.getNextLesson !== 'function') {
      this.nextLesson = null;
      return;
    }

    apiWithNextLesson.getNextLesson(this.lessonId).subscribe({
      next: nextLesson => {
        this.nextLesson = nextLesson;
      },
      error: () => {
        this.nextLesson = null;
      }
    });
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

  selectOption(optionId: number): void {
    this.answerMC(optionId);
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

  submitTypedAnswer(): void {
    this.answerText();
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

  submitMatchPairs(answer: string): void {
    this.answerMatchPairs(answer);
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

  submitWordBank(answer: string): void {
    this.answerWordBankSentence(answer);
  }

  handleAnswerResult(correct: boolean, expectedAnswer: string): void {
    this.lastCorrect = correct;
    this.lastExpectedAnswer = expectedAnswer ?? '';
    this.feedback = correct
      ? 'Correct'
      : `Incorrect. Réponse attendue : ${expectedAnswer}`;
    this.answering = false;
    this.showFeedback = true;
    this.showNextButton = correct;

    this.resolveCorrectOptionId(expectedAnswer);

    if (correct) {
      this.soundService.playCorrect();
      return;
    }

    this.soundService.playWrong();

    window.setTimeout(() => {
      this.showNextButton = true;
    }, 900);
  }

  private resolveCorrectOptionId(expectedAnswer: string): void {
    this.correctOptionId = null;

    if (this.exercise?.type !== 'MULTIPLE_CHOICE') {
      return;
    }

    const correctOption = (this.exercise.options ?? []).find((option: any) =>
      option.correct === true || option.text === expectedAnswer
    );

    this.correctOptionId = correctOption?.id ?? null;
  }

  replayLesson(): void {
    this.index = 0;
    this.exercise = null;
    this.attemptId = 0;
    this.textAnswer = '';
    this.feedback = '';
    this.lastCorrect = false;
    this.lastExpectedAnswer = '';
    this.selectedOptionId = null;
    this.correctOptionId = null;
    this.answering = false;
    this.completed = false;
    this.showFeedback = false;
    this.showNextButton = false;
    this.result = null as unknown as CompleteLessonLike;
    this.nextLesson = null;
    this.errorMessage = '';
    this.emptyLesson = false;
    this.transitioning = false;

    if (this.contentBlocks.length > 0) {
      this.loading = false;
      this.readingMode = true;
      return;
    }

    this.startExercises();
  }

  goToNextLesson(): void {
    if (!this.nextLesson) {
      return;
    }

    this.router.navigate(['/lesson', this.nextLesson.lessonId]);
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

  private splitPrompt(prompt: string | null | undefined): { instruction: string; target: string } {
    const safePrompt = this.safePrompt(prompt);
    const separatorIndex = safePrompt.indexOf(':');

    if (separatorIndex < 0) {
      return {
        instruction: '',
        target: safePrompt
      };
    }

    return {
      instruction: safePrompt.slice(0, separatorIndex).trim(),
      target: safePrompt.slice(separatorIndex + 1).trim()
    };
  }

  private safePrompt(prompt: string | null | undefined): string {
    return prompt ?? '';
  }
}