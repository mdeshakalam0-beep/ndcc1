import type { StudentProfile, Subject, ObjectiveTest, NotificationItem } from './types';

export const initialProfile: StudentProfile = {
  name: "Aditya Kumar",
  fatherName: "Rajesh Kumar",
  className: "Class 12 - Science",
  dob: "2008-05-15",
  gender: "Male",
  village: "Rajpur",
  profilePic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200"
};

export const mockSubjects: Subject[] = [
  {
    id: "sub-1",
    name: "Physics",
    chapters: 14,
    icon: "bolt",
    color: "from-blue-500 to-indigo-600",
    progress: 75
  },
  {
    id: "sub-2",
    name: "Chemistry",
    chapters: 12,
    icon: "science",
    color: "from-cyan-500 to-blue-600",
    progress: 60
  },
  {
    id: "sub-3",
    name: "Mathematics",
    chapters: 16,
    icon: "calculate",
    color: "from-indigo-500 to-purple-600",
    progress: 90
  },
  {
    id: "sub-4",
    name: "English Core",
    chapters: 10,
    icon: "menu_book",
    color: "from-emerald-500 to-teal-600",
    progress: 85
  },
  {
    id: "sub-5",
    name: "Biology",
    chapters: 15,
    icon: "biotech",
    color: "from-pink-500 to-rose-600",
    progress: 45
  }
];

export const mockTests: ObjectiveTest[] = [
  {
    id: "test-1",
    subject: "Physics",
    questions: 20,
    marks: 100,
    timeLimit: 30,
    completed: true,
    score: 85
  },
  {
    id: "test-2",
    subject: "Chemistry",
    questions: 15,
    marks: 75,
    timeLimit: 20,
    completed: false
  },
  {
    id: "test-3",
    subject: "Mathematics",
    questions: 25,
    marks: 125,
    timeLimit: 40,
    completed: true,
    score: 110
  },
  {
    id: "test-4",
    subject: "English Core",
    questions: 20,
    marks: 50,
    timeLimit: 15,
    completed: false
  },
  {
    id: "test-5",
    subject: "Physics - Kinematics",
    questions: 10,
    marks: 50,
    timeLimit: 15,
    completed: false
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Weekly Mock Test Scheduled",
    description: "The weekly Physics and Chemistry MCQ mock test is scheduled for this Sunday at 10:00 AM. Attendance is mandatory.",
    time: "2 hours ago",
    category: "test",
    read: false
  },
  {
    id: "notif-2",
    title: "New Chapter Notes Uploaded",
    description: "PDF notes for Class 12 Mathematics - Integration (Chapter 7) have been uploaded in the Subjects portal.",
    time: "5 hours ago",
    category: "announcement",
    read: false
  },
  {
    id: "notif-3",
    title: "Independence Day Holiday Notice",
    description: "NDCC campus will remain closed on 15th August. Regular classes will resume from 16th August.",
    time: "1 day ago",
    category: "system",
    read: true
  },
  {
    id: "notif-4",
    title: "Profile Setup Complete",
    description: "Your student profile registration data has been verified by the administrator.",
    time: "3 days ago",
    category: "profile",
    read: true
  }
];
