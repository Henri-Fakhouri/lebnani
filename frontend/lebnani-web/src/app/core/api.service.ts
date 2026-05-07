import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CourseProgressResponse {
  courseId: number;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  completionPercent: number;
  units: UnitProgressResponse[];
}

export interface UnitProgressResponse {
  unitId: number;
  title: string;
  displayOrder: number;
  totalLessons: number;
  completedLessons: number;
  completionPercent: number;
  locked: boolean;
  lessons: LessonProgressResponse[];
}

export interface LessonProgressResponse {
  lessonId: number;
  title: string;
  displayOrder: number;
  completed: boolean;
  bestScorePercent: number;
  contentBlockCount: number;
  exerciseCount: number;
  lessonMode: 'COURSE_AND_EXERCISE' | 'COURSE_ONLY' | 'PRACTICE_ONLY' | 'EMPTY';
}

export interface LessonContentBlockResponse {
  id: number;
  type: string;
  content: string;
  displayOrder: number;
}

export interface ReviewItemResponse {
  id: number;
  exerciseId: number;
  exerciseType: string;
  promptFr: string;
  correctAnswer: string;
  options: ExerciseOptionResponse[];
  status: string;
  failureCount: number;
  successCount: number;
  nextReviewAt: string;
  unitId: number;
  unitTitle: string;
}

export interface ExerciseOptionResponse {
  id: number;
  text: string;
  displayOrder: number;
}

export interface LoginResponse {
  id: number;
  email: string;
  displayName: string;
  role: string;
  accessToken: string;
  tokenType: string;
}

export interface WrongAnswerDetail {
  promptFr: string;
  submittedAnswer: string;
  correctAnswer: string;
}

export interface CompleteLessonResponse {
  attemptId: number;
  lessonId: number;
  status: string;
  totalExercises: number;
  answeredExercises: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercent: number;
  xpAwarded: number;
  wrongAnswerDetails: WrongAnswerDetail[];
}

export interface NextLessonResponse {
  lessonId: number;
  lessonTitle: string;
  unitTitle: string;
}

export interface ReviewAnswerResponse {
  reviewItemId: number;
  exerciseId: number;
  submittedAnswer: string;
  normalizedAnswer: string;
  correct: boolean;
  expectedAnswer: string;
  status: string;
  failureCount: number;
  successCount: number;
  nextReviewAt: string;
  xpAwarded: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password });
  }

  register(email: string, password: string, displayName: string): Observable<any> {
    return this.http.post<any>('/api/auth/register', { email, password, displayName });
  }

  getCourseProgress(courseId: number): Observable<CourseProgressResponse> {
    return this.http.get<CourseProgressResponse>(`/api/users/me/courses/${courseId}/progress`);
  }

  getUserProgress(): Observable<any> {
    return this.http.get<any>('/api/users/me/progress');
  }

  getLessons(unitId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/units/${unitId}/lessons`);
  }

  getLessonContent(lessonId: number): Observable<LessonContentBlockResponse[]> {
    return this.http.get<LessonContentBlockResponse[]>(`/api/lessons/${lessonId}/content`);
  }

  getExercises(lessonId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/lessons/${lessonId}/exercises`);
  }

  getNextLesson(lessonId: number): Observable<NextLessonResponse | null> {
    return this.http.get<NextLessonResponse>(`/api/lessons/${lessonId}/next-lesson`, {
      observe: 'response'
    }).pipe(map(r => r.body));
  }

  startLesson(lessonId: number): Observable<any> {
    return this.http.post<any>(`/api/lessons/${lessonId}/attempts`, {});
  }

  submitAnswer(attemptId: number, payload: any): Observable<any> {
    return this.http.post<any>(`/api/lesson-attempts/${attemptId}/answers`, payload);
  }

  completeLesson(attemptId: number): Observable<CompleteLessonResponse> {
    return this.http.post<CompleteLessonResponse>(`/api/lesson-attempts/${attemptId}/complete`, {});
  }

  getReviewQueue(unitId?: number): Observable<ReviewItemResponse[]> {
    const base = '/api/users/me/review-queue';
    const url = unitId == null ? base : `${base}?unitId=${unitId}`;
    return this.http.get<ReviewItemResponse[]>(url);
  }

  getDifficultItems(): Observable<ReviewItemResponse[]> {
    return this.http.get<ReviewItemResponse[]>('/api/users/me/difficult-items');
  }

  answerReviewItem(reviewItemId: number, answer: string): Observable<ReviewAnswerResponse> {
    return this.http.post<ReviewAnswerResponse>(
      `/api/users/me/review-items/${reviewItemId}/answer`,
      { answer }
    );
  }

  importContent(courseId: number, content: unknown, replaceExisting = false): Observable<any> {
    return this.http.post<any>(
      `/api/admin/courses/${courseId}/content/import?replaceExisting=${replaceExisting}`,
      content
    );
  }

  restoreLatestContentImport(courseId: number): Observable<any> {
    return this.http.post<any>(
      `/api/admin/courses/${courseId}/content/imports/restore-latest`,
      {}
    );
  }

  getContentImportRuns(courseId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/admin/courses/${courseId}/content/imports`);
  }
}