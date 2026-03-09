import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'courses',
    loadComponent: () => import('./components/course-list/course-list.component').then(m => m.CourseListComponent),
    canActivate: [AuthGuard],
    data: { role: 'instructor' },
    children: [
      {
        path: ':id',
        loadComponent: () => import('./components/course-detail/course-detail.component').then(m => m.CourseDetailComponent),
      },
    ],
  },
  {
    path: 'students',
    loadComponent: () => import('./components/student-list/student-list.component').then(m => m.StudentListComponent),
    canActivate: [AuthGuard],
    data: { role: 'instructor' },
  },
  {
    path: 'enrollment',
    loadComponent: () => import('./components/enrollment/enrollment.component').then(m => m.EnrollmentComponent),
    canActivate: [AuthGuard],
    data: { role: 'admin' },
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
