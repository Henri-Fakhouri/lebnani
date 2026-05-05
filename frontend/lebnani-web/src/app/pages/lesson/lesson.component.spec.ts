import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { LessonComponent } from './lesson.component';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

describe('LessonComponent', () => {
  let fixture: ComponentFixture<LessonComponent>;
  let component: LessonComponent;

  const apiServiceMock = {
    getLessonContent: vi.fn().mockReturnValue(of([
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
      }
    ])),
    getExercises: vi.fn().mockReturnValue(of([
      {
        id: 10,
        type: 'TYPE_ANSWER',
        promptFr: 'Écris bonjour en libanais',
        options: []
      }
    ])),
    startLesson: vi.fn().mockReturnValue(of({
      attemptId: 99
    })),
    submitAnswer: vi.fn().mockReturnValue(of({
      correct: true,
      expectedAnswer: 'mar7aba'
    })),
    completeLesson: vi.fn().mockReturnValue(of({
      scorePercent: 100,
      correctAnswers: 1,
      totalExercises: 1,
      xpAwarded: 10
    }))
  };

  const authServiceMock = {
    isLoggedIn: vi.fn().mockReturnValue(true)
  };

  const routerMock = {
    navigateByUrl: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

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
  });

  it('should load lesson content before starting exercises', () => {
    expect(component.lessonId).toBe(4);
    expect(component.contentBlocks.length).toBe(2);
    expect(component.exercises.length).toBe(1);
    expect(component.readingMode).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should render markdown tables', () => {
    const html = component.renderMarkdown(String.raw`| Français | Libanais |\n|---|---|\n| Bonjour | mar7aba |`);

    expect(html).toContain('<table>');
    expect(html).toContain('<th>Français</th>');
    expect(html).toContain('<td>mar7aba</td>');
  });

  it('should start exercises after reading mode', () => {
    component.startExercises();

    expect(component.readingMode).toBe(false);
    expect(component.attemptId).toBe(99);
    expect(component.exercise.id).toBe(10);
  });

  it('should submit typed answer and show feedback', () => {
    component.startExercises();
    component.textAnswer = 'mar7aba';

    component.answerText();

    expect(apiServiceMock.submitAnswer).toHaveBeenCalled();
    expect(component.feedback).toBe('Correct');
    expect(component.lastCorrect).toBe(true);
  });
});