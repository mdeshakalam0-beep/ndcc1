import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LiveClassItem, StudentProfile } from '../types';
import { getYoutubeEmbedUrl } from '../utils/youtube';

interface LiveClassesProps {
  liveClasses: LiveClassItem[];
  profile: StudentProfile;
}

export default function LiveClasses({ liveClasses, profile }: LiveClassesProps) {
  const navigate = useNavigate();
  const [activeStream, setActiveStream] = useState<LiveClassItem | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Resume last or first stream on mount
  useEffect(() => {
    if (liveClasses.length > 0) {
      setActiveStream(liveClasses[0]);
    }
  }, [liveClasses]);

  const selectActiveStream = (stream: LiveClassItem) => {
    setActiveStream(stream);
    setIframeLoading(true);

    const container = document.getElementById("live-player-container");
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to extract YouTube ID for high quality thumbnails
  const getYoutubeVideoId = (url?: string): string => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.includes("youtu.be/")) {
      return trimmed.split("youtu.be/")[1].split("?")[0].trim();
    }
    if (trimmed.includes("v=")) {
      return trimmed.split("v=")[1].split("&")[0].trim();
    }
    if (trimmed.includes("embed/")) {
      return trimmed.split("embed/")[1].split("?")[0].trim();
    }
    return "";
  };

  const handleFullscreen = () => {
    const elem = document.getElementById('live-player-iframe');
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    }
  };

  const embedUrl = activeStream ? getYoutubeEmbedUrl(activeStream.youtubeEmbedUrl || activeStream.youtubeUrl) : "";
  const isLive = activeStream?.liveStatus === 'live';

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 text-slate-800 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-20 overflow-hidden select-none">
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 shrink-0 bg-white shadow-sm">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        
        {/* Branded Header */}
        <div className="flex items-center space-x-2">
          <div className="bg-red-600 p-1.5 rounded-lg flex items-center justify-center animate-pulse">
            <span className="material-symbols-rounded text-white text-sm">podcasts</span>
          </div>
          <div className="text-left">
            <h4 className="text-[10px] font-black tracking-widest text-slate-900 uppercase leading-none">New Direction</h4>
            <span className="text-[8px] font-bold text-slate-455 tracking-wider">Live Broadcast Gate</span>
          </div>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        
        {liveClasses.length > 0 && activeStream ? (
          <div className="space-y-4">
            
            {/* Player Container */}
            <div id="live-player-container" className="px-5 pt-3 space-y-3">
              
              {/* Above Player Info */}
              <div className="flex justify-between items-center select-none pb-1">
                <div className="space-y-0.5">
                  <span className="bg-red-50 text-red-600 border border-red-105 font-extrabold text-[8px] px-2.5 py-0.5 rounded uppercase tracking-widest">
                    Live Broadcast
                  </span>
                  <p className="text-[9px] text-slate-505 font-semibold pt-0.5">
                    Class: <span className="text-slate-800 font-bold">{profile.className || "Coaching Student"}</span>
                  </p>
                </div>

                <div className="text-right">
                  <h4 className="text-[10px] font-black text-slate-850">Senior Instructor</h4>
                  <span className="text-[8px] font-bold text-slate-400">Live Streaming</span>
                </div>
              </div>

              {/* Player Frame aspect ratio 16:9 */}
              <div className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-slate-900 border border-slate-200 shadow-lg relative group">
                {embedUrl ? (
                  <>
                    <iframe
                      id="live-player-iframe"
                      src={embedUrl}
                      title={activeStream.title}
                      className="absolute inset-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => setIframeLoading(false)}
                    ></iframe>

                    {/* Branding overlay mask to cover YouTube watermark/logo */}
                    {!iframeLoading && (
                      <div className="absolute bottom-12 right-3 z-10 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-[6px] text-[8px] font-black text-red-500 select-none pointer-events-none border border-white/10 flex items-center space-x-1 animate-fade-in shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span>NDCC LIVE</span>
                      </div>
                    )}
                    
                    {/* Dark loading state skeleton */}
                    {iframeLoading && (
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center space-y-3 select-none text-white">
                        <div className="w-8 h-8 border-3 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold text-slate-450 tracking-wider">Connecting Live Feed...</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-2 select-none text-white">
                    <span className="material-symbols-rounded text-slate-600 text-4xl">error</span>
                    <span className="text-xs font-semibold text-slate-400">Video is currently unavailable.</span>
                  </div>
                )}
              </div>

              {/* Status Row */}
              <div className="flex justify-between items-center select-none pt-1">
                {isLive ? (
                  <span className="bg-red-50 text-red-600 border border-red-100 font-bold text-[9px] px-3 py-1 rounded-full flex items-center tracking-wider uppercase animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-550 mr-1.5 animate-ping"></span>
                    LIVE NOW
                  </span>
                ) : activeStream.liveStatus === 'upcoming' ? (
                  <span className="bg-blue-50 text-blue-600 border border-blue-100 font-bold text-[9px] px-3 py-1 rounded-full flex items-center tracking-wider uppercase">
                    UPCOMING
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-500 border border-slate-200 font-bold text-[9px] px-3 py-1 rounded-full flex items-center tracking-wider uppercase">
                    FINISHED
                  </span>
                )}

                <button 
                  onClick={handleFullscreen}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 px-3 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase flex items-center space-x-1.5 transition cursor-pointer border border-slate-200/50"
                >
                  <span className="material-symbols-rounded text-xs font-bold">fullscreen</span>
                  <span>Full Screen</span>
                </button>
              </div>

            </div>

            {/* Title & Description Below Player */}
            <div className="px-5 space-y-2 select-none border-b border-slate-100 pb-5">
              <h1 className="text-base font-extrabold text-slate-850 leading-tight">
                {activeStream.title}
              </h1>

              <div className="flex flex-wrap gap-2 text-[9px] font-bold">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{activeStream.startTime}</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">YouTube Broadcast</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1.5 font-medium">
                {activeStream.description || "Tune in live to follow this interactive coaching stream. Keep your notebook and learning materials ready."}
              </p>
            </div>

            {/* Upcoming Stream Slider - Netflix Style */}
            <div className="space-y-3 pl-5 pb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Other streams</h3>
              
              <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-3 pr-5">
                {liveClasses
                  .filter(v => v.id !== activeStream.id)
                  .map((item) => {
                    const videoId = getYoutubeVideoId(item.youtubeUrl);
                    const streamIsLive = item.liveStatus === 'live';
                    
                    return (
                      <button 
                        key={item.id}
                        onClick={() => selectActiveStream(item)}
                        className="flex-shrink-0 w-36 text-left space-y-1.5 group select-none cursor-pointer focus:outline-none"
                      >
                        {/* Netflix-style Thumbnail */}
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-100 shadow group-hover:border-red-500 transition duration-200">
                          {videoId ? (
                            <img 
                              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <span className="material-symbols-rounded text-slate-400">podcasts</span>
                            </div>
                          )}

                          {/* Live overlay badge */}
                          {streamIsLive && (
                            <span className="absolute top-1 right-1 bg-red-600 text-white font-extrabold text-[7px] px-1.5 py-0.5 rounded flex items-center tracking-wider animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>

                        {/* Title block */}
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-extrabold text-red-550 uppercase tracking-widest">Schedule</span>
                          <h4 className="text-[10px] font-bold text-slate-700 leading-tight group-hover:text-red-550 transition line-clamp-2">
                            {item.title}
                          </h4>
                          <span className="text-[8px] font-semibold text-slate-450 leading-none truncate block">{item.startTime}</span>
                        </div>
                      </button>
                    );
                  })}
                
                {liveClasses.filter(v => v.id !== activeStream.id).length === 0 && (
                  <div className="w-full text-center py-6 pr-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    No further live classes.
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center space-y-4 select-none px-6">
            <span className="material-symbols-rounded text-slate-350 text-5xl">cast_connected</span>
            <div>
              <h4 className="text-sm font-bold text-slate-700">No live classes scheduled.</h4>
              <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto mt-1">
                There are no active live stream broadcasts scheduled for your batch. Check notifications for announcements.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
