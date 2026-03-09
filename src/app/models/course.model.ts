export interface Course {
  id: number;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: string;
  duration: string;
  price: number;
  enrolled: number;
  capacity: number;
  rating: number;
  isNew: boolean;
  isPopular: boolean;
  syllabus: string[];
  startDate: string;
  description: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  enrolledCourses: number[];
  joinDate: string;
  status: 'Active' | 'Inactive';
  progress: { [courseId: number]: number };
}

export interface Enrollment {
  id: string;
  studentId: number;
  courseId: number;
  date: string;
  progress: number;
  status: 'In Progress' | 'Completed';
}
