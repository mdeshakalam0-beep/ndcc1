export interface StudentProfile {
  name: string;
  fatherName: string;
  className: string;
  classId?: string;
  studentId?: string;
  studentName?: string;
  class?: string;
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
  classId?: string;
}

export interface ObjectiveTest {
  id: string;
  subject: string;
  subjectId?: string;
  classId?: string;
  questions: number;
  marks: number;
  passingMarks?: number;
  difficulty?: string;
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
  classId?: string;
}

export interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string;
  attachment?: string;
  classId?: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  topic: string;
  dueDate: string;
  attachment?: string;
  classId?: string;
}

export interface LiveClassItem {
  id: string;
  title: string;
  description: string;
  liveStatus: 'live' | 'upcoming' | 'completed';
  startTime: string;
  youtubeUrl: string;
  youtubeEmbedUrl?: string;
  classId?: string;
}

export interface RecordedClassItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  youtubeUrl: string;
  youtubeEmbedUrl?: string;
  classId?: string;
}
