import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogoSVG } from '../components/Illustrations';
import type { StudentProfile, Subject, ObjectiveTest, NotificationItem } from '../types';

interface DashboardProps {
  profile: StudentProfile;
  subjects: Subject[];
  tests: ObjectiveTest[];
  notifications: NotificationItem[];
  onStartQuiz: (test: ObjectiveTest) => void;
}

export default function Dashboard({
  profile,
  subjects,
  tests,
  notifications,
  onStartQuiz
}: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine subview tab: 'home' | 'subjects' | 'tests' | 'profile'
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard/subjects') return 'subjects';
    if (path === '/dashboard/tests') return 'tests';
    if (path === '/dashboard/profile') return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  // Hero Announcement Slider Index
  const [heroIndex, setHeroIndex] = useState(0);
  const heroSlides = [
    {
      title: "Admissions Open 2026",
      desc: "Enroll now in Target batches. Get up to 50% discount based on scholarship tests.",
      color: "from-blue-600 via-blue-700 to-indigo-800",
      accent: "NEW"
    },
    {
      title: "Weekly Mock Tests",
      desc: "Physics & Chemistry MCQs this Sunday at 10:00 AM. Access under Tests portal.",
      color: "from-indigo-600 via-purple-600 to-pink-700",
      accent: "URGENT"
    },
    {
      title: "Doubt Clearing Sessions",
      desc: "Daily offline doubt classes at NDCC campus from 4:00 PM to 6:00 PM with experts.",
      color: "from-cyan-600 via-blue-600 to-teal-700",
      accent: "DAILY"
    }
  ];

  // Subject Search Filter
  const [subjectSearch, setSubjectSearch] = useState('');

  // Auto-slide hero banner every 5 seconds
  useEffect(() => {
    if (activeTab === 'home') {
      const timer = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  // Derived Performance Metrics
  const completedTests = tests.filter(t => t.completed);
  const averageScore = completedTests.length > 0 
    ? Math.round(completedTests.reduce((acc, t) => acc + ((t.score || 0) / t.marks) * 100, 0) / completedTests.length)
    : 0;

  return (
    <div className="flex-1 flex flex-col pb-24 overflow-y-auto no-scrollbar">
      
      {/* 1. HOME TAB */}
      {activeTab === 'home' && (
        <div className="p-5 space-y-6 animate-fade-in">
          {/* GREETING */}
          <div className="flex items-center justify-between select-none">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Good Morning,</h3>
              <h2 className="text-xl font-black text-blue-600 tracking-tight">{profile.name}</h2>
            </div>
            <div className="bg-blue-600/5 px-3 py-1.5 rounded-full border border-blue-600/10 flex items-center space-x-1.5">
              <span className="material-symbols-rounded text-xs text-blue-600">military_tech</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                {profile.className.split(' - ')[1] || 'Science'}
              </span>
            </div>
          </div>

          {/* HERO BANNER SLIDER */}
          <div className="relative h-44 rounded-[24px] overflow-hidden shadow-lg shadow-blue-500/5 select-none">
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 bg-gradient-to-br ${slide.color} text-white p-5 flex flex-col justify-between transition-all duration-500 ${
                  heroIndex === idx ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="bg-white/20 text-white font-bold text-[9px] tracking-widest px-2.5 py-1 rounded-full uppercase backdrop-blur-sm border border-white/10">
                    {slide.accent}
                  </span>
                  <LogoSVG className="w-6 h-6 opacity-40" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-base font-bold leading-tight">{slide.title}</h4>
                  <p className="text-[11px] text-blue-100 font-medium leading-relaxed max-w-[85%]">{slide.desc}</p>
                </div>
              </div>
            ))}
            
            <div className="absolute right-4 top-4 flex space-x-1">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${heroIndex === idx ? 'bg-white w-3' : 'bg-white/40'}`}
                ></button>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS GRID */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Access</h4>
            <div className="grid grid-cols-4 gap-3 select-none">
              {[
                { name: "Subjects", icon: "menu_book", path: "/dashboard/subjects", color: "bg-blue-500/10 text-blue-600" },
                { name: "MCQ Tests", icon: "quiz", path: "/dashboard/tests", color: "bg-emerald-500/10 text-emerald-600" },
                { name: "Progress", icon: "analytics", path: "/dashboard/profile", color: "bg-cyan-500/10 text-cyan-600" },
                { name: "Profile", icon: "person", path: "/dashboard/profile", color: "bg-purple-500/10 text-purple-600" }
              ].map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(act.path)}
                  className="bg-white p-3.5 rounded-[20px] shadow-sm hover:shadow-md transition duration-200 border border-slate-100 flex flex-col items-center justify-center space-y-2 text-center group active:scale-95 cursor-pointer"
                >
                  <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center ${act.color} group-hover:scale-105 transition`}>
                    <span className="material-symbols-rounded text-xl">{act.icon}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 leading-tight">{act.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LATEST ALERTS SUMMARY */}
          <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 space-y-3 select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-rounded text-blue-600 text-lg">campaign</span>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Latest Alerts</h4>
              </div>
              <button 
                onClick={() => navigate('/notifications')}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center cursor-pointer"
              >
                <span>View All</span>
                <span className="material-symbols-rounded text-xs">chevron_right</span>
              </button>
            </div>
            {notifications.slice(0, 1).map((notif) => (
              <div key={notif.id} className="p-3 bg-slate-50 rounded-xl flex items-start space-x-3">
                <span className="material-symbols-rounded text-sm bg-blue-100 text-blue-600 p-1.5 rounded-lg shrink-0 mt-0.5">
                  {notif.category === 'test' ? 'quiz' : notif.category === 'profile' ? 'person' : 'announcement'}
                </span>
                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-semibold text-slate-800 truncate">{notif.title}</h5>
                    <span className="text-[9px] text-slate-400 font-medium shrink-0 ml-2">{notif.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal line-clamp-1">{notif.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* SUBJECT CAROUSEL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Subjects</h4>
              <button 
                onClick={() => navigate('/dashboard/subjects')}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center cursor-pointer"
              >
                <span>See All</span>
                <span className="material-symbols-rounded text-xs">chevron_right</span>
              </button>
            </div>
            
            <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory select-none">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="w-48 shrink-0 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between space-y-4 snap-start hover:shadow-md transition duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 rounded-[14px] fill-none flex items-center justify-center bg-gradient-to-br ${sub.color} text-white`}>
                      <span className="material-symbols-rounded text-lg">{sub.icon}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{sub.chapters} Chapters</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-800">{sub.name}</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-semibold text-slate-500">
                        <span>Progress</span>
                        <span>{sub.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-105 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full" 
                          style={{ width: `${sub.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/dashboard/subjects')}
                    className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-[10px] font-bold rounded-lg transition cursor-pointer"
                  >
                    View Chapters
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* NEXT TEST PREVIEW */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Practice Exam</h4>
              <button 
                onClick={() => navigate('/dashboard/tests')}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center cursor-pointer"
              >
                <span>Browse All</span>
                <span className="material-symbols-rounded text-xs">chevron_right</span>
              </button>
            </div>
            
            {tests.filter(t => !t.completed).slice(0, 1).map((test) => (
              <div 
                key={test.id} 
                className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="bg-orange-500/10 text-orange-600 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-orange-500/10">
                      Not Attempted
                    </span>
                    <h5 className="text-sm font-bold text-slate-800 pt-1">{test.subject} Practice Mock</h5>
                  </div>
                  <span className="material-symbols-rounded text-orange-500 text-lg">pending_actions</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 py-1 bg-slate-50 rounded-xl text-center">
                  <div>
                    <p className="text-[9px] text-slate-450 font-medium">Questions</p>
                    <p className="text-xs font-bold text-slate-800">{test.questions}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-450 font-medium">Full Marks</p>
                    <p className="text-xs font-bold text-slate-800">{test.marks}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-450 font-medium">Time Limit</p>
                    <p className="text-xs font-bold text-slate-800">{test.timeLimit}m</p>
                  </div>
                </div>
                
                <button
                  onClick={() => onStartQuiz(test)}
                  className="w-full py-3 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span className="material-symbols-rounded text-sm">play_arrow</span>
                  <span>Start Test Now</span>
                </button>
              </div>
            ))}
          </div>

          {/* PERFORMANCE RADIAL SUMMARY */}
          <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 space-y-4 select-none">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-rounded text-blue-600">query_stats</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Performance Analytics</h4>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Overall Syllabus</span>
                  <p className="text-lg font-extrabold text-slate-800">71% Complete</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Average MCQ Score</span>
                  <p className="text-lg font-extrabold text-blue-600">{averageScore}%</p>
                </div>
              </div>
              
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                  <circle 
                    cx="50" cy="50" r="40" fill="none" stroke="#2563EB" strokeWidth="10" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * 71) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-black text-slate-800">71%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div className="p-5 space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">Coaching Subjects</h3>
            <p className="text-xs text-slate-500">Access video lectures, study materials, and chapter-wise tests.</p>
          </div>

          <div className="relative">
            <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              placeholder="Search subjects or chapters..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects
              .filter(sub => sub.name.toLowerCase().includes(subjectSearch.toLowerCase()))
              .map((sub) => (
                <div key={sub.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition duration-200 flex flex-col justify-between select-none">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center bg-gradient-to-br ${sub.color} text-white`}>
                        <span className="material-symbols-rounded text-xl">{sub.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{sub.name}</h4>
                        <p className="text-[10px] text-slate-450 font-medium">{sub.chapters} Chapters Available</p>
                      </div>
                    </div>
                    <span className="bg-blue-50 text-blue-600 font-bold text-[9px] tracking-wider px-2 py-0.5 rounded-lg uppercase">ACTIVE</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Syllabus Completed</span>
                      <span>{sub.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full" 
                        style={{ width: `${sub.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg transition border border-slate-150 flex items-center justify-center space-x-1 cursor-pointer">
                      <span className="material-symbols-rounded text-xs">folder_open</span>
                      <span>PDF Notes</span>
                    </button>
                    <button className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition shadow-sm flex items-center justify-center space-x-1 cursor-pointer">
                      <span className="material-symbols-rounded text-xs">smart_display</span>
                      <span>Lectures</span>
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TESTS TAB */}
      {activeTab === 'tests' && (
        <div className="p-5 space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">Objective Tests</h3>
            <p className="text-xs text-slate-500">Take practice exams with automatic evaluation and performance tracking.</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 select-none">
            <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Total</p>
              <p className="text-sm font-black text-slate-800">{tests.length}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Completed</p>
              <p className="text-sm font-black text-emerald-600">{completedTests.length}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 text-center">
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Pending</p>
              <p className="text-sm font-black text-orange-505">{tests.length - completedTests.length}</p>
            </div>
          </div>

          <div className="space-y-4">
            {tests.map((test) => (
              <div 
                key={test.id} 
                className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition duration-200"
              >
                <div className="flex justify-between items-start select-none">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-800">{test.subject} Test</h4>
                    <div className="flex items-center space-x-2 pt-1 text-[10px] text-slate-450 font-medium">
                      <span className="flex items-center">
                        <span className="material-symbols-rounded text-xs mr-0.5 text-slate-450">help</span>
                        {test.questions} MCQs
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                      <span className="flex items-center">
                        <span className="material-symbols-rounded text-xs mr-0.5 text-slate-450">timer</span>
                        {test.timeLimit} mins
                      </span>
                    </div>
                  </div>
                  
                  {test.completed ? (
                    <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase flex items-center">
                      <span className="material-symbols-rounded text-[10px] mr-0.5">check_circle</span>
                      Done
                    </span>
                  ) : (
                    <span className="bg-orange-500/10 text-orange-600 border border-orange-500/10 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase flex items-center">
                      <span className="material-symbols-rounded text-[10px] mr-0.5">pending</span>
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  {test.completed ? (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-slate-405 font-semibold">Your Score:</span>
                      <span className="text-xs font-black text-slate-800">{test.score} / {test.marks}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-slate-405 font-semibold">Max Score:</span>
                      <span className="text-xs font-black text-slate-800">{test.marks} Marks</span>
                    </div>
                  )}

                  {test.completed ? (
                    <button 
                      disabled
                      className="px-3 py-2 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-lg cursor-not-allowed flex items-center space-x-1"
                    >
                      <span className="material-symbols-rounded text-xs">task_alt</span>
                      <span>Completed</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => onStartQuiz(test)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg shadow-sm transition active:scale-95 flex items-center space-x-1 cursor-pointer"
                    >
                      <span className="material-symbols-rounded text-xs">arrow_right_alt</span>
                      <span>Start Exam</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="p-5 space-y-6 animate-fade-in">
          
          {/* Header block */}
          <div className="flex flex-col items-center text-center space-y-3 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative">
            <button 
              onClick={() => navigate('/profile/edit')}
              className="absolute right-4 top-4 w-9 h-9 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-full flex items-center justify-center border border-slate-200/50 transition duration-200 active:scale-90 cursor-pointer animate-fade-in"
              title="Edit Profile"
            >
              <span className="material-symbols-rounded text-base">edit</span>
            </button>

            <div className="relative">
              <img
                src={profile.profilePic}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
              <span className="absolute bottom-0 right-1 w-6 h-6 bg-emerald-500 text-white text-[10px] rounded-full border-2 border-white flex items-center justify-center font-bold" title="Online Status">
                ✓
              </span>
            </div>
            
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-800">{profile.name}</h3>
              <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">{profile.className}</p>
              <p className="text-[10px] text-slate-400 font-medium pt-1">Village: <span className="text-slate-600 font-semibold">{profile.village}</span></p>
            </div>
          </div>

          {/* Academic Stats Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Record</h4>
            <div className="grid grid-cols-3 gap-3 select-none">
              <div className="bg-white p-3.5 rounded-[20px] shadow-sm border border-slate-100 text-center space-y-1">
                <span className="material-symbols-rounded text-emerald-600 text-xl block">assignment_turned_in</span>
                <span className="text-xs font-black text-slate-800 block">{completedTests.length}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Tests Took</span>
              </div>
              <div className="bg-white p-3.5 rounded-[20px] shadow-sm border border-slate-100 text-center space-y-1">
                <span className="material-symbols-rounded text-blue-600 text-xl block">emoji_events</span>
                <span className="text-xs font-black text-slate-800 block">{averageScore}%</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Avg Score</span>
              </div>
              <div className="bg-white p-3.5 rounded-[20px] shadow-sm border border-slate-100 text-center space-y-1">
                <span className="material-symbols-rounded text-cyan-600 text-xl block">incomplete_circle</span>
                <span className="text-xs font-black text-slate-800 block">71%</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Completed</span>
              </div>
            </div>
          </div>

          {/* Achievements Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Earned Badges</h4>
            <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm select-none">
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: "Punctual", desc: "First form done", icon: "schedule", active: true, color: "bg-blue-100 text-blue-600 border-blue-200" },
                  { label: "Topper", desc: "Test Score >90%", icon: "workspace_premium", active: averageScore >= 90, color: averageScore >= 90 ? "bg-amber-100 text-amber-600 border-amber-250" : "bg-slate-100 text-slate-350 border-transparent opacity-40" },
                  { label: "Explorer", desc: "Browse notes", icon: "explore", active: true, color: "bg-cyan-100 text-cyan-600 border-cyan-200" },
                  { label: "Consistent", desc: "5+ Tests taken", icon: "local_fire_department", active: completedTests.length >= 5, color: completedTests.length >= 5 ? "bg-orange-100 text-orange-600 border-orange-200" : "bg-slate-100 text-slate-350 border-transparent opacity-40" }
                ].map((badge, idx) => (
                  <div key={idx} className="space-y-1 flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center ${badge.color}`} title={badge.desc}>
                      <span className="material-symbols-rounded text-lg">{badge.icon}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 leading-tight block">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log Out button */}
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-red-50 hover:bg-red-105/50 text-red-650 font-semibold rounded-xl border border-red-200/40 transition duration-200 text-xs flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-rounded text-sm">logout</span>
            <span>Log Out from Portal</span>
          </button>
        </div>
      )}

    </div>
  );
}
