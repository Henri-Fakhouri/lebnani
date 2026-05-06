import { Component, EventEmitter, Input, Output } from '@angular/core';

type WordBankItem = {
  id: number;
  text: string;
};

@Component({
  selector: 'app-word-bank-sentence-exercise',
  standalone: true,
  template: `
    <div class="sentence-builder">
      <div class="selected-zone" [class.empty]="selectedWords.length === 0">
        @if (selectedWords.length === 0) {
          <span>Construis ta phrase ici...</span>
        }

        @for (word of selectedWords; track word.id) {
          <button
            type="button"
            class="selected-word"
            [disabled]="disabled"
            (click)="removeWord(word)"
          >
            {{ word.text }}
          </button>
        }
      </div>

      <div class="word-bank">
        @for (word of availableWords; track word.id) {
          <button
            type="button"
            class="word-chip"
            [disabled]="disabled"
            (click)="selectWord(word)"
          >
            {{ word.text }}
          </button>
        }
      </div>

      <div class="word-bank-actions">
        <button
          type="button"
          class="secondary-button"
          [disabled]="disabled || selectedWords.length === 0"
          (click)="clear()"
        >
          Effacer
        </button>

        <button
          type="button"
          class="primary-button"
          [disabled]="disabled || selectedWords.length === 0"
          (click)="submit()"
        >
          Valider
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sentence-builder {
      display: grid;
      gap: 16px;
      margin-top: 18px;
    }

    .selected-zone {
      min-height: 78px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      padding: 16px;
      border: 2px dashed var(--border-soft, #e8ded0);
      border-radius: 20px;
      background: #fffdf8;
    }

    .selected-zone.empty {
      color: var(--text-muted, #65726a);
      font-weight: 800;
    }

    .word-bank {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 16px;
      border-radius: 20px;
      background: #f8f4ec;
      border: 1px solid var(--border-soft, #e8ded0);
    }

    .word-chip,
    .selected-word {
      border: 2px solid #e7e1d6;
      border-radius: 999px;
      padding: 12px 16px;
      font-weight: 900;
      background: white;
      color: #18251d;
      transition:
        transform 0.14s ease,
        background 0.14s ease,
        border-color 0.14s ease,
        box-shadow 0.14s ease;
    }

    .word-chip:not(:disabled):hover,
    .selected-word:not(:disabled):hover {
      transform: translateY(-1px);
      border-color: var(--cedar-green, #1f5f43);
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
    }

    .selected-word {
      background: var(--cedar-green-soft, #dceee3);
      color: var(--cedar-green-dark, #143d2b);
      border-color: var(--cedar-green, #1f5f43);
    }

    .word-bank-actions {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 10px;
    }

    .primary-button,
    .secondary-button {
      border: 0;
      border-radius: 999px;
      padding: 14px 18px;
      font-weight: 900;
    }

    .primary-button {
      color: white;
      background: var(--cedar-green, #1f5f43);
    }

    .secondary-button {
      color: var(--cedar-green-dark, #143d2b);
      background: var(--cedar-green-soft, #dceee3);
    }

    button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  `]
})
export class WordBankSentenceExerciseComponent {
  @Input({ required: true }) exercise!: any;
  @Input() disabled = false;

  @Output() submitted = new EventEmitter<string>();

  selectedWords: WordBankItem[] = [];

  get allWords(): WordBankItem[] {
    return (this.exercise?.options ?? []).map((option: any, index: number) => ({
      id: option.id ?? index,
      text: option.text
    }));
  }

  get availableWords(): WordBankItem[] {
    const selectedIds = new Set(this.selectedWords.map(word => word.id));
    return this.allWords.filter(word => !selectedIds.has(word.id));
  }

  selectWord(word: WordBankItem): void {
    if (this.disabled) {
      return;
    }

    this.selectedWords = [...this.selectedWords, word];
  }

  removeWord(word: WordBankItem): void {
    if (this.disabled) {
      return;
    }

    this.selectedWords = this.selectedWords.filter(selected => selected.id !== word.id);
  }

  clear(): void {
    if (this.disabled) {
      return;
    }

    this.selectedWords = [];
  }

  submit(): void {
    if (this.disabled || this.selectedWords.length === 0) {
      return;
    }

    this.submitted.emit(
      this.selectedWords
        .map(word => word.text)
        .join(' ')
    );
  }
}