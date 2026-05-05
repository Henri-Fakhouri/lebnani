import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  lessons: LessonProgressResponse[];
}

export interface LessonProgressResponse {
  lessonId: number;
  title: string;
  displayOrder: number;
  completed: boolean;
  bestScorePercent: number;
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
  options: ExerciseOptionResponse[];
  status: string;
  failureCount: number;
  successCount: number;
  nextReviewAt: string;
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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', {
      email,
      password
    });
  }

  register(email: string, password: string, displayName: string): Observable<any> {
    return this.http.post<any>('/api/auth/register', {
      email,
      password,
      displayName
    });
  }

  getCourseProgress(courseId: number): Observable<CourseProgressResponse> {
    return this.http.get<CourseProgressResponse>(
      `/api/users/me/courses/${courseId}/progress`
    );
  }

  getUserProgress(): Observable<any> {
    return this.http.get<any>('/api/users/me/progress');
  }

  getLessons(unitId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/units/${unitId}/lessons`);
  }

  getLessonContent(lessonId: number): Observable<LessonContentBlockResponse[]> {
    return this.http.get<LessonContentBlockResponse[]>(
      `/api/lessons/${lessonId}/content`
    );
  }

  getExercises(lessonId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/lessons/${lessonId}/exercises`);
  }

  startLesson(lessonId: number): Observable<any> {
    return this.http.post<any>(
      `/api/lessons/${lessonId}/attempts`,
      {}
    );
  }

  submitAnswer(attemptId: number, payload: any): Observable<any> {
    return this.http.post<any>(
      `/api/lesson-attempts/${attemptId}/answers`,
      payload
    );
  }

  completeLesson(attemptId: number): Observable<any> {
    return this.http.post<any>(
      `/api/lesson-attempts/${attemptId}/complete`,
      {}
    );
  }

  getReviewQueue(): Observable<ReviewItemResponse[]> {
    return this.http.get<ReviewItemResponse[]>('/api/users/me/review-queue');
  }

  answerReviewItem(reviewItemId: number, answer: string): Observable<any> {
    return this.http.post<any>(
      `/api/users/me/review-items/${reviewItemId}/answer`,
      { answer }
    );
  }

  importContent(courseId: number, content: unknown): Observable<any> {
    return this.http.post<any>(
      `/api/admin/courses/${courseId}/content/import`,
      content
    );
  }

  getContentImportRuns(courseId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `/api/admin/courses/${courseId}/content/imports`
    );
  }
}