import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  // Simulated role — in a real app this comes from an AuthService
  private userRole: 'admin' | 'instructor' | 'student' = 'admin';

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    if (!requiredRole) return true;
    if (this.userRole === 'admin') return true;
    if (this.userRole === requiredRole) return true;
    this.router.navigate(['/dashboard']);
    return false;
  }
}
