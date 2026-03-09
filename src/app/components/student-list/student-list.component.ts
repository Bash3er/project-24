import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService, CourseService } from '../../services/data.service';
import { Student, Course } from '../../models/course.model';
import { DeleteDialogComponent } from '../course-list/course-list.component';
import { ActiveCountPipe } from '../../pipes/course.pipes';

@Component({
  selector: 'app-student-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="dlg">
      <div class="dlg-head">
        <div class="dlg-eyebrow">{{ data.student ? 'EDITING RECORD' : 'NEW RECORD' }}</div>
        <h2 class="dlg-title">{{ data.student ? data.student.name : 'Register Student' }}</h2>
      </div>
      <div class="dlg-body">
        <form [formGroup]="form">
          <mat-form-field appearance="outline" class="w100">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name">
            <mat-error *ngIf="form.get('name')?.hasError('required')">Required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w100">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email">
            <mat-error *ngIf="form.get('email')?.hasError('required')">Required</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Invalid email</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w100">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phone" placeholder="10-digit number">
            <mat-error *ngIf="form.get('phone')?.hasError('required')">Required</mat-error>
            <mat-error *ngIf="form.get('phone')?.hasError('pattern')">Must be 10 digits</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="w100">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </div>
      <div class="dlg-foot">
        <button mat-button mat-dialog-close class="btn-ghost">CANCEL</button>
        <button mat-raised-button (click)="submit()" [disabled]="form.invalid" class="btn-primary">
          {{ data.student ? 'UPDATE' : 'REGISTER' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
    .page { animation: fadeIn 0.3s ease; }
    .dlg { min-width: 420px; }
    .dlg-head { padding: 24px 24px 16px; border-bottom: 1px solid var(--border); }
    .dlg-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--green); letter-spacing: 0.12em; margin-bottom: 4px; }
    .dlg-title { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 900; color: var(--text); }
    .dlg-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 4px; }
    .w100 { width: 100%; }
    .dlg-foot { padding: 12px 24px 20px; display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid var(--border); }
    .btn-ghost { color: var(--text2) !important; font-family: 'Barlow Condensed', sans-serif !important; font-size: 13px !important; letter-spacing: 0.06em !important; }
    .btn-primary { background: var(--green) !important; color: #111 !important; font-family: 'Barlow Condensed', sans-serif !important; font-size: 13px !important; font-weight: 900 !important; letter-spacing: 0.06em !important; }
    .btn-primary:disabled { background: var(--border2) !important; color: var(--text3) !important; }
  `],
})
export class StudentDialogComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder, public ref: MatDialogRef<StudentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student?: Student }) {
    this.form = this.fb.group({
      name:   [data.student?.name||'',   Validators.required],
      email:  [data.student?.email||'',  [Validators.required, Validators.email]],
      phone:  [data.student?.phone||'',  [Validators.required, Validators.pattern(/^\d{10}$/)]],
      status: [data.student?.status||'Active'],
    });
  }
  submit(): void { if (this.form.valid) this.ref.close(this.form.value); }
}

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDialogModule, MatSnackBarModule, ActiveCountPipe,
    StudentDialogComponent, DeleteDialogComponent,
  ],
  template: `
    <div class="page">
      <div class="ph">
        <div>
          <div class="ph-eyebrow">REGISTRY</div>
          <h1 class="ph-title">Students</h1>
        </div>
        <button mat-raised-button class="btn-green" (click)="openAdd()">
          <mat-icon>person_add</mat-icon> REGISTER STUDENT
        </button>
      </div>

      <div class="toolbar">
        <div class="search-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input [(ngModel)]="q" placeholder="Search name or email…" class="search-input">
          <span class="search-count">{{ filtered.length }} / {{ students.length }}</span>
        </div>
        <div class="toolbar-stats">
          <div class="ts-item">
            <span class="ts-val" style="color:var(--green)">{{ students | activeCount }}</span>
            <span class="ts-label">ACTIVE</span>
          </div>
          <div class="ts-divider"></div>
          <div class="ts-item">
            <span class="ts-val" style="color:var(--text3)">{{ students.length - (students | activeCount) }}</span>
            <span class="ts-label">INACTIVE</span>
          </div>
        </div>
      </div>

      <div class="table-wrap">
        <table mat-table [dataSource]="filtered" class="dark-table">
          <ng-container matColumnDef="student">
            <th mat-header-cell *matHeaderCellDef>#&nbsp;&nbsp;STUDENT</th>
            <td mat-cell *matCellDef="let s; let i = index">
              <div class="cell-user">
                <span class="row-num">{{ (i+1).toString().padStart(2,'0') }}</span>
                <div class="avatar-sq green">{{ s.name[0] }}</div>
                <span class="stu-name">{{ s.name }}</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>EMAIL</th>
            <td mat-cell *matCellDef="let s" class="cell-mono">{{ s.email }}</td>
          </ng-container>
          <ng-container matColumnDef="phone">
            <th mat-header-cell *matHeaderCellDef>PHONE</th>
            <td mat-cell *matCellDef="let s" class="cell-mono">{{ s.phone }}</td>
          </ng-container>
          <ng-container matColumnDef="courses">
            <th mat-header-cell *matHeaderCellDef>COURSES</th>
            <td mat-cell *matCellDef="let s">
              <div class="course-tags">
                <span class="ctag" *ngFor="let id of s.enrolledCourses.slice(0,2)">{{ shortName(id) }}</span>
                <span class="ctag more" *ngIf="s.enrolledCourses.length > 2">+{{ s.enrolledCourses.length - 2 }}</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="joined">
            <th mat-header-cell *matHeaderCellDef>JOINED</th>
            <td mat-cell *matCellDef="let s" class="cell-mono">{{ s.joinDate | date:'dd MMM yy' }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let s">
              <span class="status-tag" [class.active]="s.status==='Active'">{{ s.status | uppercase }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>—</th>
            <td mat-cell *matCellDef="let s">
              <button mat-icon-button (click)="openEdit(s)" class="act-btn"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button (click)="openDelete(s)" class="act-btn red"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        <div class="empty-state" *ngIf="!filtered.length">
          <mat-icon>person_off</mat-icon>
          <span>No students found</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
    .page { animation: fadeIn 0.3s ease; }
    .ph { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
    .ph-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--green); letter-spacing: 0.12em; margin-bottom: 4px; }
    .ph-title { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 900; color: var(--text); line-height: 1; }
    .btn-green { background: var(--green) !important; color: #111 !important; font-family: 'Barlow Condensed', sans-serif !important; font-weight: 900 !important; font-size: 13px !important; letter-spacing: 0.06em !important; }

    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: var(--bg2); border: 1px solid var(--border); border-bottom: none; padding: 10px 16px; }
    .search-wrap { display: flex; align-items: center; gap: 8px; flex: 1; }
    .search-icon { font-size: 16px; color: var(--text3); }
    .search-input { background: none; border: none; outline: none; color: var(--text); font-family: 'Barlow', sans-serif; font-size: 13px; flex: 1; }
    .search-input::placeholder { color: var(--text3); }
    .search-count { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text3); }
    .toolbar-stats { display: flex; align-items: center; gap: 12px; }
    .ts-item { display: flex; flex-direction: column; align-items: center; }
    .ts-val { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 900; line-height: 1; }
    .ts-label { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--text3); letter-spacing: 0.08em; }
    .ts-divider { width: 1px; height: 28px; background: var(--border); }

    .table-wrap { border: 1px solid var(--border); }
    .dark-table { width: 100%; }
    .cell-user { display: flex; align-items: center; gap: 10px; }
    .row-num { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text3); min-width: 20px; }
    .avatar-sq { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 900; flex-shrink: 0; }
    .avatar-sq.green { background: var(--green-bg); color: var(--green); }
    .stu-name { font-weight: 600; color: var(--text); font-size: 13px; }
    .cell-mono { font-family: 'JetBrains Mono', monospace !important; font-size: 11px !important; color: var(--text3) !important; }
    .course-tags { display: flex; gap: 4px; flex-wrap: wrap; }
    .ctag { font-family: 'JetBrains Mono', monospace; font-size: 9px; padding: 2px 6px; border: 1px solid var(--border2); color: var(--text3); }
    .ctag.more { color: var(--accent); border-color: var(--accent); }
    .status-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.06em; color: var(--text3); background: var(--border); padding: 2px 6px; }
    .status-tag.active { color: var(--green); background: var(--green-bg); }
    .act-btn { color: var(--text3) !important; width: 30px !important; height: 30px !important; }
    .act-btn:hover { color: var(--text) !important; }
    .act-btn.red:hover { color: var(--red) !important; }
    .act-btn mat-icon { font-size: 15px !important; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: var(--text3); }
    .empty-state mat-icon { font-size: 32px; opacity: 0.3; }
  `],
})
export class StudentListComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  courses: Course[] = [];
  q = '';
  cols = ['student','email','phone','courses','joined','status','actions'];
  private destroy$ = new Subject<void>();

  constructor(private ss: StudentService, private cs: CourseService, private dialog: MatDialog, private sb: MatSnackBar) {}

  ngOnInit(): void {
    this.ss.getStudents().pipe(takeUntil(this.destroy$)).subscribe();
    this.ss.students$.pipe(takeUntil(this.destroy$)).subscribe(s => this.students = s);
    this.cs.courses$.pipe(takeUntil(this.destroy$)).subscribe(c => this.courses = c);
  }

  get filtered(): Student[] {
    if (!this.q) return this.students;
    const q = this.q.toLowerCase();
    return this.students.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }

  shortName(id: number): string {
    const c = this.courses.find(c => c.id === id);
    return c ? c.title.split(' ').slice(0,2).join(' ') : '—';
  }

  openAdd(): void {
    this.dialog.open(StudentDialogComponent, { data: {}, panelClass: 'dark-dialog' }).afterClosed().subscribe(r => {
      if (r) this.ss.addStudent(r).subscribe(() => this.sb.open('✓ Student registered', undefined, { duration: 2500 }));
    });
  }
  openEdit(s: Student): void {
    this.dialog.open(StudentDialogComponent, { data: { student: s }, panelClass: 'dark-dialog' }).afterClosed().subscribe(r => {
      if (r) this.ss.updateStudent({ ...s, ...r }).subscribe(() => this.sb.open('✓ Student updated', undefined, { duration: 2500 }));
    });
  }
  openDelete(s: Student): void {
    this.dialog.open(DeleteDialogComponent, { data: { name: s.name }, panelClass: 'dark-dialog' }).afterClosed().subscribe(ok => {
      if (ok) this.ss.deleteStudent(s.id).subscribe(() => this.sb.open('Student removed', undefined, { duration: 2500 }));
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
