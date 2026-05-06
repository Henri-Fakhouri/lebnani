import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SoundService } from '../../core/sound.service';

type MatchPair = {
  left: string;
  right: string;
  key: string;
};

@Component({
  selector: 'app-match-pairs-exercise',
  standalone: true,
  template: `
    <div class="match-pairs">
      <div class="match-column match-column-left">
        <div class="column-header">
          <span class="language-dot"></span>
          <h2>Libanais</h2>
        </div>

        @for (item of leftItems; track item) {
          <button
            type="button"
            class="match-button match-button-left"
            [class.selected]="selectedLeft === item"
            [class.matched]="isLeftMatched(item)"
            [disabled]="disabled || isLeftMatched(item)"
            (click)="selectLeft(item)"
          >
            {{ item }}
          </button>
        }
      </div>

      <div class="match-column match-column-right">
        <div class="column-header">
          <span class="language-dot"></span>
          <h2>Français</h2>
        </div>

        @for (item of rightItems; track item) {
          <button
            type="button"
            class="match-button match-button-right"
            [class.matched]="isRightMatched(item)"
            [class.wrong]="wrongRight === item"
            [disabled]="disabled || isRightMatched(item)"
            (click)="selectRight(item)"
          >
            {{ item }}
          </button>
        }
      </div>
    </div>

    @if (matchHint) {
      <p class="match-hint" [class.error]="wrongRight">
        {{ matchHint }}
      </p>
    }
  `,
  styles: [`
    .match-pairs {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .match-column {
      display: grid;
      gap: 10px;
      align-content: start;
      padding: 14px;
      border: 1px solid var(--border-soft, #e8ded0);
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.66);
    }

    .match-column-left {
      box-shadow: inset 5px 0 0 rgba(214, 40, 40, 0.72);
    }

    .match-column-right {
      box-shadow: inset 5px 0 0 rgba(77, 168, 218, 0.72);
    }

    .column-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 2px;
    }

    .column-header h2 {
      margin: 0;
      font-size: 14px;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .match-column-left .column-header h2 {
      color: var(--lb-red, #d62828);
    }

    .match-column-right .column-header h2 {
      color: var(--sea-blue, #4da8da);
    }

    .language-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: currentColor;
    }

    .match-column-left .language-dot {
      color: var(--lb-red, #d62828);
    }

    .match-column-right .language-dot {
      color: var(--sea-blue, #4da8da);
    }

    .match-button {
      width: 100%;
      min-height: 48px;
      border: 2px solid #e7e1d6;
      border-radius: 17px;
      padding: 13px 15px;
      background: #fffdf8;
      color: #18251d;
      text-align: center;
      font-weight: 950;
      font-size: 15px;
      transition:
        background 0.14s ease,
        border-color 0.14s ease,
        transform 0.14s ease,
        box-shadow 0.14s ease;
    }

    .match-button:not(:disabled):hover {
      transform: translateY(-1px);
      background: #ffffff;
      box-shadow: 0 9px 20px rgba(0, 0, 0, 0.06);
    }

    .match-button-left:not(:disabled):hover,
    .match-button-left.selected {
      border-color: var(--lb-red, #d62828);
      background: var(--lb-red-soft, #fde2e2);
      color: var(--lb-red-dark, #a61f1f);
    }

    .match-button-right:not(:disabled):hover {
      border-color: var(--sea-blue, #4da8da);
      background: rgba(77, 168, 218, 0.12);
      color: #1b5f82;
    }

    .match-button.selected {
      box-shadow: 0 8px 18px rgba(214, 40, 40, 0.14);
    }

    .match-button.matched {
      border-color: var(--cedar-green, #1f5f43);
      background: var(--cedar-green, #1f5f43);
      color: white;
      opacity: 0.86;
    }

    .match-button.wrong {
      border-color: #b00020;
      background: #b00020;
      color: white;
      animation: shake 0.18s linear 0s 2;
    }

    .match-hint {
      margin: 14px 0 0;
      padding: 12px 14px;
      border-radius: 16px;
      background: #f3faf3;
      color: var(--cedar-green-dark, #143d2b);
      font-weight: 850;
    }

    .match-hint.error {
      background: #fff4f4;
      color: #b00020;
    }

    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }

      25% {
        transform: translateX(-3px);
      }

      75% {
        transform: translateX(3px);
      }
    }

    @media (max-width: 640px) {
      .match-pairs {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MatchPairsExerciseComponent {
  @Input({ required: true }) exercise!: any;
  @Input() disabled = false;

  @Output() completed = new EventEmitter<string>();

  selectedLeft: string | null = null;
  matchedKeys = new Set<string>();
  wrongRight = '';
  matchHint = 'Choisis un mot à gauche, puis son équivalent à droite.';

  constructor(private readonly soundService: SoundService) {}

  get pairs(): MatchPair[] {
    return (this.exercise?.options ?? [])
      .map((option: any) => this.parsePair(option.text))
      .filter((pair: MatchPair | null): pair is MatchPair => pair !== null);
  }

  get leftItems(): string[] {
    return this.pairs.map(pair => pair.left);
  }

  get rightItems(): string[] {
    return this.pairs.map(pair => pair.right).slice().reverse();
  }

  selectLeft(left: string): void {
    if (this.disabled || this.isLeftMatched(left)) {
      return;
    }

    this.selectedLeft = left;
    this.wrongRight = '';
    this.matchHint = 'Maintenant choisis la bonne traduction à droite.';
  }

  selectRight(right: string): void {
    if (this.disabled || this.isRightMatched(right)) {
      return;
    }

    if (!this.selectedLeft) {
      this.matchHint = 'Choisis d’abord un mot libanais à gauche.';
      return;
    }

    const pair = this.pairs.find(item => item.left === this.selectedLeft);

    if (!pair) {
      return;
    }

    if (pair.right !== right) {
      this.wrongRight = right;
      this.matchHint = 'Pas cette paire. Réessaie.';
      this.soundService.playWrong();

      setTimeout(() => {
        this.wrongRight = '';
      }, 450);

      return;
    }

    this.matchedKeys.add(pair.key);
    this.selectedLeft = null;
    this.wrongRight = '';
    this.soundService.playCorrect();

    if (this.matchedKeys.size === this.pairs.length) {
      this.matchHint = 'Toutes les paires sont correctes.';
      this.completed.emit(this.buildAnswer());
      return;
    }

    this.matchHint = 'Bonne paire. Continue.';
  }

  isLeftMatched(left: string): boolean {
    const pair = this.pairs.find(item => item.left === left);
    return pair ? this.matchedKeys.has(pair.key) : false;
  }

  isRightMatched(right: string): boolean {
    const pair = this.pairs.find(item => item.right === right);
    return pair ? this.matchedKeys.has(pair.key) : false;
  }

  private parsePair(value: string): MatchPair | null {
    const parts = value.split('=>');

    if (parts.length !== 2) {
      return null;
    }

    const left = parts[0].trim();
    const right = parts[1].trim();

    if (!left || !right) {
      return null;
    }

    return {
      left,
      right,
      key: `${left}=>${right}`
    };
  }

  private buildAnswer(): string {
    return this.pairs
      .map(pair => `${pair.left}=>${pair.right}`)
      .join('|');
  }
}