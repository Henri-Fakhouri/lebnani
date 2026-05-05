import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { CourseProgressComponent } from './pages/course-progress/course-progress.component';
import { LessonComponent } from './pages/lesson/lesson.component';
import { ReviewComponent } from './pages/review/review.component';
import { AdminImportComponent } from './pages/admin-import/admin-import.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminImportHistoryComponent } from './pages/admin-import-history/admin-import-history.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'course', component: CourseProgressComponent, canActivate: [authGuard] },
  { path: 'lesson/:id', component: LessonComponent, canActivate: [authGuard] },
  { path: 'review', component: ReviewComponent, canActivate: [authGuard] },
  { path: 'admin/import', component: AdminImportComponent, canActivate: [adminGuard] },
  { path: 'admin/imports', component: AdminImportHistoryComponent, canActivate: [adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'course' },
  { path: '**', redirectTo: 'course' }
];