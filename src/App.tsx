import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { auth, db, hasConfig } from './config/firebase';

import type { StudentProfile, Subject, ObjectiveTest, NotificationItem } from './types';

// Layout & Modals
import Layout from './components/Layout';
import QuizModal from './components/QuizModal';
import { LogoSVG } from './components/Illustrations';

// Pages
import Splash from './pages/Splash';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import EditProfile from './pages/EditProfile';
import Homework from './pages/Homework';
import Assignments from './pages/Assignments';
import LiveClasses from './pages/LiveClasses';
import RecordedClasses from './pages/RecordedClasses';

const initialEmptyProfile: StudentProfile = {
  name: "",
  fatherName: "",
  className: "Class 12 - Science",
  dob: "",
  gender: "Male",
  village: "",
  profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200"
};

export default function App() {
  // Authentication session state
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // App core domain states loaded dynamically from Firestore
  const [profile, setProfile] = useState<StudentProfile>(initialEmptyProfile);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tests, setTests] = useState<ObjectiveTest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  // Additional content states for class-based management alignment
  const [homework, setHomework] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [recordedClasses, setRecordedClasses] = useState<any[]>([]);
  
  // MCQ Test running modal state
  const [activeQuiz, setActiveQuiz] = useState<ObjectiveTest | null>(null);

  const getClassIdFromName = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  // Listen to Firebase Auth state change and student profile changes in real-time
  useEffect(() => {
    if (!hasConfig || !auth || !db) {
      setAuthLoading(false);
      return;
    }

    let profileUnsub: () => void = () => {};
    let subjectsUnsub: () => void = () => {};
    let testsUnsub: () => void = () => {};
    let notificationsUnsub: () => void = () => {};
    let bannersUnsub: () => void = () => {};
    let homeworkUnsub: () => void = () => {};
    let assignmentsUnsub: () => void = () => {};
    let liveClassesUnsub: () => void = () => {};
    let recordedClassesUnsub: () => void = () => {};

    const cleanupListeners = () => {
      profileUnsub();
      subjectsUnsub();
      testsUnsub();
      notificationsUnsub();
      bannersUnsub();
      homeworkUnsub();
      assignmentsUnsub();
      liveClassesUnsub();
      recordedClassesUnsub();
    };

    const authUnsub = onAuthStateChanged(auth, async (user) => {
      console.log("🔒 [Auth Observer] State changed. User logged in:", !!user);
      cleanupListeners(); // Cleanup any existing listeners from previous session
      setDbError(null);

      if (user) {
        const loggedInUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        };
        setCurrentUser(loggedInUser);

        // 1. Real-time Student Profile listener
        const profileRef = doc(db, "students", user.uid);
        profileUnsub = onSnapshot(profileRef, async (docSnap) => {
          if (docSnap.exists()) {
            const docData = docSnap.data();
            
            // Map student profile values with fallback fields
            const resolvedProfile: StudentProfile = {
              ...docData,
              studentId: user.uid,
              studentName: docData.name || user.displayName || "",
              class: docData.className || "",
              classId: docData.classId || (docData.className ? getClassIdFromName(docData.className) : ""),
              name: docData.name || user.displayName || "",
              className: docData.className || ""
            } as StudentProfile;
            
            setProfile(resolvedProfile);
            console.log("📄 [Firestore Profile Listener] Student profile updated:", resolvedProfile);

            if (docData.isRegistered === true) {
              setHasRegistered(true);
              
              // 2. Setup real-time listeners for all class-filterable content
              const studentClassId = resolvedProfile.classId || "";

              // Subjects Listener
              subjectsUnsub = onSnapshot(collection(db, "subjects"), (snap) => {
                const list: Subject[] = [];
                snap.forEach(dSnap => {
                  const data = dSnap.data();
                  if (!data.classId || data.classId === studentClassId || data.classId === "all") {
                    list.push({ id: dSnap.id, ...data } as Subject);
                  }
                });
                setSubjects(list);
              }, (err) => console.warn("⚠️ subjects listener failed:", err));

              // Objective Tests Listener
              testsUnsub = onSnapshot(collection(db, "objectiveTests"), (snap) => {
                const list: ObjectiveTest[] = [];
                snap.forEach(dSnap => {
                  const data = dSnap.data();
                  
                  // Filter out unpublished or inactive tests, and mismatching classes
                  const classIdMatch = !data.classId || data.classId === studentClassId || data.classId === "all";
                  const isPublished = data.published !== false;
                  const isActive = data.active !== false && data.status !== "inactive";

                  if (classIdMatch && isPublished && isActive) {
                    let rawQuestions: any[] = [];
                    if (Array.isArray(data.questions)) rawQuestions = data.questions;
                    else if (Array.isArray(data.questionsList)) rawQuestions = data.questionsList;

                    const normalizedQuestions = rawQuestions.map((q: any) => ({
                      questionText: q.questionText || q.q || "Question text not provided",
                      options: Array.isArray(q.options) ? q.options : [],
                      correctOption: typeof q.correctOption === 'number' 
                        ? q.correctOption 
                        : (typeof q.answer === 'number' ? q.answer : 0)
                    }));

                    const questionCount = normalizedQuestions.length > 0 ? normalizedQuestions.length : (typeof data.questions === 'number' ? data.questions : 10);
                    const durationValue = typeof data.duration === 'number' ? data.duration : (typeof data.timeLimit === 'number' ? data.timeLimit : (typeof data.time === 'number' ? data.time : 30));

                    list.push({
                      id: dSnap.id,
                      subject: data.subject || "General",
                      subjectId: data.subjectId || "",
                      classId: data.classId || "",
                      questions: questionCount,
                      marks: data.marks || 100,
                      passingMarks: data.passingMarks,
                      difficulty: data.difficulty,
                      timeLimit: durationValue,
                      completed: data.completed || false,
                      score: data.score,
                      questionsList: normalizedQuestions
                    } as ObjectiveTest);
                  }
                });
                setTests(list);
              }, (err) => console.warn("⚠️ objectiveTests listener failed:", err));

              // Notifications Listener
              notificationsUnsub = onSnapshot(collection(db, "notifications"), (snap) => {
                const list: NotificationItem[] = [];
                snap.forEach(dSnap => {
                  const data = dSnap.data();
                  if (!data.classId || data.classId === studentClassId || data.classId === "all") {
                    list.push({ id: dSnap.id, ...data } as NotificationItem);
                  }
                });
                // Sort client-side by timestamp (newest first)
                list.sort((a: any, b: any) => {
                  const tA = a.timestamp ? (a.timestamp.seconds || a.timestamp) : 0;
                  const tB = b.timestamp ? (b.timestamp.seconds || b.timestamp) : 0;
                  return tB - tA;
                });
                setNotifications(list);
              }, (err) => console.warn("⚠️ notifications listener failed:", err));

              // Banners Listener
              bannersUnsub = onSnapshot(collection(db, "banners"), (snap) => {
                const list: any[] = [];
                snap.forEach(dSnap => {
                  const data = dSnap.data();
                  if (!data.classId || data.classId === studentClassId || data.classId === "all") {
                    list.push({ id: dSnap.id, ...data });
                  }
                });
                setBanners(list);
              }, (err) => console.warn("⚠️ banners listener failed:", err));

              // Homework Listener
              homeworkUnsub = onSnapshot(collection(db, "homework"), (snap) => {
                const list: any[] = [];
                snap.forEach(dSnap => {
                  const data = dSnap.data();
                  if (!data.classId || data.classId === studentClassId || data.classId === "all") {
                    list.push({ id: dSnap.id, ...data });
                  }
                });
                setHomework(list);
              }, (err) => console.warn("⚠️ homework listener failed:", err));

              // Assignments Listener
              assignmentsUnsub = onSnapshot(collection(db, "assignments"), (snap) => {
                const list: any[] = [];
                snap.forEach(dSnap => {
                  const data = dSnap.data();
                  if (!data.classId || data.classId === studentClassId || data.classId === "all") {
                    list.push({ id: dSnap.id, ...data });
                  }
                });
                setAssignments(list);
              }, (err) => console.warn("⚠️ assignments listener failed:", err));

              // Live Classes Listener
              liveClassesUnsub = onSnapshot(collection(db, "liveClasses"), (snap) => {
                const list: any[] = [];
                snap.forEach(dSnap => {
                  const data = dSnap.data();
                  if (!data.classId || data.classId === studentClassId || data.classId === "all") {
                    list.push({ id: dSnap.id, ...data });
                  }
                });
                setLiveClasses(list);
              }, (err) => console.warn("⚠️ liveClasses listener failed:", err));

              // Recorded Classes Listener
              recordedClassesUnsub = onSnapshot(collection(db, "recordedClasses"), (snap) => {
                const list: any[] = [];
                snap.forEach(dSnap => {
                  const data = dSnap.data();
                  if (!data.classId || data.classId === studentClassId || data.classId === "all") {
                    list.push({ id: dSnap.id, ...data });
                  }
                });
                setRecordedClasses(list);
              }, (err) => console.warn("⚠️ recordedClasses listener failed:", err));

            } else {
              setHasRegistered(false);
            }
          } else {
            console.log("📄 [Firestore Profile Listener] Document does not exist. Auto-creating base profile document.");
            const baseProfile = {
              name: user.displayName || "",
              studentName: user.displayName || "",
              className: "Class 12 - Science",
              class: "Class 12 - Science",
              classId: "class-12-science",
              dob: "",
              gender: "Male",
              village: "",
              profilePic: "",
              isRegistered: false
            };
            try {
              await setDoc(doc(db, "students", user.uid), baseProfile);
              console.log("✍️ [Firestore] Auto-write student doc result: SUCCESS");
            } catch (writeErr) {
              console.error("❌ [Firestore] Auto-write student doc result: FAILED", writeErr);
            }
            setProfile(baseProfile as StudentProfile);
            setHasRegistered(false);
          }
          setAuthLoading(false);
        }, (err) => {
          console.error("❌ [Firestore Profile Listener] Failed:", err);
          setAuthLoading(false);
        });

      } else {
        console.log("🆔 [Auth Observer] No active session. Route decision: Redirect to Login");
        setCurrentUser(null);
        setProfile(initialEmptyProfile);
        setHasRegistered(false);
        setSubjects([]);
        setTests([]);
        setNotifications([]);
        setBanners([]);
        setHomework([]);
        setAssignments([]);
        setLiveClasses([]);
        setRecordedClasses([]);
        setAuthLoading(false);
      }
    });

    return () => {
      authUnsub();
      cleanupListeners();
    };
  }, []);

  // Secure Firebase Sign Out handling
  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      if (auth) {
        await signOut(auth);
      }
      setCurrentUser(null);
      setProfile(initialEmptyProfile);
      setHasRegistered(false);
      setSubjects([]);
      setTests([]);
      setNotifications([]);
      setBanners([]);
    } catch (error) {
      console.error("Firebase Auth Sign Out error:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  // Toggle single notification read/unread state
  const handleToggleNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Triggered when interactive quiz is completed and submitted
  const handleQuizComplete = (scorePoints: number) => {
    if (!activeQuiz) return;

    // Calculate score percentage
    const scorePercentage = Math.round((scorePoints / activeQuiz.marks) * 100);

    // 1. Update test results in state
    setTests((prevTests) =>
      prevTests.map((t) =>
        t.id === activeQuiz.id
          ? { ...t, completed: true, score: scorePoints }
          : t
      )
    );

    // 2. Insert new notification item
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Test Completed: ${activeQuiz.subject}`,
      description: `You scored ${scorePoints}/${activeQuiz.marks} (${scorePercentage}%) in the objective test. View detailed stats on your profile.`,
      time: "Just now",
      category: "test",
      read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasPendingTests = tests.some((t) => !t.completed);

  // Referenced to satisfy strict TS local checks for class management datasets
  if (homework.length + assignments.length + liveClasses.length + recordedClasses.length < 0) {
    console.log("🎒 Loaded Class Curriculum:", homework, assignments, liveClasses, recordedClasses);
  }

  // Authentication Loading Screen
  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4 select-none">
        <LogoSVG className="w-16 h-16 animate-bounce-soft" />
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">Syncing Student Portal...</p>
      </div>
    );
  }

  return (
    <Router>
      <Layout
        profile={profile}
        unreadNotificationsCount={unreadCount}
        hasPendingTests={hasPendingTests}
      >
        {dbError && (
          <div className="bg-orange-500 text-white text-[10px] font-bold py-1.5 px-4 text-center select-none shrink-0 z-50 animate-fade-in flex items-center justify-center space-x-1">
            <span className="material-symbols-rounded text-xs">database_off</span>
            <span>{dbError}</span>
          </div>
        )}


        <Routes>
          {/* Public Views */}
          <Route path="/" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route 
            path="/login" 
            element={
              currentUser ? (
                hasRegistered ? <Navigate to="/dashboard" replace /> : <Navigate to="/register" replace />
              ) : (
                <Login 
                  onLoginSuccess={(user) => {
                    setCurrentUser(user);
                    if (user.displayName) {
                      setProfile(prev => ({ ...prev, name: user.displayName! }));
                    }
                    if (!hasConfig) {
                      setHasRegistered(false);
                    }
                  }} 
                />
              )
            } 
          />

          {/* Registration */}
          <Route 
            path="/register" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Register 
                    uid={currentUser.uid}
                    profile={profile}
                    onRegisterComplete={async (p) => {
                      setProfile(p);
                      setHasRegistered(true);
                    }}
                  />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Onboarding Guide */}
          <Route 
            path="/onboarding" 
            element={
              currentUser ? <Onboarding /> : <Navigate to="/login" replace />
            } 
          />

          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <Dashboard 
                    profile={profile}
                    subjects={subjects}
                    tests={tests}
                    notifications={notifications}
                    banners={banners}
                    onStartQuiz={(t) => setActiveQuiz(t)}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/register" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/dashboard/subjects" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <Dashboard 
                    profile={profile}
                    subjects={subjects}
                    tests={tests}
                    notifications={notifications}
                    banners={banners}
                    onStartQuiz={(t) => setActiveQuiz(t)}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/register" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/dashboard/tests" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <Dashboard 
                    profile={profile}
                    subjects={subjects}
                    tests={tests}
                    notifications={notifications}
                    banners={banners}
                    onStartQuiz={(t) => setActiveQuiz(t)}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/register" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/dashboard/profile" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <Dashboard 
                    profile={profile}
                    subjects={subjects}
                    tests={tests}
                    notifications={notifications}
                    banners={banners}
                    onStartQuiz={(t) => setActiveQuiz(t)}
                    onLogout={handleLogout}
                  />
                ) : (
                  <Navigate to="/register" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Notifications */}
          <Route 
            path="/notifications" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <Notifications 
                    notifications={notifications}
                    onToggleRead={handleToggleNotificationRead}
                    onMarkAllRead={handleMarkAllNotificationsRead}
                  />
                ) : (
                  <Navigate to="/register" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Edit Profile */}
          <Route 
            path="/profile/edit" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <EditProfile 
                    uid={currentUser.uid}
                    profile={profile}
                    onProfileUpdate={async (p) => {
                      setProfile(p);
                    }}
                  />
                ) : (
                  <Navigate to="/register" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Homework */}
          <Route 
            path="/homework" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <Homework homework={homework} />
                ) : (
                  <Navigate to="/register" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Assignments */}
          <Route 
            path="/assignments" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <Assignments assignments={assignments} />
                ) : (
                  <Navigate to="/register" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Live Classes */}
          <Route 
            path="/live-classes" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <LiveClasses liveClasses={liveClasses} />
                ) : (
                  <Navigate to="/register" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Recorded Classes */}
          <Route 
            path="/recorded-classes" 
            element={
              currentUser ? (
                hasRegistered ? (
                  <RecordedClasses recordedClasses={recordedClasses} />
                ) : (
                  <Navigate to="/register" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      {/* Render active Quiz modal */}
      {activeQuiz && (
        <QuizModal
          test={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={handleQuizComplete}
        />
      )}
    </Router>
  );
}
