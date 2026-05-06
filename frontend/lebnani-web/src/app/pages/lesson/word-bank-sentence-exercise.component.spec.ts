import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WordBankSentenceExerciseComponent } from './word-bank-sentence-exercise.component';

describe('WordBankSentenceExerciseComponent', () => {
  let fixture: ComponentFixture<WordBankSentenceExerciseComponent>;
  let component: WordBankSentenceExerciseComponent;

  const defaultExercise = {
    id: 1,
    type: 'WORD_BANK_SENTENCE',
    options: [
      {
        id: 1,
        text: 'baddi'
      },
      {
        id: 2,
        text: 'rou7'
      },
      {
        id: 3,
        text: '3al beit'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordBankSentenceExerciseComponent]
    }).compileComponents();
  });

  function createComponent(exercise: any = defaultExercise, disabled = false): void {
    fixture = TestBed.createComponent(WordBankSentenceExerciseComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('exercise', exercise);
    fixture.componentRef.setInput('disabled', disabled);

    fixture.detectChanges();
  }

  it('renders the selected zone, word bank and actions', () => {
    createComponent();

    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Construis ta phrase ici...');
    expect(html.textContent).toContain('baddi');
    expect(html.textContent).toContain('rou7');
    expect(html.textContent).toContain('3al beit');
    expect(html.textContent).toContain('Effacer');
    expect(html.textContent).toContain('Valider');
  });

  it('builds the available word list from exercise options', () => {
    createComponent();

    expect(component.allWords).toEqual([
      {
        id: 1,
        text: 'baddi'
      },
      {
        id: 2,
        text: 'rou7'
      },
      {
        id: 3,
        text: '3al beit'
      }
    ]);

    expect(component.availableWords).toEqual(component.allWords);
  });

  it('selects a word and removes it from available words', () => {
    createComponent();

    component.selectWord({
      id: 1,
      text: 'baddi'
    });

    expect(component.selectedWords).toEqual([
      {
        id: 1,
        text: 'baddi'
      }
    ]);

    expect(component.availableWords.map(word => word.text)).toEqual(['rou7', '3al beit']);
  });

  it('selects words through the UI', () => {
    createComponent();

    const firstWordButton = (fixture.nativeElement as HTMLElement).querySelector('.word-chip') as HTMLButtonElement;
    firstWordButton.click();

    fixture.detectChanges();

    expect(component.selectedWords.map(word => word.text)).toEqual(['baddi']);
    expect((fixture.nativeElement as HTMLElement).querySelector('.selected-word')?.textContent).toContain('baddi');
  });

  it('removes a selected word when clicking it', () => {
    createComponent();

    const firstWordButton = (fixture.nativeElement as HTMLElement).querySelector('.word-chip') as HTMLButtonElement;
    firstWordButton.click();

    fixture.detectChanges();

    const selectedWordButton = (fixture.nativeElement as HTMLElement).querySelector('.selected-word') as HTMLButtonElement;
    selectedWordButton.click();

    fixture.detectChanges();

    expect(component.selectedWords).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Construis ta phrase ici...');
  });

  it('clears all selected words', () => {
    createComponent();

    component.selectWord({
      id: 1,
      text: 'baddi'
    });
    component.selectWord({
      id: 2,
      text: 'rou7'
    });

    component.clear();

    expect(component.selectedWords).toEqual([]);
  });

  it('emits the selected sentence when submitting', () => {
    createComponent();

    const emittedSentences: string[] = [];
    component.submitted.subscribe(sentence => emittedSentences.push(sentence));

    component.selectWord({
      id: 1,
      text: 'baddi'
    });
    component.selectWord({
      id: 2,
      text: 'rou7'
    });

    component.submit();

    expect(emittedSentences).toEqual(['baddi rou7']);
  });

  it('does not emit when no word is selected', () => {
    createComponent();

    const emitSpy = vi.spyOn(component.submitted, 'emit');

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('does not select words when disabled', () => {
    createComponent(defaultExercise, true);

    const firstWordButton = (fixture.nativeElement as HTMLElement).querySelector('.word-chip') as HTMLButtonElement;
    expect(firstWordButton.disabled).toBe(true);

    component.selectWord({
      id: 1,
      text: 'baddi'
    });

    expect(component.selectedWords).toEqual([]);
  });

  it('does not remove words when disabled', () => {
    createComponent(defaultExercise, true);

    component.selectedWords = [
      {
        id: 1,
        text: 'baddi'
      }
    ];

    component.removeWord({
      id: 1,
      text: 'baddi'
    });

    expect(component.selectedWords).toEqual([
      {
        id: 1,
        text: 'baddi'
      }
    ]);
  });

  it('does not clear words when disabled', () => {
    createComponent(defaultExercise, true);

    component.selectedWords = [
      {
        id: 1,
        text: 'baddi'
      }
    ];

    component.clear();

    expect(component.selectedWords).toEqual([
      {
        id: 1,
        text: 'baddi'
      }
    ]);
  });

  it('does not submit when disabled', () => {
    createComponent(defaultExercise, true);

    const emitSpy = vi.spyOn(component.submitted, 'emit');

    component.selectedWords = [
      {
        id: 1,
        text: 'baddi'
      }
    ];

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
