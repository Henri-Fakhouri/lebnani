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
      <div class="match-column">
        <h2>Libanais</h2>

        @for (item of leftItems; track item) {
          <button
            type="button"
            class="match-button"
            [class.selected]="selectedLeft === item"
            [class.matched]="isLeftMatched(item)"
            [disabled]="disabled || isLeftMatched(item)"
            (click)="selectLeft(item)"
          >
            {{ item }}
          </button>
        }
      </div>

      <div class="match-column">
        <h2>Français</h2>

        @for (item of rightItems; track item) {
          <button
            type="button"
            class="match-button"
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
      gap: 16px;
      margin-top: 18px;
    }

    .match-column {
      display: grid;
      gap: 10px;
      align-content: start;
    }

    .match-column h2 {
      margin: 0 0 4px;
      font-size: 15px;
      color: var(--text-muted, #65726a);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .match-button {
      width: 100%;
      border: 2px solid #e7e1d6;
      border-radius: 18px;
      padding: 14px 16px;
      background: #fffdf8;
      color: #18251d;
      text-align: center;
      font-weight: 900;
      font-size: 15px;
      transition:
        background 0.14s ease,
        border-color 0.14s ease,
        transform 0.14s ease,
        box-shadow 0.14s ease;
    }

    .match-button:not(:disabled):hover {
      transform: translateY(-1px);
      border-color: var(--cedar-green, #1f5f43);
      background: #f8fbf6;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
    }

    .match-button.selected {
      border-color: var(--cedar-green, #1f5f43);
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
      box-shadow: 0 8px 18px rgba(31, 95, 67, 0.14);
    }

    .match-button.matched {
      border-color: #1b7f3a;
      background: #1b7f3a;
      color: white;
      opacity: 0.78;
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
      border-radius: 14px;
      background: #f3faf3;
      color: var(--cedar-green-dark, #143d2b);
      font-weight: 800;
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