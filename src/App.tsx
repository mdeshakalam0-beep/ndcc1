import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
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
  const [dataLoading, setDataLoading] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // App core domain states loaded dynamically from Firestore
  const [profile, setProfile] = useState<StudentProfile>(initialEmptyProfile);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tests, setTests] = useState<ObjectiveTest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  
  // MCQ Test running modal state
  const [activeQuiz, setActiveQuiz] = useState<ObjectiveTest | null>(null);

  // Helper to fetch live student portal datasets from Firestore
  const fetchFirestoreData = async () => {
    if (!db) return;
    setDataLoading(true);
    setDbError(null);
    
    // 1. Fetch Class Subjects
    try {
      const subsSnap = await getDocs(collection(db, "subjects"));
      const subsList: Subject[] = [];
      subsSnap.forEach(docSnap => {
        subsList.push({ id: docSnap.id, ...docSnap.data() } as Subject);
      });
      setSubjects(subsList);
    } catch (err) {
      console.warn("⚠️ Firestore 'subjects' read failed (Verify security rules or collection existence):", err);
    }

    // 2. Fetch Class Mock Tests
    try {
      const testsSnap = await getDocs(collection(db, "tests"));
      const testsList: ObjectiveTest[] = [];
      testsSnap.forEach(docSnap => {
        testsList.push({ id: docSnap.id, ...docSnap.data() } as ObjectiveTest);
      });
      setTests(testsList);
    } catch (err) {
      console.warn("⚠️ Firestore 'tests' read failed (Verify security rules or collection existence):", err);
    }

    // 3. Fetch Bulletin Announcements (Sorted by timestamp)
    try {
      const notifsList: NotificationItem[] = [];
      try {
        const notifQuery = query(collection(db, "notifications"), orderBy("timestamp", "desc"));
        const notifsSnap = await getDocs(notifQuery);
        notifsSnap.forEach(docSnap => {
          notifsList.push({ id: docSnap.id, ...docSnap.data() } as NotificationItem);
        });
      } catch (sortErr) {
        // Fallback if timestamp index is not set up on Firestore
        const notifsSnap = await getDocs(collection(db, "notifications"));
        notifsSnap.forEach(docSnap => {
          notifsList.push({ id: docSnap.id, ...docSnap.data() } as NotificationItem);
        });
      }
      setNotifications(notifsList);
    } catch (err) {
      console.warn("⚠️ Firestore 'notifications' read failed (Verify security rules or collection existence):", err);
    }

    // 4. Fetch Hero Slider Announcements
    try {
      const bannersSnap = await getDocs(collection(db, "banners"));
      const bannersList: any[] = [];
      bannersSnap.forEach(docSnap => {
        bannersList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setBanners(bannersList);
    } catch (err) {
      console.warn("⚠️ Firestore 'banners' read failed (Verify security rules or collection existence):", err);
    }

    setDataLoading(false);
  };

  // Listen to Firebase Auth state change to persist login state across reloads/redirects
  useEffect(() => {
    if (!hasConfig || !auth) {
      setAuthLoading(false);
      return;
    }

    // Resolve Google redirect sign in results on mount
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("Firebase Redirect sign-in completed for:", result.user.email);
        }
      })
      .catch((err: any) => {
        console.error("Firebase Redirect auth resolution error:", err);
        setDbError("Sign in failed. Please try again.");
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setDbError(null);
      if (user) {
        const loggedInUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        };
        setCurrentUser(loggedInUser);

        try {
          if (db) {
            const docRef = doc(db, "students", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setProfile(docSnap.data() as StudentProfile);
              setHasRegistered(true);
              // Trigger collection fetch
              await fetchFirestoreData();
            } else {
              setHasRegistered(false);
            }
          }
        } catch (err: any) {
          console.error("Firestore student doc read error:", err);
          setDbError("Database sync warning. Check student permissions.");
          setHasRegistered(false);
        }
      } else {
        // Clear all states on null session
        setCurrentUser(null);
        setProfile(initialEmptyProfile);
        setHasRegistered(false);
        setSubjects([]);
        setTests([]);
        setNotifications([]);
        setBanners([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
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
        
        {dataLoading && (
          <div className="h-1.5 w-full bg-blue-100 overflow-hidden shrink-0 select-none z-50">
            <div className="h-full bg-blue-600 animate-pulse w-1/3 rounded-full"></div>
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
                      await fetchFirestoreData();
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
                      // Fetch fresh updates
                      await fetchFirestoreData();
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
