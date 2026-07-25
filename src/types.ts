export interface StudentProfile {
  name: string;
  fatherName: string;
  className: string;
  dob: string;
  gender: string;
  village: string;
  profilePic: string;
}

export interface Subject {
  id: string;
  name: string;
  chapters: number;
  icon: string;
  color: string;
  progress: number;
}

export interface ObjectiveTest {
  id: string;
  subject: string;
  questions: number;
  marks: number;
  timeLimit: number; // in minutes
  completed: boolean;
  score?: number;
  questionsList?: { q: string; options: string[]; answer: number }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: 'announcement' | 'test' | 'system' | 'profile';
  read: boolean;
}
