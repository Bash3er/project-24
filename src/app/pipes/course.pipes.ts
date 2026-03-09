import { Pipe, PipeTransform } from '@angular/core';
import { Course, Student } from '../models/course.model';

@Pipe({ name: 'filterByCategory', standalone: true })
export class FilterByCategoryPipe implements PipeTransform {
  transform(courses: Course[], category: string): Course[] {
    if (!category || category === 'All') return courses;
    return courses.filter(c => c.category === category);
  }
}

@Pipe({ name: 'filterByLevel', standalone: true })
export class FilterByLevelPipe implements PipeTransform {
  transform(courses: Course[], level: string): Course[] {
    if (!level || level === 'All') return courses;
    return courses.filter(c => c.level === level);
  }
}

@Pipe({ name: 'searchCourse', standalone: true })
export class SearchCoursePipe implements PipeTransform {
  transform(courses: Course[], query: string): Course[] {
    if (!query?.trim()) return courses;
    const q = query.toLowerCase();
    return courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }
}

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 80): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }
}

@Pipe({ name: 'enrollPercent', standalone: true })
export class EnrollPercentPipe implements PipeTransform {
  transform(enrolled: number, capacity: number): number {
    if (!capacity) return 0;
    return Math.round((enrolled / capacity) * 100);
  }
}

@Pipe({ name: 'activeCount', standalone: true })
export class ActiveCountPipe implements PipeTransform {
  transform(students: Student[]): number {
    return students.filter(s => s.status === 'Active').length;
  }
}
