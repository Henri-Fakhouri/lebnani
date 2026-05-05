import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CourseProgressComponent } from './pages/course-progress/course-progress.component';
import { LessonComponent } from './pages/lesson/lesson.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'course', component: CourseProgressComponent },
  { path: 'lesson/:id', component: LessonComponent },
  { path: '', pathMatch: 'full', redirectTo: 'course' },
  { path: '**', redirectTo: 'course' }
];