import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LessonComponent } from './lesson.component';
import { ApiService, LessonContentBlockResponse } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

describe('LessonComponent', () => {
  let fixture: ComponentFixture<LessonComponent>;
  let component: LessonComponent;

  let apiServiceMock: {
    getLessonContent: ReturnType<typeof vi.fn>;
    getExercises: ReturnType<typeof vi.fn>;
    startLesson: ReturnType<typeof vi.fn>;
    submitAnswer: ReturnType<typeof vi.fn>;
    completeLesson: ReturnType<typeof vi.fn>;
  };

  let authServiceMock: {
    isLoggedIn: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigateByUrl: ReturnType<typeof vi.fn>;
  };

  const defaultContentBlocks: LessonContentBlockResponse[] = [
    {
      id: 1,
      type: 'HEADING',
      content: 'Comprendre mar7aba',
      displayOrder: 1
    },
    {
      id: 2,
      type: 'MARKDOWN',
      content: String.raw`| Français | Libanais |\n|---|---|\n| Bonjour | mar7aba |`,
      displayOrder: 2
    },
    {
      id: 3,
      type: 'NOTE',
      content: 'Note importante',
      displayOrder: 3
    },
    {
      id: 4,
      type: 'EXAMPLE',
      content: 'Exemple simple',
      displayOrder: 4
    }
  ];

  const defaultExercises = [
    {
      id: 10,
      type: 'TYPE_ANSWER',
      promptFr: 'Écris bonjour en libanais',
      options: []
    },
    {
      id: 11,
      type: 'MULTIPLE_CHOICE',
      promptFr: 'Choisis bonjour',
      options: [
        {
          id: 100,
          text: 'mar7aba'
        },
        {
          id: 101,
          text: 'merci'
        }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function createComponent(options?: {
    loggedIn?: boolean;
    contentBlocks?: LessonContentBlockResponse[];
    exercises?: any[];
    lessonContentError?: boolean;
    exercisesError?: boolean;
    startLessonError?: boolean;
    submitAnswerError?: boolean;
    completeLessonError?: boolean;
    submitAnswerResponse?: any;
    completeLessonResponse?: any;
  }): Promise<void> {
    const loggedIn = options?.loggedIn ?? true;
    const contentBlocks = options?.contentBlocks ?? defaultContentBlocks;
    const exercises = options?.exercises ?? defaultExercises;

    apiServiceMock = {
      getLessonContent: vi.fn().mockReturnValue(
        options?.lessonContentError
          ? throwError(() => new Error('content error'))
          : of(contentBlocks)
      ),
      getExercises: vi.fn().mockReturnValue(
        options?.exercisesError
          ? throwError(() => new Error('exercise error'))
          : of(exercises)
      ),
      startLesson: vi.fn().mockReturnValue(
        options?.startLessonError
          ? throwError(() => new Error('start error'))
          : of({
              attemptId: 99
            })
      ),
      submitAnswer: vi.fn().mockReturnValue(
        options?.submitAnswerError
          ? throwError(() => new Error('answer error'))
          : of(options?.submitAnswerResponse ?? {
              correct: true,
              expectedAnswer: 'mar7aba'
            })
      ),
      completeLesson: vi.fn().mockReturnValue(
        options?.completeLessonError
          ? throwError(() => new Error('complete error'))
          : of(options?.completeLessonResponse ?? {
              scorePercent: 100,
              correctAnswers: 2,
              totalExercises: 2,
              xpAwarded: 10
            })
      )
    };

    authServiceMock = {
      isLoggedIn: vi.fn().mockReturnValue(loggedIn)
    };

    routerMock = {
      navigateByUrl: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LessonComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '4' })
            }
          }
        },
        {
          provide: ApiService,
          useValue: apiServiceMock
        },
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should redirect to login when user is not logged in', async () => {
    await createComponent({
      loggedIn: false
    });

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(apiServiceMock.getLessonContent).not.toHaveBeenCalled();
  });

  it('should load lesson content and exercises in reading mode', async () => {
    await createComponent();

    expect(component.lessonId).toBe(4);
    expect(component.contentBlocks.length).toBe(4);
    expect(component.exercises.length).toBe(2);
    expect(component.readingMode).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.emptyLesson).toBe(false);
  });

  it('should render reading mode blocks in the template', async () => {
    await createComponent();

    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Cours');
    expect(html.textContent).toContain('Comprendre mar7aba');
    expect(html.textContent).toContain('Note importante');
    expect(html.textContent).toContain('Exemple simple');
    expect(html.querySelector('.markdown-block')?.innerHTML).toContain('<table>');
  });

  it('should show content loading error', async () => {
    await createComponent({
      lessonContentError: true
    });

    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('Impossible de charger le contenu de la leçon.');

    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Impossible de charger le contenu de la leçon.'
    );
  });

  it('should show empty lesson state when no exercises exist', async () => {
    await createComponent({
      exercises: []
    });

    expect(component.loading).toBe(false);
    expect(component.emptyLesson).toBe(true);

    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Leçon vide');
    expect(html.textContent).toContain('Cette leçon n’a pas encore d’exercices.');
  });

  it('should start exercises automatically when there is no reading content', async () => {
    await createComponent({
      contentBlocks: []
    });

    expect(component.readingMode).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.attemptId).toBe(99);
    expect(component.exercise.id).toBe(10);
    expect(apiServiceMock.startLesson).toHaveBeenCalledWith(4);
  });

  it('should show exercises loading error', async () => {
    await createComponent({
      exercisesError: true
    });

    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('Impossible de charger les exercices.');
  });

  it('should start exercises after reading mode', async () => {
    await createComponent();

    component.startExercises();

    expect(component.readingMode).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.attemptId).toBe(99);
    expect(component.exercise.id).toBe(10);
  });

  it('should show start lesson error', async () => {
    await createComponent({
      startLessonError: true
    });

    component.startExercises();

    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('Impossible de démarrer la leçon.');
  });

  it('should render typed answer exercise', async () => {
    await createComponent({
      contentBlocks: []
    });

    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Question 1 / 2');
    expect(html.textContent).toContain('Écris bonjour en libanais');
    expect(html.querySelector('input')).not.toBeNull();
  });

  it('should render multiple choice exercise', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.next();
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Question 2 / 2');
    expect(html.textContent).toContain('Choisis bonjour');
    expect(html.textContent).toContain('mar7aba');
    expect(html.textContent).toContain('merci');
  });

  it('should not submit multiple choice answer when already answering', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.exercise = defaultExercises[1];
    component.answering = true;

    component.answerMC(100);

    expect(apiServiceMock.submitAnswer).not.toHaveBeenCalled();
  });

  it('should not submit multiple choice answer when feedback already exists', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.exercise = defaultExercises[1];
    component.answering = false;
    component.feedback = 'Correct';

    component.answerMC(100);

    expect(apiServiceMock.submitAnswer).not.toHaveBeenCalled();
  });

  it('should submit multiple choice answer and show correct feedback', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.exercise = defaultExercises[1];

    component.answerMC(100);

    expect(component.selectedOptionId).toBe(100);
    expect(component.answering).toBe(false);
    expect(component.feedback).toBe('Correct');
    expect(component.lastCorrect).toBe(true);
    expect(apiServiceMock.submitAnswer).toHaveBeenCalledWith(99, {
      exerciseId: 11,
      selectedOptionId: 100
    });
  });

  it('should submit multiple choice answer and show wrong feedback', async () => {
    await createComponent({
      contentBlocks: [],
      submitAnswerResponse: {
        correct: false,
        expectedAnswer: 'mar7aba'
      }
    });

    component.exercise = defaultExercises[1];

    component.answerMC(101);

    expect(component.selectedOptionId).toBe(101);
    expect(component.answering).toBe(false);
    expect(component.feedback).toBe('Incorrect. Réponse attendue : mar7aba');
    expect(component.lastCorrect).toBe(false);
  });

  it('should show multiple choice answer error', async () => {
    await createComponent({
      contentBlocks: [],
      submitAnswerError: true
    });

    component.exercise = defaultExercises[1];

    component.answerMC(100);

    expect(component.answering).toBe(false);
    expect(component.errorMessage).toBe('Impossible de valider la réponse.');
  });

  it('should not submit text answer when already answering', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.textAnswer = 'mar7aba';
    component.answering = true;

    component.answerText();

    expect(apiServiceMock.submitAnswer).not.toHaveBeenCalled();
  });

  it('should not submit text answer when feedback already exists', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.textAnswer = 'mar7aba';
    component.answering = false;
    component.feedback = 'Correct';

    component.answerText();

    expect(apiServiceMock.submitAnswer).not.toHaveBeenCalled();
  });

  it('should not submit blank text answer', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.textAnswer = '   ';

    component.answerText();

    expect(apiServiceMock.submitAnswer).not.toHaveBeenCalled();
  });

  it('should submit text answer and show feedback', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.textAnswer = 'mar7aba';

    component.answerText();

    expect(apiServiceMock.submitAnswer).toHaveBeenCalledWith(99, {
      exerciseId: 10,
      answer: 'mar7aba'
    });
    expect(component.feedback).toBe('Correct');
    expect(component.lastCorrect).toBe(true);
    expect(component.answering).toBe(false);
  });

  it('should show text answer error', async () => {
    await createComponent({
      contentBlocks: [],
      submitAnswerError: true
    });

    component.textAnswer = 'mar7aba';

    component.answerText();

    expect(component.answering).toBe(false);
    expect(component.errorMessage).toBe('Impossible de valider la réponse.');
  });

  it('should move to next exercise and reset answer state', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.feedback = 'Correct';
    component.textAnswer = 'mar7aba';
    component.selectedOptionId = 100;
    component.answering = true;

    component.next();

    expect(component.index).toBe(1);
    expect(component.exercise.id).toBe(11);
    expect(component.feedback).toBe('');
    expect(component.textAnswer).toBe('');
    expect(component.selectedOptionId).toBeNull();
    expect(component.answering).toBe(false);
  });

  it('should complete lesson on last next call', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.index = 1;
    component.exercise = defaultExercises[1];

    component.next();

    expect(component.completed).toBe(true);
    expect(component.exercise).toBeNull();
    expect(component.feedback).toBe('');
    expect(component.answering).toBe(false);
    expect(component.selectedOptionId).toBeNull();
    expect(component.result.scorePercent).toBe(100);
  });

  it('should render completed lesson result with xp hint when no xp awarded', async () => {
    await createComponent({
      contentBlocks: [],
      completeLessonResponse: {
        scorePercent: 80,
        correctAnswers: 4,
        totalExercises: 5,
        xpAwarded: 0
      }
    });

    component.index = 1;
    component.exercise = defaultExercises[1];

    component.next();
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;

    expect(html.textContent).toContain('Leçon terminée');
    expect(html.textContent).toContain('80%');
    expect(html.textContent).toContain('4/5');
    expect(html.textContent).toContain('aucun XP supplémentaire');
  });

  it('should show complete lesson error', async () => {
    await createComponent({
      contentBlocks: [],
      completeLessonError: true
    });

    component.index = 1;
    component.exercise = defaultExercises[1];
    component.answering = true;

    component.next();

    expect(component.answering).toBe(false);
    expect(component.errorMessage).toBe('Impossible de terminer la leçon.');
  });

  it('should handle answer result directly for correct and wrong answers', async () => {
    await createComponent();

    component.handleAnswerResult(true, 'mar7aba');

    expect(component.lastCorrect).toBe(true);
    expect(component.feedback).toBe('Correct');
    expect(component.answering).toBe(false);

    component.handleAnswerResult(false, 'mar7aba');

    expect(component.lastCorrect).toBe(false);
    expect(component.feedback).toBe('Incorrect. Réponse attendue : mar7aba');
    expect(component.answering).toBe(false);
  });

  it('should render markdown tables and raw newline sequences', async () => {
    await createComponent();

    const html = component.renderMarkdown(String.raw`| Français | Libanais |\n|---|---|\n| Bonjour | mar7aba |`);

    expect(html).toContain('<table>');
    expect(html).toContain('<th>Français</th>');
    expect(html).toContain('<td>mar7aba</td>');
  });

  it('should navigate back to course', async () => {
    await createComponent();

    component.backToCourse();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/course');
  });

  it('should navigate back from empty lesson button click', async () => {
    await createComponent({
      exercises: []
    });

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    button.click();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/course');
  });

  it('should start exercises from reading mode button click', async () => {
    await createComponent();

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.next-button') as HTMLButtonElement;

    button.click();

    expect(apiServiceMock.startLesson).toHaveBeenCalledWith(4);
    expect(component.readingMode).toBe(false);
    expect(component.exercise.id).toBe(10);
  });

  it('should submit typed answer from button click', async () => {
    await createComponent({
      contentBlocks: []
    });

    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const button = fixture.nativeElement.querySelector('.typed-answer button') as HTMLButtonElement;

    input.value = 'mar7aba';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    button.click();

    expect(apiServiceMock.submitAnswer).toHaveBeenCalledWith(99, {
      exerciseId: 10,
      answer: 'mar7aba'
    });

    expect(component.feedback).toBe('Correct');
  });

  it('should submit typed answer from enter key', async () => {
    await createComponent({
      contentBlocks: []
    });

    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'mar7aba';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(apiServiceMock.submitAnswer).toHaveBeenCalledWith(99, {
      exerciseId: 10,
      answer: 'mar7aba'
    });
  });

  it('should submit multiple choice answer from option click', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.next();
    fixture.detectChanges();

    const optionButton = fixture.nativeElement.querySelector('.option-button') as HTMLButtonElement;

    optionButton.click();

    expect(apiServiceMock.submitAnswer).toHaveBeenCalledWith(99, {
      exerciseId: 11,
      selectedOptionId: 100
    });

    expect(component.feedback).toBe('Correct');
  });

  it('should move to next exercise from continue button click after feedback', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.handleAnswerResult(true, 'mar7aba');
    fixture.detectChanges();

    const continueButton = fixture.nativeElement.querySelector('.next-button') as HTMLButtonElement;

    continueButton.click();

    expect(component.index).toBe(1);
    expect(component.exercise.id).toBe(11);
    expect(component.feedback).toBe('');
  });

  it('should complete lesson from continue button click on last exercise', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.index = 1;
    component.exercise = defaultExercises[1];
    component.handleAnswerResult(true, 'mar7aba');

    fixture.detectChanges();

    const continueButton = fixture.nativeElement.querySelector('.next-button') as HTMLButtonElement;

    continueButton.click();

    expect(apiServiceMock.completeLesson).toHaveBeenCalledWith(99);
    expect(component.completed).toBe(true);
    expect(component.result.scorePercent).toBe(100);
  });

  it('should navigate back from completed result button click', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.index = 1;
    component.exercise = defaultExercises[1];
    component.next();

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.primary-button') as HTMLButtonElement;

    button.click();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/course');
  });

  it('should navigate back from error button click', async () => {
    await createComponent({
      lessonContentError: true
    });

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.primary-button') as HTMLButtonElement;

    button.click();

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/course');
  });

  it('should render wrong selected multiple choice option class', async () => {
    await createComponent({
      contentBlocks: [],
      submitAnswerResponse: {
        correct: false,
        expectedAnswer: 'mar7aba'
      }
    });

    component.next();
    fixture.detectChanges();

    const optionButton = fixture.nativeElement.querySelectorAll('.option-button')[1] as HTMLButtonElement;

    optionButton.click();
    fixture.detectChanges();

    expect(optionButton.classList.contains('wrong-selected')).toBe(true);
  });

  it('should render correct selected multiple choice option class', async () => {
    await createComponent({
      contentBlocks: []
    });

    component.next();
    fixture.detectChanges();

    const optionButton = fixture.nativeElement.querySelector('.option-button') as HTMLButtonElement;

    optionButton.click();
    fixture.detectChanges();

    expect(optionButton.classList.contains('correct-selected')).toBe(true);
  });

  it('should render disabled typed answer button when answer is blank', async () => {
    await createComponent({
      contentBlocks: []
    });

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.typed-answer button') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });
});