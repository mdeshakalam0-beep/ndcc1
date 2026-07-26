import { useNavigate } from 'react-router-dom';
import type { LiveClassItem } from '../types';
import { getYoutubeEmbedUrl } from '../utils/youtube';

interface LiveClassesProps {
  liveClasses: LiveClassItem[];
}

export default function LiveClasses({ liveClasses }: LiveClassesProps) {
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
        <h3 className="text-sm font-bold text-slate-900">Live Lectures</h3>
        <div className="w-8"></div>
      </div>

      {/* Live Classes list */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 py-4">
        {liveClasses.length > 0 ? (
          liveClasses.map((item) => {
            const embedUrl = getYoutubeEmbedUrl(item.youtubeEmbedUrl || item.youtubeUrl);
            const isLive = item.liveStatus === 'live';
            
            return (
              <div 
                key={item.id}
                className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col space-y-4 hover:shadow-md transition duration-200"
              >
                {/* Embedded Video Player */}
                {embedUrl ? (
                  <div className="relative w-full aspect-video rounded-[18px] overflow-hidden bg-black shadow-inner">
                    <iframe
                      src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1`}
                      title={item.title}
                      className="absolute inset-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-[18px] bg-slate-100 flex flex-col items-center justify-center text-center space-y-2 select-none border border-dashed border-slate-200">
                    <span className="material-symbols-rounded text-slate-400 text-3xl">smart_display</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Video stream link unavailable</span>
                  </div>
                )}

                {/* Stream details */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start select-none">
                    <div className="space-y-1 max-w-[70%]">
                      <h4 className="text-sm font-bold text-slate-800 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-semibold flex items-center">
                        <span className="material-symbols-rounded text-xs mr-0.5">schedule</span>
                        <span>Start: {item.startTime}</span>
                      </p>
                    </div>

                    {isLive ? (
                      <span className="bg-red-500/10 text-red-650 border border-red-500/10 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase flex items-center tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
                        LIVE NOW
                      </span>
                    ) : item.liveStatus === 'upcoming' ? (
                      <span className="bg-blue-500/10 text-blue-600 border border-blue-500/10 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase flex items-center tracking-wider">
                        UPCOMING
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 border border-slate-200 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase flex items-center tracking-wider">
                        FINISHED
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {item.description || "No lecture description configured."}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 select-none">
            <span className="material-symbols-rounded text-slate-300 text-5xl">cast_connected</span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">No Live Classes</h4>
              <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto mt-1">
                There are no active or scheduled live streaming classes for your batch today.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
