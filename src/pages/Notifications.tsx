import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '../types';

interface NotificationsProps {
  notifications: NotificationItem[];
  onToggleRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function Notifications({
  notifications,
  onToggleRead,
  onMarkAllRead
}: NotificationsProps) {
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 p-5 z-20 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 select-none">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded-full hover:bg-slate-200 text-slate-650 transition flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h3 className="text-sm font-bold text-slate-900">Coaching Announcements</h3>
        {unreadCount > 0 ? (
          <button 
            onClick={onMarkAllRead}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase cursor-pointer"
          >
            Read All
          </button>
        ) : (
          <div className="w-8"></div>
        )}
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 py-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => onToggleRead(notif.id)}
              className={`p-4 rounded-[20px] border transition duration-200 flex items-start space-x-3 cursor-pointer ${
                notif.read 
                  ? 'bg-white border-slate-100 hover:bg-slate-50' 
                  : 'bg-blue-600/[0.03] border-blue-600/10 shadow-sm hover:bg-blue-600/[0.06]'
              }`}
            >
              <div className="relative shrink-0 mt-0.5 select-none">
                <span className={`material-symbols-rounded text-sm p-2 rounded-xl flex items-center justify-center ${
                  notif.category === 'test' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : notif.category === 'profile' 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {notif.category === 'test' ? 'quiz' : notif.category === 'profile' ? 'person' : 'campaign'}
                </span>
                {!notif.read && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-slate-50"></span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className={`text-xs font-bold truncate ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h4>
                  <span className="text-[9px] text-slate-400 font-semibold shrink-0 ml-2 select-none">{notif.time}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{notif.description}</p>
                <div className="pt-1 flex justify-end select-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleRead(notif.id);
                    }}
                    className="text-[9px] font-semibold text-slate-400 hover:text-blue-600 transition uppercase cursor-pointer"
                  >
                    {notif.read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 select-none">
            <span className="material-symbols-rounded text-slate-305 text-4xl">notifications_off</span>
            <p className="text-xs text-slate-450 font-medium">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
