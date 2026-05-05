import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ApiService, LoginResponse } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call login endpoint', () => {
    const expected: LoginResponse = {
      id: 1,
      email: 'test@email.com',
      displayName: 'Henri',
      role: 'LEARNER',
      accessToken: 'token',
      tokenType: 'Bearer'
    };

    service.login('test@email.com', 'password').subscribe(response => {
      expect(response).toEqual(expected);
    });

    const request = httpMock.expectOne('/api/auth/login');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'test@email.com',
      password: 'password'
    });

    request.flush(expected);
  });

  it('should call register endpoint', () => {
    const expected = {
      id: 1,
      email: 'test@email.com',
      displayName: 'Henri'
    };

    service.register('test@email.com', 'password', 'Henri').subscribe(response => {
      expect(response).toEqual(expected);
    });

    const request = httpMock.expectOne('/api/auth/register');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'test@email.com',
      password: 'password',
      displayName: 'Henri'
    });

    request.flush(expected);
  });

  it('should call progress endpoints', () => {
    service.getCourseProgress(4).subscribe(response => {
      expect(response.courseId).toBe(4);
      expect(response.units.length).toBe(0);
    });

    const courseProgressRequest = httpMock.expectOne('/api/users/me/courses/4/progress');

    expect(courseProgressRequest.request.method).toBe('GET');

    courseProgressRequest.flush({
      courseId: 4,
      courseTitle: 'Lebanese Arabic',
      totalLessons: 0,
      completedLessons: 0,
      completionPercent: 0,
      units: []
    });

    service.getUserProgress().subscribe(response => {
      expect(response.totalXp).toBe(10);
    });

    const userProgressRequest = httpMock.expectOne('/api/users/me/progress');

    expect(userProgressRequest.request.method).toBe('GET');

    userProgressRequest.flush({
      totalXp: 10
    });
  });

  it('should call lesson endpoints', () => {
    service.getLessons(2).subscribe(response => {
      expect(response.length).toBe(1);
    });

    const lessonsRequest = httpMock.expectOne('/api/units/2/lessons');

    expect(lessonsRequest.request.method).toBe('GET');

    lessonsRequest.flush([
      {
        id: 1,
        title: 'Lesson'
      }
    ]);

    service.getLessonContent(4).subscribe(response => {
      expect(response.length).toBe(1);
      expect(response[0].type).toBe('MARKDOWN');
      expect(response[0].content).toContain('mar7aba');
    });

    const contentRequest = httpMock.expectOne('/api/lessons/4/content');

    expect(contentRequest.request.method).toBe('GET');

    contentRequest.flush([
      {
        id: 1,
        type: 'MARKDOWN',
        content: 'En libanais, **mar7aba** veut dire bonjour.',
        displayOrder: 1
      }
    ]);

    service.getExercises(4).subscribe(response => {
      expect(response.length).toBe(1);
    });

    const exercisesRequest = httpMock.expectOne('/api/lessons/4/exercises');

    expect(exercisesRequest.request.method).toBe('GET');

    exercisesRequest.flush([
      {
        id: 1,
        type: 'TYPE_ANSWER'
      }
    ]);
  });

  it('should call lesson attempt endpoints', () => {
    service.startLesson(4).subscribe(response => {
      expect(response.attemptId).toBe(99);
    });

    const startRequest = httpMock.expectOne('/api/lessons/4/attempts');

    expect(startRequest.request.method).toBe('POST');
    expect(startRequest.request.body).toEqual({});

    startRequest.flush({
      attemptId: 99
    });

    const answerPayload = {
      exerciseId: 10,
      answer: 'mar7aba'
    };

    service.submitAnswer(99, answerPayload).subscribe(response => {
      expect(response.correct).toBe(true);
    });

    const submitRequest = httpMock.expectOne('/api/lesson-attempts/99/answers');

    expect(submitRequest.request.method).toBe('POST');
    expect(submitRequest.request.body).toEqual(answerPayload);

    submitRequest.flush({
      correct: true
    });

    service.completeLesson(99).subscribe(response => {
      expect(response.scorePercent).toBe(100);
    });

    const completeRequest = httpMock.expectOne('/api/lesson-attempts/99/complete');

    expect(completeRequest.request.method).toBe('POST');
    expect(completeRequest.request.body).toEqual({});

    completeRequest.flush({
      scorePercent: 100
    });
  });

  it('should call review endpoints', () => {
    service.getReviewQueue().subscribe(response => {
      expect(response.length).toBe(1);
      expect(response[0].status).toBe('DUE');
    });

    const queueRequest = httpMock.expectOne('/api/users/me/review-queue');

    expect(queueRequest.request.method).toBe('GET');

    queueRequest.flush([
      {
        id: 1,
        exerciseId: 2,
        exerciseType: 'TYPE_ANSWER',
        promptFr: 'Prompt',
        options: [],
        status: 'DUE',
        failureCount: 1,
        successCount: 0,
        nextReviewAt: '2026-01-01T00:00:00Z'
      }
    ]);

    service.answerReviewItem(5, 'mar7aba').subscribe(response => {
      expect(response.correct).toBe(true);
    });

    const answerRequest = httpMock.expectOne('/api/users/me/review-items/5/answer');

    expect(answerRequest.request.method).toBe('POST');
    expect(answerRequest.request.body).toEqual({
      answer: 'mar7aba'
    });

    answerRequest.flush({
      correct: true
    });
  });

  it('should call admin import endpoints', () => {
    const content = {
      units: []
    };

    service.importContent(1, content).subscribe(response => {
      expect(response.importRunId).toBe(10);
    });

    const importRequest = httpMock.expectOne('/api/admin/courses/1/content/import');

    expect(importRequest.request.method).toBe('POST');
    expect(importRequest.request.body).toEqual(content);

    importRequest.flush({
      importRunId: 10
    });

    service.getContentImportRuns(1).subscribe(response => {
      expect(response.length).toBe(1);
    });

    const runsRequest = httpMock.expectOne('/api/admin/courses/1/content/imports');

    expect(runsRequest.request.method).toBe('GET');

    runsRequest.flush([
      {
        id: 10
      }
    ]);
  });
});