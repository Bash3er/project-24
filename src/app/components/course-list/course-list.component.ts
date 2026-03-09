import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CourseService } from '../../services/data.service';
import { Course } from '../../models/course.model';
import { TruncatePipe, EnrollPercentPipe } from '../../pipes/course.pipes';
import { HighlightPopularDirective, NewBadgeDirective } from '../../directives/course.directives';

@Component({
  selector: 'app-course-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="dlg">
      <div class="dlg-head">
        <div class="dlg-eyebrow">{{ data.course ? 'EDITING RECORD' : 'NEW RECORD' }}</div>
        <h2 class="dlg-title">{{ data.course ? data.course.title : 'Add Course' }}</h2>
      </div>
      <div class="dlg-body">
        <form [formGroup]="form">
          <div class="field-row full">
            <mat-form-field appearance="outline" class="w100">
              <mat-label>Course Title</mat-label>
              <input matInput formControlName="title">
              <mat-error *ngIf="form.get('title')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>
          <div class="field-row two">
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option *ngFor="let c of cats" [value]="c">{{ c }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Level</mat-label>
              <mat-select formControlName="level">
                <mat-option *ngFor="let l of lvls" [value]="l">{{ l }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="field-row full">
            <mat-form-field appearance="outline" class="w100">
              <mat-label>Instructor</mat-label>
              <input matInput formControlName="instructor">
              <mat-error *ngIf="form.get('instructor')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>
          <div class="field-row three">
            <mat-form-field appearance="outline">
              <mat-label>Duration</mat-label>
              <input matInput formControlName="duration" placeholder="8 weeks">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Price</mat-label>
              <input matInput type="number" formControlName="price">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Capacity</mat-label>
              <input matInput type="number" formControlName="capacity">
            </mat-form-field>
          </div>
          <div class="field-row full">
            <mat-form-field appearance="outline" class="w100">
              <mat-label>Start Date</mat-label>
              <input matInput type="date" formControlName="startDate">
            </mat-form-field>
          </div>
          <div class="field-row full">
            <mat-form-field appearance="outline" class="w100">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
              <mat-error *ngIf="form.get('description')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>
        </form>
      </div>
      <div class="dlg-foot">
        <button mat-button mat-dialog-close class="btn-ghost">CANCEL</button>
        <button mat-raised-button (click)="submit()" [disabled]="form.invalid" class="btn-primary">
          {{ data.course ? 'UPDATE' : 'CREATE' }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./dialog.styles.css'],
})
export class CourseDialogComponent {
  cats = ['Web Development','Data Science','Design','Cloud','Backend'];
  lvls = ['Beginner','Intermediate','Advanced'];
  form: FormGroup;
  constructor(private fb: FormBuilder, public ref: MatDialogRef<CourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { course?: Course }) {
    this.form = this.fb.group({
      title:       [data.course?.title       || '', Validators.required],
      category:    [data.course?.category    || 'Web Development'],
      level:       [data.course?.level       || 'Beginner'],
      instructor:  [data.course?.instructor  || '', Validators.required],
      duration:    [data.course?.duration    || '', Validators.required],
      price:       [data.course?.price       || '', [Validators.required, Validators.min(1)]],
      capacity:    [data.course?.capacity    || '', [Validators.required, Validators.min(1)]],
      startDate:   [data.course?.startDate   || ''],
      description: [data.course?.description || '', Validators.required],
    });
  }
  submit(): void { if (this.form.valid) this.ref.close(this.form.value); }
}

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="dlg">
      <div class="dlg-head">
        <div class="dlg-eyebrow dlg-eyebrow-red">DESTRUCTIVE ACTION</div>
        <h2 class="dlg-title">Delete Record?</h2>
      </div>
      <div class="dlg-body">
        <p>Permanently delete <strong class="dlg-strong">{{ data.name }}</strong>? This cannot be undone.</p>
      </div>
      <div class="dlg-foot">
        <button mat-button mat-dialog-close class="btn-ghost">CANCEL</button>
        <button mat-raised-button [mat-dialog-close]="true" class="btn-danger">DELETE</button>
      </div>
    </div>
  `,
  styleUrls: ['./dialog.styles.css'],
})
export class DeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string }) {}
}

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterOutlet, ReactiveFormsModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDialogModule, MatSnackBarModule, MatProgressBarModule, MatTooltipModule,
    TruncatePipe, EnrollPercentPipe,
    HighlightPopularDirective, NewBadgeDirective,
    CourseDialogComponent, DeleteDialogComponent,
  ],
  template: `
    <div class="page">
      <div class="ph">
        <div>
          <div class="ph-eyebrow">CATALOGUE</div>
          <h1 class="ph-title">Courses</h1>
        </div>
        <button mat-raised-button class="btn-accent" (click)="openAdd()">
          <mat-icon>add</mat-icon> NEW COURSE
        </button>
      </div>

      <div class="filter-bar">
        <div class="search-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input [(ngModel)]="q" placeholder="Search title, instructor…" class="search-input">
          <span class="search-count">{{ filtered.length }} results</span>
        </div>
        <div class="filter-chips">
          <button *ngFor="let c of cats" (click)="catFilter = c"
            class="chip" [class.chip-on]="catFilter === c">{{ c }}</button>
        </div>
        <select [(ngModel)]="lvlFilter" class="lvl-select">
          <option *ngFor="let l of lvls" [value]="l">{{ l }}</option>
        </select>
      </div>

      <div class="course-grid">
        <div class="course-card" *ngFor="let c of filtered" [appHighlightPopular]="c.isPopular">
          <div class="card-accent-line" [style.background]="getCatColor(c.category)"></div>
          <div class="card-body">
            <div class="card-top">
              <div class="card-tags">
                <span class="tag" [style.color]="getCatColor(c.category)" [style.border-color]="getCatColor(c.category)">{{ c.category }}</span>
                <span class="tag tag-level">{{ c.level }}</span>
                <span class="tag tag-new" *ngIf="c.isNew">NEW</span>
                <span *ngIf="c.isPopular" style="font-size:14px">🔥</span>
              </div>
              <span class="card-rating">★ {{ c.rating }}</span>
            </div>
            <h3 class="card-title">{{ c.title }}</h3>
            <p class="card-desc">{{ c.description | truncate:72 }}</p>
            <div class="card-meta">
              <span><mat-icon class="mi">person</mat-icon>{{ c.instructor }}</span>
              <span><mat-icon class="mi">schedule</mat-icon>{{ c.duration }}</span>
            </div>
            <div class="card-bar-row">
              <mat-progress-bar mode="determinate" [value]="c.enrolled | enrollPercent:c.capacity"
                [style.--mdc-linear-progress-active-indicator-color]="getCatColor(c.category)">
              </mat-progress-bar>
              <span class="bar-label">{{ c.enrolled }}/{{ c.capacity }}</span>
            </div>
            <div class="card-foot">
              <span class="card-price">₹{{ c.price | number }}</span>
              <div class="card-actions">
                <button mat-icon-button [routerLink]="['/courses', c.id]" matTooltip="View Details"><mat-icon>visibility</mat-icon></button>
                <button mat-icon-button (click)="openEdit(c)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button (click)="openDelete(c)" matTooltip="Delete" class="btn-del"><mat-icon>delete</mat-icon></button>
              </div>
            </div>
          </div>
        </div>
        <div class="empty-state" *ngIf="!filtered.length">
          <mat-icon>layers_clear</mat-icon>
          <span>No courses match your filters</span>
        </div>
      </div>

      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./course-list.styles.css'],
})
export class CourseListComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  q = ''; catFilter = 'All'; lvlFilter = 'All';
  cats = ['All','Web Development','Data Science','Design','Cloud','Backend'];
  lvls = ['All','Beginner','Intermediate','Advanced'];
  private destroy$ = new Subject<void>();
  private catColors: Record<string,string> = {
    'Web Development': '#d97b2a', 'Data Science': '#5c9e6e',
    'Design': '#c9a84c', 'Cloud': '#5b8fcc', 'Backend': '#9b72c4',
  };

  constructor(private cs: CourseService, private dialog: MatDialog, private sb: MatSnackBar) {}

  ngOnInit(): void {
    this.cs.getCourses().pipe(takeUntil(this.destroy$)).subscribe();
    this.cs.courses$.pipe(takeUntil(this.destroy$)).subscribe(c => this.courses = c);
  }

  get filtered(): Course[] {
    return this.courses
      .filter(c => this.catFilter === 'All' || c.category === this.catFilter)
      .filter(c => this.lvlFilter === 'All' || c.level === this.lvlFilter)
      .filter(c => !this.q
        || c.title.toLowerCase().includes(this.q.toLowerCase())
        || c.instructor.toLowerCase().includes(this.q.toLowerCase()));
  }

  getCatColor(cat: string): string { return this.catColors[cat] || 'var(--accent)'; }

  openAdd(): void {
    this.dialog.open(CourseDialogComponent, { data: {} })
      .afterClosed().subscribe(r => {
        if (r) this.cs.addCourse({ ...r, enrolled: 0, rating: 0, isNew: true, isPopular: false, syllabus: [] })
          .subscribe(() => this.sb.open('✓ Course created', undefined, { duration: 2500 }));
      });
  }
  openEdit(c: Course): void {
    this.dialog.open(CourseDialogComponent, { data: { course: c } })
      .afterClosed().subscribe(r => {
        if (r) this.cs.updateCourse({ ...c, ...r })
          .subscribe(() => this.sb.open('✓ Course updated', undefined, { duration: 2500 }));
      });
  }
  openDelete(c: Course): void {
    this.dialog.open(DeleteDialogComponent, { data: { name: c.title } })
      .afterClosed().subscribe(ok => {
        if (ok) this.cs.deleteCourse(c.id)
          .subscribe(() => this.sb.open('Course removed', undefined, { duration: 2500 }));
      });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
