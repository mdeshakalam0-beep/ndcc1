import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogoSVG } from './Illustrations';
import type { StudentProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  profile: StudentProfile;
  unreadNotificationsCount: number;
  hasPendingTests: boolean;
  resetFlow: () => void;
}

export default function Layout({
  children,
  profile,
  unreadNotificationsCount,
  hasPendingTests,
  resetFlow
}: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Viewport mode: mobile | tablet | full
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet' | 'full'>('mobile');
  const [showDevPanel, setShowDevPanel] = useState(true);

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* Dev / Review Drawer Panel (Left Sidebar) */}
      {showDevPanel && (
        <div className="w-full lg:w-80 bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-700 flex flex-col p-4 z-50 overflow-y-auto shrink-0 animate-fade-in select-none">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-rounded text-blue-500">terminal</span>
              <h2 className="font-bold text-sm text-slate-200 tracking-wide uppercase">Review Panel</h2>
            </div>
            <button 
              onClick={() => setShowDevPanel(false)}
              className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <span className="material-symbols-rounded text-lg">close</span>
            </button>
          </div>

          {/* Device Mockup selectors */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-405 uppercase tracking-wider block mb-2">Device Viewport</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg">
              {(['mobile', 'tablet', 'full'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`py-1.5 text-xs font-medium rounded transition capitalize cursor-pointer ${viewMode === mode ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Route Screen Jumper List */}
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-semibold text-slate-405 uppercase tracking-wider block mb-2">Direct Screen Jumper</label>
            {[
              { id: 1, name: "1. Splash Screen", icon: "hourglass_empty", path: "/" },
              { id: 2, name: "2. Welcome Screen", icon: "waving_hand", path: "/welcome" },
              { id: 3, name: "3. Google Login", icon: "login", path: "/login" },
              { id: 4, name: "4. Student Info Form", icon: "assignment", path: "/register" },
              { id: 5, name: "5. Onboarding Guide", icon: "explore", path: "/onboarding" },
              { id: 6, name: "6. Home Dashboard", icon: "dashboard", path: "/dashboard" },
              { id: 7, name: "7. Notifications Portal", icon: "notifications", path: "/notifications" },
              { id: 8, name: "8. Profile Screen", icon: "person", path: "/dashboard/profile" },
              { id: 9, name: "9. Edit Profile Form", icon: "edit", path: "/profile/edit" }
            ].map((scr) => {
              const isActive = 
                location.pathname === scr.path || 
                (scr.id === 6 && location.pathname.startsWith('/dashboard') && location.pathname !== '/dashboard/profile');
              return (
                <button
                  key={scr.id}
                  onClick={() => navigate(scr.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg text-xs font-medium transition duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent'
                  }`}
                >
                  <span className="material-symbols-rounded text-sm">{scr.icon}</span>
                  <span className="truncate">{scr.name}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-700">
            <button
              onClick={() => {
                resetFlow();
                navigate('/');
              }}
              className="w-full py-2 bg-slate-750 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span className="material-symbols-rounded text-xs">restart_alt</span>
              <span>Reset Demo Flow</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating control trigger when sidebar is hidden */}
      {!showDevPanel && (
        <button
          onClick={() => setShowDevPanel(true)}
          className="fixed left-4 bottom-4 z-50 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition hover:scale-110 active:scale-95 cursor-pointer"
          title="Open Screen Jumper"
        >
          <span className="material-symbols-rounded text-xl">menu_open</span>
        </button>
      )}

      {/* Viewport Frame sandbox */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-y-auto bg-slate-950">
        
        <div className={`transition-all duration-300 relative flex flex-col bg-slate-50 text-slate-900 ${
          viewMode === 'mobile' 
            ? 'w-[375px] h-[780px] rounded-[40px] shadow-2xl border-[8px] border-slate-800 relative overflow-hidden'
            : viewMode === 'tablet'
            ? 'w-[768px] h-[1024px] rounded-[32px] shadow-2xl border-[10px] border-slate-800 relative overflow-hidden'
            : 'w-full h-full max-w-6xl min-h-[80vh] rounded-2xl shadow-xl overflow-hidden'
        }`}>
          
          {/* Simulated notched status bars */}
          {viewMode === 'mobile' && (
            <div className="bg-slate-900 text-white h-7 px-6 flex items-center justify-between text-[11px] font-medium z-40 shrink-0 select-none">
              <span>9:41</span>
              <div className="w-20 h-4 bg-black rounded-b-xl absolute left-1/2 -translate-x-1/2 top-0"></div>
              <div className="flex items-center space-x-1.5">
                <span className="material-symbols-rounded text-[12px]">signal_cellular_alt</span>
                <span className="material-symbols-rounded text-[12px]">wifi</span>
                <span className="material-symbols-rounded text-[12px]">battery_full</span>
              </div>
            </div>
          )}

          {viewMode === 'tablet' && (
            <div className="bg-slate-900 text-white h-8 px-6 flex items-center justify-between text-xs font-medium z-40 shrink-0 select-none">
              <span>NEW DIRECTION COACHING CENTRE</span>
              <div className="flex items-center space-x-2">
                <span className="material-symbols-rounded text-sm">wifi</span>
                <span className="material-symbols-rounded text-sm">battery_full</span>
                <span>Saturday, 9:41 AM</span>
              </div>
            </div>
          )}

          {/* Outer Viewport Canvas */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 relative pb-2">
            
            {/* Common Header for Authenticated Pages (Dashboard, Notifications, Edit Profile) */}
            {isAuthPage && (
              <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10 select-none">
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
            <div className="flex-1 flex flex-col relative overflow-y-auto no-scrollbar">
              {children}
            </div>

            {/* Bottom floating Navigation Bar (Visible only inside dashboard paths) */}
            {location.pathname.startsWith('/dashboard') && (
              <nav className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-slate-150/70 h-16 rounded-[24px] shadow-lg flex items-center justify-around px-2 z-15 select-none">
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
            )}

            {/* iOS Home Indicator Mock */}
            {viewMode === 'mobile' && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/20 rounded-full z-40 pointer-events-none"></div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
