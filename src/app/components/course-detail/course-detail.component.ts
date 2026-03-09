import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CourseService, StudentService } from '../../services/data.service';
import { Course, Student, Enrollment } from '../../models/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="page" *ngIf="course" style="animation: fadeIn 0.3s ease">
      <button mat-button (click)="back()" class="back-btn">
        <mat-icon>arrow_back</mat-icon> BACK TO COURSES
      </button>

      <!-- Hero -->
      <div class="hero">
        <div class="hero-line" [style.background]="catColor"></div>
        <div class="hero-inner">
          <div class="hero-left">
            <div class="hero-tags">
              <span class="htag" [style.color]="catColor" [style.border-color]="catColor">{{ course.category }}</span>
              <span class="htag">{{ course.level }}</span>
              <span class="htag new" *ngIf="course.isNew">NEW</span>
              <span class="htag hot" *ngIf="course.isPopular">🔥 POPULAR</span>
            </div>
            <h1 class="hero-title">{{ course.title }}</h1>
            <p class="hero-desc">{{ course.description }}</p>
            <div class="hero-meta">
              <div class="hm-item"><mat-icon class="hmi">person</mat-icon>{{ course.instructor }}</div>
              <div class="hm-item"><mat-icon class="hmi">schedule</mat-icon>{{ course.duration }}</div>
              <div class="hm-item"><mat-icon class="hmi">star</mat-icon>{{ course.rating }} rating</div>
              <div class="hm-item"><mat-icon class="hmi">group</mat-icon>{{ course.enrolled }}/{{ course.capacity }} enrolled</div>
              <div class="hm-item"><mat-icon class="hmi">event</mat-icon>{{ course.startDate | date:'d MMM yyyy' }}</div>
            </div>
          </div>
          <div class="hero-right">
            <div class="price-box">
              <div class="price-label">ENROLLMENT FEE</div>
              <div class="price-val" [style.color]="catColor">₹{{ course.price | number }}</div>
              <div class="fill-row">
                <div class="fill-label">{{ course.enrolled }}/{{ course.capacity }} seats</div>
                <div class="fill-pct" [style.color]="catColor">{{ fillPct }}%</div>
              </div>
              <div class="fill-bar">
                <div class="fill-fill" [style.width]="fillPct+'%'" [style.background]="catColor"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Syllabus -->
        <div class="panel">
          <div class="panel-head"><span class="panel-title">SYLLABUS</span><span class="panel-badge">{{ course.syllabus.length }} TOPICS</span></div>
          <div class="syllabus-list">
            <div class="syl-item" *ngFor="let t of course.syllabus; let i = index">
              <div class="syl-num" [style.color]="catColor" [style.border-color]="catColor">{{ (i+1).toString().padStart(2,'0') }}</div>
              <span class="syl-text">{{ t }}</span>
            </div>
            <div class="empty-syl" *ngIf="!course.syllabus.length">No syllabus added yet.</div>
          </div>
        </div>

        <!-- Students -->
        <div class="panel">
          <div class="panel-head"><span class="panel-title">ENROLLED STUDENTS</span><span class="panel-badge">{{ enrolledStudents.length }} ENROLLED</span></div>
          <div class="stu-list">
            <div class="empty-syl" *ngIf="!enrolledStudents.length">No students enrolled yet.</div>
            <div class="stu-row" *ngFor="let item of enrolledStudents">
              <div class="stu-avatar" [style.background]="catColor+'20'" [style.color]="catColor">{{ item.student?.name?.[0] }}</div>
              <div class="stu-info">
                <div class="stu-name">{{ item.student?.name }}</div>
                <mat-progress-bar mode="determinate" [value]="item.enrollment.progress"
                  [style.--mdc-linear-progress-active-indicator-color]="catColor">
                </mat-progress-bar>
              </div>
              <div class="stu-right">
                <div class="stu-pct" [style.color]="catColor">{{ item.enrollment.progress }}%</div>
                <span class="stu-status" [class.done]="item.enrollment.status==='Completed'">{{ item.enrollment.status | uppercase }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { }
    .back-btn { color: var(--text2) !important; font-family: 'Barlow Condensed', sans-serif !important; font-size: 12px !important; letter-spacing: 0.08em !important; margin-bottom: 16px !important; padding: 0 !important; }
    .back-btn:hover { color: var(--accent) !important; }

    .hero { background: var(--bg2); border: 1px solid var(--border); margin-bottom: 20px; overflow: hidden; }
    .hero-line { height: 3px; }
    .hero-inner { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding: 24px; flex-wrap: wrap; }
    .hero-left { flex: 1; }
    .hero-tags { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
    .htag { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.06em; padding: 2px 7px; border: 1px solid var(--border2); color: var(--text3); }
    .htag.new { color: var(--green); border-color: var(--green); }
    .htag.hot { color: var(--yellow); border-color: var(--yellow); }
    .hero-title { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 900; color: var(--text); margin-bottom: 8px; line-height: 1.1; }
    .hero-desc { font-size: 13px; color: var(--text2); margin-bottom: 16px; line-height: 1.6; max-width: 560px; }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 16px; }
    .hm-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text3); }
    .hmi { font-size: 14px !important; width: 14px !important; height: 14px !important; }

    .price-box { background: var(--bg3); border: 1px solid var(--border2); padding: 20px; min-width: 200px; }
    .price-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text3); letter-spacing: 0.1em; margin-bottom: 6px; }
    .price-val { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 900; line-height: 1; margin-bottom: 12px; }
    .fill-row { display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text3); margin-bottom: 5px; }
    .fill-pct { font-weight: 700; }
    .fill-bar { height: 3px; background: var(--border2); }
    .fill-fill { height: 100%; transition: width 0.8s ease; }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .panel { background: var(--bg2); border: 1px solid var(--border); }
    .panel-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--border); }
    .panel-title { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; color: var(--text3); letter-spacing: 0.1em; }
    .panel-badge { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--accent); }

    .syllabus-list { padding: 8px 0; }
    .syl-item { display: flex; align-items: center; gap: 14px; padding: 10px 20px; border-bottom: 1px solid var(--border); }
    .syl-item:last-child { border-bottom: none; }
    .syl-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; border: 1px solid; padding: 1px 5px; min-width: 28px; text-align: center; }
    .syl-text { font-size: 13px; color: var(--text2); }
    .empty-syl { padding: 20px; color: var(--text3); font-size: 13px; }

    .stu-list { padding: 8px 0; }
    .stu-row { display: flex; align-items: center; gap: 12px; padding: 10px 20px; border-bottom: 1px solid var(--border); }
    .stu-row:last-child { border-bottom: none; }
    .stu-avatar { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 900; flex-shrink: 0; }
    .stu-info { flex: 1; }
    .stu-name { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 5px; }
    .stu-right { text-align: right; min-width: 80px; }
    .stu-pct { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 900; line-height: 1; }
    .stu-status { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--accent); letter-spacing: 0.06em; }
    .stu-status.done { color: var(--green); }
  `],
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  course: Course | null = null;
  enrolledStudents: { student: Student|undefined; enrollment: Enrollment }[] = [];
  private destroy$ = new Subject<void>();
  private catColors: Record<string,string> = {
    'Web Development':'#d97b2a','Data Science':'#5c9e6e','Design':'#c9a84c','Cloud':'#5b8fcc','Backend':'#9b72c4',
  };

  constructor(private route: ActivatedRoute, private router: Router,
    private cs: CourseService, private ss: StudentService) {}

  get catColor(): string { return this.catColors[this.course?.category||''] || 'var(--accent)'; }
  get fillPct(): number { return this.course ? Math.round((this.course.enrolled/this.course.capacity)*100) : 0; }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$),
      switchMap(p => this.cs.getCourseById(+p['id']))
    ).subscribe(course => {
      this.course = course;
      this.ss.getEnrollments().pipe(takeUntil(this.destroy$)).subscribe(enrollments => {
        const ce = enrollments.filter(e => e.courseId === course.id);
        this.ss.students$.pipe(takeUntil(this.destroy$)).subscribe(students => {
          this.enrolledStudents = ce.map(e => ({ enrollment: e, student: students.find(s => s.id===e.studentId) }));
        });
      });
    });
  }

  back(): void { this.router.navigate(['/courses']); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
