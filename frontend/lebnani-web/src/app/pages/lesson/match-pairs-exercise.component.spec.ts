import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SoundService } from '../../core/sound.service';
import { MatchPairsExerciseComponent } from './match-pairs-exercise.component';

describe('MatchPairsExerciseComponent', () => {
  let fixture: ComponentFixture<MatchPairsExerciseComponent>;
  let component: MatchPairsExerciseComponent;
  let soundService: {
    playCorrect: ReturnType<typeof vi.fn>;
    playWrong: ReturnType<typeof vi.fn>;
  };

  const defaultExercise = {
    id: 1,
    type: 'MATCH_PAIRS',
    options: [
      {
        id: 1,
        text: 'mar7aba => bonjour'
      },
      {
        id: 2,
        text: 'choukran => merci'
      }
    ]
  };

  beforeEach(async () => {
    soundService = {
      playCorrect: vi.fn(),
      playWrong: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MatchPairsExerciseComponent],
      providers: [
        {
          provide: SoundService,
          useValue: soundService
        }
      ]
    }).compileComponents();
  });

  function createComponent(exercise: any = defaultExercise, disabled = false): void {
    fixture = TestBed.createComponent(MatchPairsExerciseComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('exercise', exercise);
    fixture.componentRef.setInput('disabled', disabled);

    fixture.detectChanges();
  }

  it('renders both columns and all pair values', () => {
    createComponent();

    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Libanais');
    expect(html.textContent).toContain('Français');
    expect(html.textContent).toContain('mar7aba');
    expect(html.textContent).toContain('bonjour');
    expect(html.textContent).toContain('choukran');
    expect(html.textContent).toContain('merci');
  });

  it('parses valid pairs from exercise options', () => {
    createComponent();

    expect(component.pairs).toEqual([
      {
        left: 'mar7aba',
        right: 'bonjour',
        key: 'mar7aba=>bonjour'
      },
      {
        left: 'choukran',
        right: 'merci',
        key: 'choukran=>merci'
      }
    ]);
  });

  it('ignores invalid pair values', () => {
    createComponent({
      id: 2,
      type: 'MATCH_PAIRS',
      options: [
        {
          id: 1,
          text: 'invalid'
        },
        {
          id: 2,
          text: '=> missing left'
        },
        {
          id: 3,
          text: 'missing right =>'
        },
        {
          id: 4,
          text: 'sah => oui'
        }
      ]
    });

    expect(component.pairs).toEqual([
      {
        left: 'sah',
        right: 'oui',
        key: 'sah=>oui'
      }
    ]);
  });

  it('returns left items in original order', () => {
    createComponent();

    expect(component.leftItems).toEqual(['mar7aba', 'choukran']);
  });

  it('returns right items in reversed order', () => {
    createComponent();

    expect(component.rightItems).toEqual(['merci', 'bonjour']);
  });

  it('asks the user to choose a left word first', () => {
    createComponent();

    component.selectRight('bonjour');

    expect(component.matchHint).toBe('Choisis d’abord un mot libanais à gauche.');
    expect(soundService.playCorrect).not.toHaveBeenCalled();
    expect(soundService.playWrong).not.toHaveBeenCalled();
  });

  it('selects a left item', () => {
    createComponent();

    component.selectLeft('mar7aba');

    expect(component.selectedLeft).toBe('mar7aba');
    expect(component.wrongRight).toBe('');
    expect(component.matchHint).toBe('Maintenant choisis la bonne traduction à droite.');
  });

  it('marks a wrong right item and plays the wrong sound', () => {
    vi.useFakeTimers();

    createComponent();

    component.selectLeft('mar7aba');
    component.selectRight('merci');

    expect(component.wrongRight).toBe('merci');
    expect(component.matchHint).toBe('Pas cette paire. Réessaie.');
    expect(soundService.playWrong).toHaveBeenCalledTimes(1);
    expect(soundService.playCorrect).not.toHaveBeenCalled();

    vi.advanceTimersByTime(450);

    expect(component.wrongRight).toBe('');

    vi.useRealTimers();
  });

  it('matches a correct pair and plays the correct sound', () => {
    createComponent();

    component.selectLeft('mar7aba');
    component.selectRight('bonjour');

    expect(component.matchedKeys.has('mar7aba=>bonjour')).toBe(true);
    expect(component.selectedLeft).toBeNull();
    expect(component.wrongRight).toBe('');
    expect(component.matchHint).toBe('Bonne paire. Continue.');
    expect(soundService.playCorrect).toHaveBeenCalledTimes(1);
    expect(soundService.playWrong).not.toHaveBeenCalled();
  });

  it('detects matched left and right items', () => {
    createComponent();

    component.matchedKeys.add('mar7aba=>bonjour');

    expect(component.isLeftMatched('mar7aba')).toBe(true);
    expect(component.isRightMatched('bonjour')).toBe(true);
    expect(component.isLeftMatched('choukran')).toBe(false);
    expect(component.isRightMatched('merci')).toBe(false);
  });

  it('emits the full answer when all pairs are matched', () => {
    createComponent();

    const emittedAnswers: string[] = [];
    component.completed.subscribe(answer => emittedAnswers.push(answer));

    component.selectLeft('mar7aba');
    component.selectRight('bonjour');

    component.selectLeft('choukran');
    component.selectRight('merci');

    expect(component.matchHint).toBe('Toutes les paires sont correctes.');
    expect(emittedAnswers).toEqual(['mar7aba=>bonjour|choukran=>merci']);
  });

  it('does nothing when selecting a matched left item', () => {
    createComponent();

    component.matchedKeys.add('mar7aba=>bonjour');
    component.selectLeft('mar7aba');

    expect(component.selectedLeft).toBeNull();
  });

  it('does nothing when selecting a matched right item', () => {
    createComponent();

    component.matchedKeys.add('mar7aba=>bonjour');
    component.selectedLeft = 'choukran';

    component.selectRight('bonjour');

    expect(component.selectedLeft).toBe('choukran');
    expect(component.matchedKeys.size).toBe(1);
    expect(soundService.playCorrect).not.toHaveBeenCalled();
    expect(soundService.playWrong).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    createComponent(defaultExercise, true);

    const firstButton = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    expect(firstButton.disabled).toBe(true);

    component.selectLeft('mar7aba');
    component.selectRight('bonjour');

    expect(component.selectedLeft).toBeNull();
    expect(component.matchedKeys.size).toBe(0);
    expect(soundService.playCorrect).not.toHaveBeenCalled();
    expect(soundService.playWrong).not.toHaveBeenCalled();
  });
});
