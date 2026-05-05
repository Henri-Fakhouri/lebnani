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
}