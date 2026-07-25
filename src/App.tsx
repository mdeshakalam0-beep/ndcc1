import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import type { StudentProfile, Subject, ObjectiveTest, NotificationItem } from './types';
import { initialProfile, mockSubjects, mockTests, mockNotifications } from './mockData';

// Layout & Modals
import Layout from './components/Layout';
import QuizModal from './components/QuizModal';

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

  // App core domain states (Synced globally)
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [subjects] = useState<Subject[]>(mockSubjects);
  const [tests, setTests] = useState<ObjectiveTest[]>(mockTests);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  
  // MCQ Test running modal state
  const [activeQuiz, setActiveQuiz] = useState<ObjectiveTest | null>(null);

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

  return (
    <Router>
      <Layout
        profile={profile}
        unreadNotificationsCount={unreadCount}
        hasPendingTests={hasPendingTests}
      >
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route 
            path="/login" 
            element={
              <Login 
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  if (user.displayName) {
                    setProfile(prev => ({ ...prev, name: user.displayName! }));
                  }
                }} 
              />
            } 
          />

          {/* Registration & Onboarding */}
          <Route 
            path="/register" 
            element={
              currentUser ? (
                <Register 
                  uid={currentUser.uid}
                  profile={profile}
                  onRegisterComplete={(p) => setProfile(p)}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/onboarding" 
            element={
              currentUser ? <Onboarding /> : <Navigate to="/login" replace />
            } 
          />

          {/* Protected Dashboard Views */}
          <Route 
            path="/dashboard" 
            element={
              currentUser ? (
                <Dashboard 
                  profile={profile}
                  subjects={subjects}
                  tests={tests}
                  notifications={notifications}
                  onStartQuiz={(t) => setActiveQuiz(t)}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/dashboard/subjects" 
            element={
              currentUser ? (
                <Dashboard 
                  profile={profile}
                  subjects={subjects}
                  tests={tests}
                  notifications={notifications}
                  onStartQuiz={(t) => setActiveQuiz(t)}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/dashboard/tests" 
            element={
              currentUser ? (
                <Dashboard 
                  profile={profile}
                  subjects={subjects}
                  tests={tests}
                  notifications={notifications}
                  onStartQuiz={(t) => setActiveQuiz(t)}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/dashboard/profile" 
            element={
              currentUser ? (
                <Dashboard 
                  profile={profile}
                  subjects={subjects}
                  tests={tests}
                  notifications={notifications}
                  onStartQuiz={(t) => setActiveQuiz(t)}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Other Protected Pages */}
          <Route 
            path="/notifications" 
            element={
              currentUser ? (
                <Notifications 
                  notifications={notifications}
                  onToggleRead={handleToggleNotificationRead}
                  onMarkAllRead={handleMarkAllNotificationsRead}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/profile/edit" 
            element={
              currentUser ? (
                <EditProfile 
                  uid={currentUser.uid}
                  profile={profile}
                  onProfileUpdate={(p) => {
                    setProfile(p);
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
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      {/* Render the MCQ Test modal overlay if triggered */}
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
