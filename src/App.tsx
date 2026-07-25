import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, hasConfig } from './config/firebase';

import type { StudentProfile, Subject, ObjectiveTest, NotificationItem } from './types';
import { initialProfile, mockSubjects, mockTests, mockNotifications } from './mockData';

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

  // App core domain states (Synced globally)
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [subjects] = useState<Subject[]>(mockSubjects);
  const [tests, setTests] = useState<ObjectiveTest[]>(mockTests);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  
  // MCQ Test running modal state
  const [activeQuiz, setActiveQuiz] = useState<ObjectiveTest | null>(null);

  // Listen to Firebase Auth state change to persist login state across reloads/redirects
  useEffect(() => {
    if (!hasConfig || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setDbError(null);
      if (user) {
        const loggedInUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        };
        setCurrentUser(loggedInUser);

        // Check if student profile details document exists in Firestore using UID
        try {
          if (db) {
            const docRef = doc(db, "students", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setProfile(docSnap.data() as StudentProfile);
              setHasRegistered(true);
            } else {
              setHasRegistered(false);
            }
          }
        } catch (err: any) {
          console.error("Firestore read error on auth state change:", err);
          setDbError("Database sync issue. Using local profile backup.");
          // Non-fatal fallback for testing/security rules configuration
          setHasRegistered(false);
        }
      } else {
        setCurrentUser(null);
        setHasRegistered(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Toggle single notification read/unread state
  const handleToggleNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: !n.read } : n))
    );
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
      <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <LogoSVG className="w-16 h-16 animate-bounce-soft" />
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">Syncing Session...</p>
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
                      // Bypass Firestore document checks in local Mock Mode
                      setHasRegistered(false);
                    }
                  }} 
                />
              )
            } 
          />

          {/* Registration Forms */}
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
                    onRegisterComplete={(p) => {
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

          {/* Protected Main Views */}
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
                    onStartQuiz={(t) => setActiveQuiz(t)}
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
                    onStartQuiz={(t) => setActiveQuiz(t)}
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
                    onStartQuiz={(t) => setActiveQuiz(t)}
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
                    onStartQuiz={(t) => setActiveQuiz(t)}
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
                    onProfileUpdate={(p) => {
                      setProfile(p);
                      // Insert notification
                      const newNotif: NotificationItem = {
                        id: `notif-${Date.now()}`,
                        title: "Profile Edited",
                        description: "Your student registry profile details were saved successfully.",
                        time: "Just now",
                        category: "profile",
                        read: false
                      };
                      setNotifications([newNotif, ...notifications]);
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
