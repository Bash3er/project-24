import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Course, Student, Enrollment } from '../models/course.model';

const MOCK_COURSES: Course[] = [
  { id: 1, title: 'React & TypeScript Mastery', category: 'Web Development', level: 'Advanced', instructor: 'Dr. Sarah Chen', duration: '12 weeks', price: 4999, enrolled: 142, capacity: 200, rating: 4.8, isNew: true, isPopular: true, syllabus: ['Hooks & Context', 'TypeScript Integration', 'State Management', 'Testing'], startDate: '2025-04-01', description: 'Master React with TypeScript in this comprehensive course.' },
  { id: 2, title: 'Data Science with Python', category: 'Data Science', level: 'Intermediate', instructor: 'Prof. Arjun Mehta', duration: '10 weeks', price: 5999, enrolled: 198, capacity: 200, rating: 4.9, isNew: false, isPopular: true, syllabus: ['NumPy & Pandas', 'Data Visualization', 'ML Algorithms', 'Model Deployment'], startDate: '2025-03-15', description: 'Learn data science from scratch with hands-on Python projects.' },
  { id: 3, title: 'Angular & RxJS Deep Dive', category: 'Web Development', level: 'Advanced', instructor: 'Ms. Priya Nair', duration: '8 weeks', price: 3999, enrolled: 87, capacity: 150, rating: 4.6, isNew: true, isPopular: false, syllabus: ['Components & Modules', 'RxJS Operators', 'State with NgRx', 'Animations'], startDate: '2025-04-15', description: 'Deep dive into Angular architecture with reactive programming.' },
  { id: 4, title: 'UI/UX Design Fundamentals', category: 'Design', level: 'Beginner', instructor: 'Mr. Rahul Verma', duration: '6 weeks', price: 2999, enrolled: 215, capacity: 250, rating: 4.7, isNew: false, isPopular: true, syllabus: ['Design Thinking', 'Figma Essentials', 'Prototyping', 'Usability Testing'], startDate: '2025-03-20', description: 'Learn the principles of UI/UX design with real-world projects.' },
  { id: 5, title: 'Cloud Architecture on AWS', category: 'Cloud', level: 'Advanced', instructor: 'Dr. Vikram Singh', duration: '14 weeks', price: 7999, enrolled: 63, capacity: 100, rating: 4.5, isNew: true, isPopular: false, syllabus: ['EC2 & S3', 'Lambda Functions', 'RDS & DynamoDB', 'CI/CD Pipelines'], startDate: '2025-05-01', description: 'Build scalable cloud solutions with AWS services.' },
  { id: 6, title: 'Node.js & Express APIs', category: 'Backend', level: 'Intermediate', instructor: 'Ms. Kavya Rao', duration: '8 weeks', price: 3499, enrolled: 129, capacity: 180, rating: 4.6, isNew: false, isPopular: true, syllabus: ['REST API Design', 'Authentication & JWT', 'MongoDB Integration', 'Deployment'], startDate: '2025-04-10', description: 'Build production-grade REST APIs with Node.js and Express.' },
];

const MOCK_STUDENTS: Student[] = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9876543210', enrolledCourses: [1, 2], joinDate: '2024-09-01', status: 'Active', progress: { 1: 78, 2: 45 } },
  { id: 2, name: 'Diya Patel', email: 'diya@example.com', phone: '9876543211', enrolledCourses: [2, 4], joinDate: '2024-10-15', status: 'Active', progress: { 2: 92, 4: 60 } },
  { id: 3, name: 'Rohan Kumar', email: 'rohan@example.com', phone: '9876543212', enrolledCourses: [1, 3, 6], joinDate: '2024-08-20', status: 'Active', progress: { 1: 100, 3: 30, 6: 55 } },
  { id: 4, name: 'Ananya Singh', email: 'ananya@example.com', phone: '9876543213', enrolledCourses: [4, 5], joinDate: '2024-11-01', status: 'Inactive', progress: { 4: 20, 5: 10 } },
  { id: 5, name: 'Karan Mehta', email: 'karan@example.com', phone: '9876543214', enrolledCourses: [6], joinDate: '2024-12-10', status: 'Active', progress: { 6: 88 } },
  { id: 6, name: 'Sneha Reddy', email: 'sneha@example.com', phone: '9876543215', enrolledCourses: [1, 2, 3], joinDate: '2024-09-25', status: 'Active', progress: { 1: 55, 2: 70, 3: 40 } },
];

@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = 'http://localhost:3000/courses'; // JSON Server URL

  private coursesSubject = new BehaviorSubject<Course[]>(MOCK_COURSES);
  courses$ = this.coursesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // GET all courses (falls back to mock if API unavailable)
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl).pipe(
      tap(courses => this.coursesSubject.next(courses)),
      catchError(() => {
        this.coursesSubject.next(MOCK_COURSES);
        return of(MOCK_COURSES);
      })
    );
  }

  // GET single course by ID
  getCourseById(id: number): Observable<Course> {
    return this.courses$.pipe(
      map(courses => {
        const course = courses.find(c => c.id === id);
        if (!course) throw new Error('Course not found');
        return course;
      }),
      catchError(err => throwError(() => err))
    );
  }

  // POST create course
  addCourse(course: Omit<Course, 'id'>): Observable<Course> {
    const current = this.coursesSubject.getValue();
    const newCourse: Course = { ...course as Course, id: Math.max(...current.map(c => c.id)) + 1 };
    this.coursesSubject.next([...current, newCourse]);
    return of(newCourse);
  }

  // PUT update course
  updateCourse(course: Course): Observable<Course> {
    const current = this.coursesSubject.getValue();
    const updated = current.map(c => c.id === course.id ? course : c);
    this.coursesSubject.next(updated);
    return of(course);
  }

  // DELETE course
  deleteCourse(id: number): Observable<void> {
    const current = this.coursesSubject.getValue();
    this.coursesSubject.next(current.filter(c => c.id !== id));
    return of(undefined);
  }

  getAnalytics() {
    const courses = this.coursesSubject.getValue();
    return {
      totalCourses: courses.length,
      totalRevenue: courses.reduce((sum, c) => sum + c.price * c.enrolled, 0),
      categoryBreakdown: courses.reduce((acc: any, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {}),
      topCourses: [...courses].sort((a, b) => b.enrolled - a.enrolled).slice(0, 4),
    };
  }
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = 'http://localhost:3000/students';

  private studentsSubject = new BehaviorSubject<Student[]>(MOCK_STUDENTS);
  students$ = this.studentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl).pipe(
      tap(s => this.studentsSubject.next(s)),
      catchError(() => {
        this.studentsSubject.next(MOCK_STUDENTS);
        return of(MOCK_STUDENTS);
      })
    );
  }

  getStudentById(id: number): Observable<Student> {
    return this.students$.pipe(
      map(students => {
        const s = students.find(s => s.id === id);
        if (!s) throw new Error('Student not found');
        return s;
      })
    );
  }

  addStudent(student: Omit<Student, 'id' | 'enrolledCourses' | 'joinDate' | 'progress'>): Observable<Student> {
    const current = this.studentsSubject.getValue();
    const newStudent: Student = {
      ...student as Student,
      id: Math.max(...current.map(s => s.id)) + 1,
      enrolledCourses: [],
      joinDate: new Date().toISOString().split('T')[0],
      progress: {},
    };
    this.studentsSubject.next([...current, newStudent]);
    return of(newStudent);
  }

  updateStudent(student: Student): Observable<Student> {
    const current = this.studentsSubject.getValue();
    this.studentsSubject.next(current.map(s => s.id === student.id ? student : s));
    return of(student);
  }

  deleteStudent(id: number): Observable<void> {
    const current = this.studentsSubject.getValue();
    this.studentsSubject.next(current.filter(s => s.id !== id));
    return of(undefined);
  }

  enrollStudent(studentId: number, courseId: number): Observable<Student> {
    const current = this.studentsSubject.getValue();
    const student = current.find(s => s.id === studentId);
    if (!student) return throwError(() => new Error('Student not found'));
    if (student.enrolledCourses.includes(courseId)) return throwError(() => new Error('Already enrolled'));
    const updated: Student = {
      ...student,
      enrolledCourses: [...student.enrolledCourses, courseId],
      progress: { ...student.progress, [courseId]: 0 },
    };
    this.studentsSubject.next(current.map(s => s.id === studentId ? updated : s));
    return of(updated);
  }

  getEnrollments(): Observable<Enrollment[]> {
    return this.students$.pipe(
      map(students => students.flatMap(s =>
        s.enrolledCourses.map(cId => ({
          id: `${s.id}-${cId}`,
          studentId: s.id,
          courseId: cId,
          date: s.joinDate,
          progress: s.progress[cId] || 0,
          status: (s.progress[cId] || 0) === 100 ? 'Completed' as const : 'In Progress' as const,
        }))
      ))
    );
  }
}
