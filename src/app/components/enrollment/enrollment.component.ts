import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService, CourseService } from '../../services/data.service';
import { Course, Student, Enrollment } from '../../models/course.model';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [
    CommonModule, DatePipe, ReactiveFormsModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatProgressBarModule, MatSnackBarModule,
  ],
  template: `
    <div class="page">
      <div class="ph">
        <div>
          <div class="ph-eyebrow">MANAGEMENT</div>
          <h1 class="ph-title">Enrollment</h1>
        </div>
        <div class="ph-stats">
          <div class="phs-item">
            <span class="phs-val" style="color:var(--accent)">{{ enrollments.length }}</span>
            <span class="phs-label">TOTAL</span>
          </div>
          <div class="phs-div"></div>
          <div class="phs-item">
            <span class="phs-val" style="color:var(--green)">{{ completed }}</span>
            <span class="phs-label">COMPLETED</span>
          </div>
          <div class="phs-div"></div>
          <div class="phs-item">
            <span class="phs-val" style="color:var(--blue)">{{ enrollments.length - completed }}</span>
            <span class="phs-label">IN PROGRESS</span>
          </div>
        </div>
      </div>

      <!-- Enroll form -->
      <div class="enroll-panel">
        <div class="panel-head">
          <span class="panel-title">ENROLL STUDENT</span>
          <span class="panel-hint">Reactive Form — Validators applied</span>
        </div>
        <form [formGroup]="form" (ngSubmit)="onEnroll()" class="enroll-form">
          <mat-form-field appearance="outline" class="ff">
            <mat-label>Student</mat-label>
            <mat-select formControlName="studentId">
              <mat-option *ngFor="let s of students" [value]="s.id">
                {{ s.name }} — {{ s.email }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('studentId')?.hasError('required')">Select a student</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="ff">
            <mat-label>Course</mat-label>
            <mat-select formControlName="courseId">
              <mat-option *ngFor="let c of courses" [value]="c.id">
                {{ c.title }} ({{ c.enrolled }}/{{ c.capacity }})
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('courseId')?.hasError('required')">Select a course</mat-error>
          </mat-form-field>
          <button mat-raised-button type="submit" [disabled]="form.invalid" class="enroll-btn">
            <mat-icon>task_alt</mat-icon> ENROLL
          </button>
        </form>
        <div class="msg ok" *ngIf="okMsg"><mat-icon>check_circle</mat-icon>{{ okMsg }}</div>
        <div class="msg err" *ngIf="errMsg"><mat-icon>error</mat-icon>{{ errMsg }}</div>
      </div>

      <!-- Filter + table -->
      <div class="table-section">
        <div class="table-toolbar">
          <span class="tt-title">ENROLLMENT RECORDS</span>
          <div class="tt-filter">
            <span class="tt-filter-label">FILTER BY COURSE</span>
            <select [(ngModel)]="filterCourseId" class="tt-select">
              <option [ngValue]="null">All Courses</option>
              <option *ngFor="let c of courses" [ngValue]="c.id">{{ c.title }}</option>
            </select>
          </div>
        </div>

        <table mat-table [dataSource]="filteredEnrollments" class="dark-table">
          <ng-container matColumnDef="student">
            <th mat-header-cell *matHeaderCellDef>STUDENT</th>
            <td mat-cell *matCellDef="let e">
              <div class="cell-user">
                <div class="avatar-sq amber">{{ getStudent(e.studentId)?.name?.[0] }}</div>
                <span class="u-name">{{ getStudent(e.studentId)?.name }}</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="course">
            <th mat-header-cell *matHeaderCellDef>COURSE</th>
            <td mat-cell *matCellDef="let e">
              <span class="course-name">{{ getCourse(e.courseId)?.title | slice:0:36 }}</span>
              <span class="cat-tag" [style.color]="getCatColor(getCourse(e.courseId)?.category||'')">{{ getCourse(e.courseId)?.category }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>DATE</th>
            <td mat-cell *matCellDef="let e" class="cell-mono">{{ e.date | date:'dd MMM yy' }}</td>
          </ng-container>
          <ng-container matColumnDef="progress">
            <th mat-header-cell *matHeaderCellDef>PROGRESS</th>
            <td mat-cell *matCellDef="let e">
              <div class="prog-cell">
                <mat-progress-bar mode="determinate" [value]="e.progress"
                  [style.--mdc-linear-progress-active-indicator-color]="e.progress===100 ? 'var(--green)' : 'var(--accent)'">
                </mat-progress-bar>
                <span class="prog-pct">{{ e.progress }}%</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>STATUS</th>
            <td mat-cell *matCellDef="let e">
              <span class="status-tag" [class.done]="e.status==='Completed'">{{ e.status | uppercase }}</span>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        <div class="empty-state" *ngIf="!filteredEnrollments.length">
          <mat-icon>how_to_reg</mat-icon><span>No enrollment records</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
    .page { animation: fadeIn 0.3s ease; }
    .ph { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
    .ph-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--yellow); letter-spacing: 0.12em; margin-bottom: 4px; }
    .ph-title { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 900; color: var(--text); line-height: 1; }
    .ph-stats { display: flex; align-items: center; gap: 12px; background: var(--bg2); border: 1px solid var(--border); padding: 12px 20px; }
    .phs-item { display: flex; flex-direction: column; align-items: center; }
    .phs-val { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 900; line-height: 1; }
    .phs-label { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--text3); letter-spacing: 0.08em; }
    .phs-div { width: 1px; height: 30px; background: var(--border); }

    .enroll-panel { background: var(--bg2); border: 1px solid var(--border); margin-bottom: 20px; }
    .panel-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--border); }
    .panel-title { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.1em; }
    .panel-hint { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text3); }
    .enroll-form { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: flex-start; padding: 16px 20px; }
    .ff { width: 100%; }
    .enroll-btn { background: var(--yellow) !important; color: #111 !important; font-family: 'Barlow Condensed', sans-serif !important; font-weight: 900 !important; font-size: 13px !important; letter-spacing: 0.06em !important; height: 56px; align-self: flex-start; margin-top: 4px; }
    .enroll-btn:disabled { background: var(--border2) !important; color: var(--text3) !important; }
    .msg { display: flex; align-items: center; gap: 8px; padding: 10px 20px 14px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.05em; }
    .msg mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .ok { color: var(--green); }
    .err { color: var(--red); }

    .table-section { border: 1px solid var(--border); }
    .table-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: var(--bg2); border-bottom: 1px solid var(--border); }
    .tt-title { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.1em; }
    .tt-filter { display: flex; align-items: center; gap: 8px; }
    .tt-filter-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text3); letter-spacing: 0.08em; }
    .tt-select { background: none; border: 1px solid var(--border2); color: var(--text2); font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; padding: 4px 10px; outline: none; cursor: pointer; }
    .tt-select option { background: var(--bg3); }

    .dark-table { width: 100%; }
    .cell-user { display: flex; align-items: center; gap: 10px; }
    .avatar-sq { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 900; flex-shrink: 0; }
    .avatar-sq.amber { background: var(--accent-bg); color: var(--accent); }
    .u-name { font-weight: 600; color: var(--text); font-size: 13px; }
    .course-name { display: block; font-size: 13px; color: var(--text2); }
    .cat-tag { font-family: 'JetBrains Mono', monospace; font-size: 9px; }
    .cell-mono { font-family: 'JetBrains Mono', monospace !important; font-size: 11px !important; color: var(--text3) !important; }
    .prog-cell { display: flex; align-items: center; gap: 10px; min-width: 120px; }
    .prog-pct { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text3); min-width: 32px; }
    .status-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.06em; color: var(--accent); background: var(--accent-bg); padding: 2px 6px; }
    .status-tag.done { color: var(--green); background: var(--green-bg); }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: var(--text3); }
    .empty-state mat-icon { font-size: 32px; opacity: 0.3; }
  `],
})
export class EnrollmentComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  courses: Course[] = [];
  enrollments: Enrollment[] = [];
  filterCourseId: number | null = null;
  okMsg = ''; errMsg = '';
  form: FormGroup;
  cols = ['student','course','date','progress','status'];
  private destroy$ = new Subject<void>();
  private catColors: Record<string,string> = {
    'Web Development':'#d97b2a','Data Science':'#5c9e6e','Design':'#c9a84c','Cloud':'#5b8fcc','Backend':'#9b72c4',
  };

  constructor(private ss: StudentService, private cs: CourseService, private fb: FormBuilder, private sb: MatSnackBar) {
    this.form = this.fb.group({ studentId: ['', Validators.required], courseId: ['', Validators.required] });
  }

  get completed(): number { return this.enrollments.filter(e => e.status === 'Completed').length; }

  ngOnInit(): void {
    combineLatest([this.ss.students$, this.cs.courses$, this.ss.getEnrollments()])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([s, c, e]) => { this.students = s; this.courses = c; this.enrollments = e; });
    this.ss.getStudents().pipe(takeUntil(this.destroy$)).subscribe();
    this.cs.getCourses().pipe(takeUntil(this.destroy$)).subscribe();
  }

  get filteredEnrollments(): Enrollment[] {
    return this.filterCourseId ? this.enrollments.filter(e => e.courseId === this.filterCourseId) : this.enrollments;
  }

  onEnroll(): void {
    this.okMsg = ''; this.errMsg = '';
    if (this.form.invalid) return;
    const { studentId, courseId } = this.form.value;
    const student = this.students.find(s => s.id === studentId);
    const course = this.courses.find(c => c.id === courseId);
    if (student?.enrolledCourses.includes(courseId)) { this.errMsg = `${student.name} is already enrolled in this course.`; return; }
    if (course && course.enrolled >= course.capacity) { this.errMsg = `${course.title} is at full capacity.`; return; }
    this.ss.enrollStudent(studentId, courseId).subscribe({
      next: () => {
        if (course) this.cs.updateCourse({ ...course, enrolled: course.enrolled + 1 }).subscribe();
        this.okMsg = `${student?.name} enrolled in ${course?.title}`;
        this.form.reset();
        setTimeout(() => this.okMsg = '', 4000);
      },
      error: (e) => this.errMsg = e.message,
    });
  }

  getStudent(id: number): Student|undefined { return this.students.find(s => s.id===id); }
  getCourse(id: number): Course|undefined { return this.courses.find(c => c.id===id); }
  getCatColor(cat: string): string { return this.catColors[cat] || 'var(--accent)'; }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
