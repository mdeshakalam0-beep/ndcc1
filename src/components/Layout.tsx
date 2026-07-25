import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogoSVG } from './Illustrations';
import type { StudentProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  profile: StudentProfile;
  unreadNotificationsCount: number;
  hasPendingTests: boolean;
}

export default function Layout({
  children,
  profile,
  unreadNotificationsCount,
  hasPendingTests
}: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to determine if we are inside dashboard/notifications/edit-profile area (authenticated views)
  const isAuthPage = 
    location.pathname.startsWith('/dashboard') || 
    location.pathname === '/notifications' || 
    location.pathname === '/profile/edit';

  const currentTab = () => {
    if (location.pathname === '/dashboard') return 'home';
    if (location.pathname === '/dashboard/subjects') return 'subjects';
    if (location.pathname === '/dashboard/tests') return 'tests';
    if (location.pathname === '/dashboard/profile') return 'profile';
    return '';
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans select-none antialiased">
      
      {/* Common Header for Authenticated Pages */}
      {isAuthPage && (
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10 select-none shrink-0 shadow-sm">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <LogoSVG className="w-8 h-8 filter drop-shadow-[0_2px_4px_rgba(37,99,235,0.1)]" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 tracking-wide uppercase">New Direction</h4>
              <p className="text-[9px] font-medium text-slate-400 tracking-wider">COACHING CENTRE</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Alert bell icon */}
            <button 
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-650 transition flex items-center justify-center relative cursor-pointer active:scale-90"
            >
              <span className="material-symbols-rounded">notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Profile avatar link */}
            <button 
              onClick={() => navigate('/dashboard/profile')}
              className={`w-9 h-9 rounded-full overflow-hidden border-2 transition cursor-pointer ${location.pathname === '/dashboard/profile' ? 'border-blue-600 scale-105' : 'border-slate-200'}`}
            >
              <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" />
            </button>
          </div>
        </header>
      )}

      {/* Render children/pages */}
      <div className="flex-1 flex flex-col relative overflow-y-auto no-scrollbar bg-slate-50">
        {children}
      </div>

      {/* Bottom Floating Navigation Bar (Aligned and centered, optimized for touch interaction) */}
      {location.pathname.startsWith('/dashboard') && (
        <div className="p-4 shrink-0 bg-white border-t border-slate-100 flex justify-center z-10 select-none">
          <nav className="w-full max-w-md bg-white/95 backdrop-blur-md border border-slate-150/70 h-16 rounded-[24px] shadow-lg flex items-center justify-around px-2">
            {[
              { id: 'home', label: 'Home', icon: 'home', path: '/dashboard' },
              { id: 'subjects', label: 'Subjects', icon: 'menu_book', path: '/dashboard/subjects' },
              { id: 'tests', label: 'Tests', icon: 'quiz', path: '/dashboard/tests' },
              { id: 'profile', label: 'Profile', icon: 'person', path: '/dashboard/profile' }
            ].map((tab) => {
              const isTabActive = currentTab() === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition duration-200 relative cursor-pointer ${isTabActive ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400 hover:text-slate-650'}`}
                >
                  <span className="material-symbols-rounded text-xl leading-none">{tab.icon}</span>
                  <span className="text-[9px] tracking-wide mt-1 font-medium">{tab.label}</span>
                  {tab.id === 'tests' && hasPendingTests && (
                    <span className="absolute top-1 right-2 w-2 h-2 bg-orange-500 rounded-full"></span>
                  )}
                  {isTabActive && (
                    <span className="absolute -bottom-1.5 w-5 h-1 bg-blue-600 rounded-full animate-fade-in"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
