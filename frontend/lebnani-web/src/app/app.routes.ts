import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CourseProgressComponent } from './pages/course-progress/course-progress.component';
import { LessonComponent } from './pages/lesson/lesson.component';
import { ReviewComponent } from './pages/review/review.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'course', component: CourseProgressComponent },
  { path: 'lesson/:id', component: LessonComponent },
  { path: 'review', component: ReviewComponent },
  { path: '', pathMatch: 'full', redirectTo: 'course' },
  { path: '**', redirectTo: 'course' }
];