import { useNavigate } from 'react-router-dom';
import type { HomeworkItem } from '../types';

interface HomeworkProps {
  homework: HomeworkItem[];
}

export default function Homework({ homework }: HomeworkProps) {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-20 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 select-none">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded-full hover:bg-slate-200 text-slate-650 transition flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        <h3 className="text-sm font-bold text-slate-900">My Homework</h3>
        <div className="w-8"></div>
      </div>

      {/* Homework List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 py-4">
        {homework.length > 0 ? (
          homework.map((item) => (
            <div 
              key={item.id}
              className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="inline-block bg-blue-50 text-blue-600 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.subject}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight pt-1">
                    {item.title}
                  </h4>
                </div>
                
                <div className="flex items-center space-x-1 text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-rounded text-xs">alarm</span>
                  <span>Due: {item.deadline}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                {item.description || "No description provided."}
              </p>

              {item.attachment && (
                <div className="pt-2">
                  <a 
                    href={item.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg transition"
                  >
                    <span className="material-symbols-rounded text-xs">description</span>
                    <span>Download Attachment</span>
                  </a>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 select-none">
            <span className="material-symbols-rounded text-slate-300 text-5xl">edit_document</span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">All Caught Up!</h4>
              <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto mt-1">
                No pending homework assignments are registered for your class batch.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
