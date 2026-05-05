import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService, LoginResponse } from './auth.service';

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

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(
        private readonly http: HttpClient,
        private readonly authService: AuthService
    ) { }

    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>('/api/auth/login', {
            email,
            password
        });
    }

    getCourseProgress(courseId: number): Observable<CourseProgressResponse> {
        return this.http.get<CourseProgressResponse>(
            `/api/users/me/courses/${courseId}/progress`,
            { headers: this.authHeaders() }
        );
    }

    private authHeaders(): HttpHeaders {
        const token = this.authService.getToken();

        if (!token) {
            return new HttpHeaders();
        }

        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    startLesson(lessonId: number) {
        return this.http.post<any>(
            `/api/lessons/${lessonId}/attempts`,
            {},
            { headers: this.authHeaders() }
        );
    }

    submitAnswer(attemptId: number, payload: any) {
        return this.http.post<any>(
            `/api/lesson-attempts/${attemptId}/answers`,
            payload,
            { headers: this.authHeaders() }
        );
    }

    completeLesson(attemptId: number) {
        return this.http.post<any>(
            `/api/lesson-attempts/${attemptId}/complete`,
            {},
            { headers: this.authHeaders() }
        );
    }

    getLessons(unitId: number) {
        return this.http.get<any[]>(
            `/api/units/${unitId}/lessons`
        );
    }

    getExercises(lessonId: number) {
        return this.http.get<any[]>(
            `/api/lessons/${lessonId}/exercises`
        );
    }

    getReviewQueue(): Observable<ReviewItemResponse[]> {
        return this.http.get<ReviewItemResponse[]>(
            '/api/users/me/review-queue',
            { headers: this.authHeaders() }
        );
    }

    register(email: string, password: string, displayName: string): Observable<any> {
        return this.http.post<any>('/api/auth/register', {
            email,
            password,
            displayName
        });
    }

    getUserProgress(): Observable<any> {
        return this.http.get<any>(
            '/api/users/me/progress',
            { headers: this.authHeaders() }
        );
    }

    importContent(courseId: number, content: unknown): Observable<any> {
        return this.http.post<any>(
            `/api/admin/courses/${courseId}/content/import`,
            content,
            { headers: this.authHeaders() }
        );
    }
    
    answerReviewItem(reviewItemId: number, answer: string): Observable<any> {
        return this.http.post<any>(
            `/api/users/me/review-items/${reviewItemId}/answer`,
            { answer },
            { headers: this.authHeaders() }
        );
    }
}