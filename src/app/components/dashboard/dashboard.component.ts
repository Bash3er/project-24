import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, combineLatestWith } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { CourseService, StudentService } from '../../services/data.service';
import { Course, Student, Enrollment } from '../../models/course.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, MatIconModule, MatProgressBarModule, MatTableModule, MatChipsModule],
  template: `
    <div class="page">
      <!-- Page header -->
      <div class="ph">
        <div class="ph-left">
          <div class="ph-eyebrow">OVERVIEW</div>
          <h1 class="ph-title">Analytics Dashboard</h1>
        </div>
        <div class="ph-right">
          <div class="status-pill">
            <span class="pulse"></span>LIVE DATA
          </div>
        </div>
      </div>

      <!-- KPI row -->
      <div class="kpi-row">
        <div class="kpi" *ngFor="let k of kpis">
          <div class="kpi-label">{{ k.label }}</div>
          <div class="kpi-val" [style.color]="k.color">{{ k.value }}</div>
          <div class="kpi-sub">{{ k.sub }}</div>
          <div class="kpi-bar" [style.background]="k.color + '30'">
            <div class="kpi-fill" [style.background]="k.color" [style.width]="k.pct + '%'"></div>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- Category breakdown -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">COURSES BY CATEGORY</span>
            <span class="panel-count">{{ courses.length }} TOTAL</span>
          </div>
          <div class="cat-list">
            <div class="cat-row" *ngFor="let c of categoryData">
              <div class="cat-left">
                <div class="cat-swatch" [style.background]="c.color"></div>
                <span class="cat-name">{{ c.name }}</span>
              </div>
              <div class="cat-right">
                <div class="cat-bar-wrap">
                  <div class="cat-bar" [style.width]="c.pct + '%'" [style.background]="c.color"></div>
                </div>
                <span class="cat-num" [style.color]="c.color">{{ c.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top courses -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">TOP ENROLLED COURSES</span>
          </div>
          <div class="top-list">
            <div class="top-row" *ngFor="let c of topCourses; let i = index">
              <div class="top-rank">{{ (i+1).toString().padStart(2,'0') }}</div>
              <div class="top-info">
                <div class="top-name">{{ c.title }}</div>
                <div class="top-meta">{{ c.instructor }} · {{ c.duration }}</div>
                <mat-progress-bar mode="determinate" [value]="(c.enrolled/c.capacity)*100"
                  [style.--mdc-linear-progress-active-indicator-color]="getCatColor(c.category)">
                </mat-progress-bar>
              </div>
              <div class="top-enroll" [style.color]="getCatColor(c.category)">
                <div class="top-enroll-num">{{ c.enrolled }}</div>
                <div class="top-enroll-cap">/ {{ c.capacity }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent enrollments table -->
      <div class="panel" style="margin-top:20px">
        <div class="panel-head">
          <span class="panel-title">RECENT ENROLLMENTS</span>
          <span class="panel-count">{{ recentEnrollments.length }} RECORDS</span>
        </div>
        <table mat-table [dataSource]="recentEnrollments" class="dark-table">
          <ng-container matColumnDef="student">
            <th mat-header-cell *matHeaderCellDef>STUDENT</th>
            <td mat-cell *matCellDef="let e">
              <div class="cell-user">
                <div class="avatar-sq" [style.background]="'var(--accent-bg)'" [style.color]="'var(--accent)'">
                  {{ e.student?.name?.[0] }}
                </div>
                <span>{{ e.student?.name }}</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="course">
            <th mat-header-cell *matHeaderCellDef>COURSE</th>
            <td mat-cell *matCellDef="let e" class="cell-muted">{{ e.course?.title | slice:0:32 }}</td>
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
      </div>
    </div>
  `,
  styles: [`
    .page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

    /* ── Page header ── */
    .ph { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
    .ph-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--accent); letter-spacing: 0.12em; margin-bottom: 4px; }
    .ph-title { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 900; color: var(--text); letter-spacing: 0.01em; line-height: 1; }
    .status-pill { display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--green); letter-spacing: 0.1em; border: 1px solid var(--green); padding: 4px 10px; }
    .pulse { width: 6px; height: 6px; background: var(--green); border-radius: 50%; box-shadow: 0 0 8px var(--green); animation: blink 2s infinite; }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

    /* ── KPI row ── */
    .kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: var(--border); margin-bottom: 20px; }
    .kpi { background: var(--bg2); padding: 18px 20px; border-left: 3px solid transparent; transition: border-color 0.2s; }
    .kpi:hover { border-left-color: var(--accent); }
    .kpi-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
    .kpi-val { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
    .kpi-sub { font-size: 11px; color: var(--text3); margin-bottom: 10px; }
    .kpi-bar { height: 2px; background: var(--border); margin-top: 8px; }
    .kpi-fill { height: 100%; transition: width 1s ease; }

    /* ── Panel ── */
    .panel { background: var(--bg2); border: 1px solid var(--border); }
    .panel-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--border); }
    .panel-title { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.1em; }
    .panel-count { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--accent); }

    /* ── Grid ── */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    /* ── Category list ── */
    .cat-list { padding: 12px 20px; display: flex; flex-direction: column; gap: 12px; }
    .cat-row { display: flex; align-items: center; gap: 12px; }
    .cat-left { display: flex; align-items: center; gap: 8px; width: 160px; flex-shrink: 0; }
    .cat-swatch { width: 8px; height: 8px; flex-shrink: 0; }
    .cat-name { font-size: 13px; color: var(--text2); }
    .cat-right { flex: 1; display: flex; align-items: center; gap: 10px; }
    .cat-bar-wrap { flex: 1; height: 3px; background: var(--border2); }
    .cat-bar { height: 100%; transition: width 0.8s ease; }
    .cat-num { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; min-width: 16px; text-align: right; }

    /* ── Top courses ── */
    .top-list { padding: 4px 0; }
    .top-row { display: flex; align-items: center; gap: 16px; padding: 12px 20px; border-bottom: 1px solid var(--border); }
    .top-row:last-child { border-bottom: none; }
    .top-rank { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text3); min-width: 24px; }
    .top-info { flex: 1; }
    .top-name { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
    .top-meta { font-size: 11px; color: var(--text3); margin-bottom: 6px; }
    .top-enroll { text-align: right; }
    .top-enroll-num { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 900; line-height: 1; }
    .top-enroll-cap { font-size: 10px; color: var(--text3); }

    /* ── Table ── */
    .dark-table { width: 100%; }
    .cell-user { display: flex; align-items: center; gap: 10px; font-weight: 500; }
    .avatar-sq { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 800; flex-shrink: 0; }
    .cell-muted { color: var(--text2) !important; }
    .cell-mono { font-family: 'JetBrains Mono', monospace !important; font-size: 11px !important; color: var(--text3) !important; }
    .prog-cell { display: flex; align-items: center; gap: 10px; min-width: 120px; }
    .prog-pct { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text3); min-width: 30px; }
    .status-tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.06em; color: var(--accent); background: var(--accent-bg); padding: 2px 6px; }
    .status-tag.done { color: var(--green); background: var(--green-bg); }
  `],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  kpis: any[] = [];
  courses: Course[] = [];
  categoryData: any[] = [];
  topCourses: Course[] = [];
  recentEnrollments: any[] = [];
  cols = ['student', 'course', 'date', 'progress', 'status'];

  private catColors: Record<string, string> = {
    'Web Development': '#d97b2a', 'Data Science': '#5c9e6e',
    'Design': '#c9a84c', 'Cloud': '#5b8fcc', 'Backend': '#9b72c4',
  };

  constructor(private cs: CourseService, private ss: StudentService) {}

  ngOnInit(): void {
    this.cs.courses$.pipe(takeUntil(this.destroy$),
      combineLatestWith(this.ss.students$, this.ss.getEnrollments())
    ).subscribe(([courses, students, enrollments]) => {
      this.courses = courses;
      const totalRev = enrollments.reduce((s, e) => s + (courses.find(c => c.id === e.courseId)?.price || 0), 0);
      const avgProg = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length) : 0;
      const completed = enrollments.filter(e => e.status === 'Completed').length;
      const active = students.filter(s => s.status === 'Active').length;

      this.kpis = [
        { label: 'Total Courses',    value: courses.length,                  sub: 'Active curriculum', color: 'var(--accent)',  pct: 100 },
        { label: 'Students',         value: students.length,                 sub: `${active} active`,   color: 'var(--green)',   pct: Math.round(active/Math.max(students.length,1)*100) },
        { label: 'Enrollments',      value: enrollments.length,              sub: `${completed} done`,  color: 'var(--blue)',    pct: Math.round(completed/Math.max(enrollments.length,1)*100) },
        { label: 'Revenue',          value: '₹'+totalRev.toLocaleString('en-IN'), sub: 'All-time',       color: 'var(--yellow)',  pct: 75 },
        { label: 'Avg Progress',     value: `${avgProg}%`,                   sub: 'All courses',        color: '#9b72c4',        pct: avgProg },
      ];

      const catCount = courses.reduce((a: Record<string,number>, c) => { a[c.category] = (a[c.category]||0)+1; return a; }, {});
      this.categoryData = Object.entries(catCount).map(([name, count]) => ({
        name, count, pct: Math.round((count/courses.length)*100), color: this.catColors[name]||'var(--accent)',
      }));

      this.topCourses = [...courses].sort((a, b) => b.enrolled - a.enrolled).slice(0, 4);
      this.recentEnrollments = [...enrollments]
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,5)
        .map(e => ({ ...e, student: students.find(s => s.id===e.studentId), course: courses.find(c => c.id===e.courseId) }));
    });
    this.cs.getCourses().pipe(takeUntil(this.destroy$)).subscribe();
  }

  getCatColor(cat: string): string { return this.catColors[cat] || 'var(--accent)'; }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
