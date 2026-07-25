export interface StudentProfile {
  name: string;
  fatherName: string;
  className: string;
  classId?: string;
  dob: string;
  gender: string;
  village: string;
  profilePic: string;
  isRegistered?: boolean;
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
  subjectId?: string;
  questions: number;
  marks: number;
  timeLimit: number; // in minutes
  completed: boolean;
  score?: number;
  questionsList?: { questionText: string; options: string[]; correctOption: number }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: 'announcement' | 'test' | 'system' | 'profile';
  read: boolean;
}
