import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CourseProgressComponent } from './pages/course-progress/course-progress.component';
import { LessonComponent } from './pages/lesson/lesson.component';
import { ReviewComponent } from './pages/review/review.component';
import { AdminImportComponent } from './pages/admin-import/admin-import.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'course', component: CourseProgressComponent },
  { path: 'lesson/:id', component: LessonComponent },
  { path: 'review', component: ReviewComponent },
  { path: 'admin/import', component: AdminImportComponent },
  { path: '', pathMatch: 'full', redirectTo: 'course' },
  { path: '**', redirectTo: 'course' }
];