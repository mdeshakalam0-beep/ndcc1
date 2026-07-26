import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecordedClassItem } from '../types';
import { getYoutubeEmbedUrl } from '../utils/youtube';

interface RecordedClassesProps {
  recordedClasses: RecordedClassItem[];
}

export default function RecordedClasses({ recordedClasses }: RecordedClassesProps) {
  const navigate = useNavigate();
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  const [activeVideo, setActiveVideo] = useState<RecordedClassItem | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [progressUpdateKey, setProgressUpdateKey] = useState(0);

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

  // Resume last watched lecture on mount
  useEffect(() => {
    if (recordedClasses.length > 0) {
      const savedId = localStorage.getItem("ndcc_last_watched_recorded_id");
      const matched = recordedClasses.find(v => v.id === savedId);
      if (matched) {
        setActiveVideo(matched);
      } else {
        setActiveVideo(recordedClasses[0]);
      }
    }
  }, [recordedClasses]);

  // Save current active video to localStorage
  const selectActiveVideo = (video: RecordedClassItem) => {
    setActiveVideo(video);
    setIframeLoading(true);
    localStorage.setItem("ndcc_last_watched_recorded_id", video.id);
    
    // Smooth scroll to top of details area
    const container = document.getElementById("ott-player-container");
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Load YouTube Player API and attach listeners
  useEffect(() => {
    if (!activeVideo) return;

    // Remove any stale trackers
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const loadYoutubeApi = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        (window as any).onYouTubeIframeAPIReady = () => {
          initializePlayer();
        };
      } else {
        initializePlayer();
      }
    };

    const initializePlayer = () => {
      // Small timeout to guarantee iframe element is fully rendered in DOM
      setTimeout(() => {
        try {
          playerRef.current = new (window as any).YT.Player('youtube-player', {
            events: {
              onStateChange: (event: any) => {
                // 1 means PLAYING in YT API
                if (event.data === 1) {
                  startTrackingProgress();
                } else {
                  stopTrackingProgress();
                }
              }
            }
          });
        } catch (err) {
          console.warn("⚠️ Failed to initialize YT Player API tracking:", err);
        }
      }, 500);
    };

    const startTrackingProgress = () => {
      progressIntervalRef.current = setInterval(() => {
        const player = playerRef.current;
        if (player && typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          
          if (duration > 0) {
            const percent = (currentTime / duration) * 100;
            localStorage.setItem(`ndcc_lecture_progress_${activeVideo.id}`, JSON.stringify({
              time: currentTime,
              duration: duration,
              percent: percent
            }));
            // Reactive re-render trigger
            setProgressUpdateKey(prev => prev + 1);
          }
        }
      }, 2000);
    };

    const stopTrackingProgress = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };

    loadYoutubeApi();

    return () => {
      stopTrackingProgress();
    };
  }, [activeVideo]);

  const handleFullscreen = () => {
    const elem = document.getElementById('youtube-player');
    if (elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) { /* Safari */
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) { /* IE11 */
        (elem as any).msRequestFullscreen();
      }
    }
  };

  // Helper to read cached lecture progress from localStorage
  const getLectureProgress = (id: string) => {
    const data = localStorage.getItem(`ndcc_lecture_progress_${id}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  };

  const activeEmbedUrl = activeVideo ? getYoutubeEmbedUrl(activeVideo.youtubeEmbedUrl || activeVideo.youtubeUrl) : "";

  
  // Calculate progress for active lecture
  const activeProgress = activeVideo ? getLectureProgress(activeVideo.id) : null;
  const isActiveCompleted = activeProgress && activeProgress.percent > 90;

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-950 text-white pt-[calc(1.25rem+env(safe-area-inset-top))] pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-20 overflow-hidden select-none">
      
      {/* Dynamic Progress Key Refresher */}
      <span className="hidden" data-key={progressUpdateKey}></span>

      {/* Header bar */}
      <div className="flex items-center justify-between px-5 pb-3 border-b border-white/5 shrink-0">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        
        {/* Branded Title Row */}
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1 rounded-lg flex items-center justify-center">
            <span className="material-symbols-rounded text-white text-base">play_circle</span>
          </div>
          <div className="text-left">
            <h4 className="text-[10px] font-black tracking-widest text-blue-500 uppercase leading-none">New Direction</h4>
            <span className="text-[8px] font-bold text-slate-450 tracking-wider">OTT Academy Player</span>
          </div>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        
        {recordedClasses.length > 0 && activeVideo ? (
          <div className="space-y-4">
            
            {/* Player Canvas Area */}
            <div id="ott-player-container" className="px-5 pt-3 space-y-3">
              
              {/* Branded Meta above player */}
              <div className="flex justify-between items-center select-none pb-1.5">
                <div className="space-y-0.5">
                  <span className="bg-blue-500/10 text-blue-400 font-extrabold text-[8px] px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                    {activeVideo.subject}
                  </span>
                  <p className="text-[9px] text-slate-400 font-semibold pt-0.5">
                    Batch: <span className="text-white font-bold">{activeVideo.classId ? activeVideo.classId.toUpperCase() : "Public"}</span>
                  </p>
                </div>
                
                <div className="text-right">
                  <h4 className="text-[10px] font-black text-white">NDCC Faculty</h4>
                  <span className="text-[8px] font-bold text-slate-500">Expert Educator</span>
                </div>
              </div>

              {/* Video aspect frame */}
              <div className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl shadow-blue-500/5 group">
                {activeEmbedUrl ? (
                  <>
                    <iframe
                      id="youtube-player"
                      src={`${activeEmbedUrl}?enablejsapi=1&autoplay=0&rel=0&modestbranding=1&origin=${window.location.origin}`}
                      title={activeVideo.title}
                      className="absolute inset-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => setIframeLoading(false)}
                    ></iframe>
                    
                    {/* Dark loading state skeleton */}
                    {iframeLoading && (
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center space-y-3 select-none">
                        <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">Configuring Video Stream...</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-2 select-none">
                    <span className="material-symbols-rounded text-slate-650 text-4xl">error</span>
                    <span className="text-xs font-semibold text-slate-400">Video is currently unavailable.</span>
                  </div>
                )}
              </div>

              {/* Player Helper Actions */}
              <div className="flex justify-between items-center select-none pt-1">
                {isActiveCompleted ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[9px] px-3 py-1 rounded-full flex items-center tracking-wider uppercase">
                    <span className="material-symbols-rounded text-[10px] mr-1">check_circle</span>
                    Completed ✓
                  </span>
                ) : activeProgress ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${activeProgress.percent}%` }}></div>
                    </div>
                    <span className="text-[8px] font-bold text-slate-400">Resuming ({Math.round(activeProgress.percent)}%)</span>
                  </div>
                ) : (
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Unwatched</span>
                )}

                <button 
                  onClick={handleFullscreen}
                  className="bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white px-3 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <span className="material-symbols-rounded text-xs">fullscreen</span>
                  <span>Full Screen</span>
                </button>
              </div>

            </div>

            {/* Video metadata description */}
            <div className="px-5 space-y-2 select-none border-b border-white/5 pb-5">
              <h1 className="text-base font-extrabold text-white leading-tight">
                {activeVideo.title}
              </h1>

              <div className="flex flex-wrap gap-2 text-[9px] font-bold text-slate-400">
                <span className="bg-white/5 px-2 py-0.5 rounded text-white">{activeVideo.subject}</span>
                <span className="bg-white/5 px-2 py-0.5 rounded">Senior Faculty</span>
                <span className="bg-white/5 px-2 py-0.5 rounded">45 mins</span>
                <span className="bg-white/5 px-2 py-0.5 rounded">Recent Upload</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-1.5 font-medium">
                {activeVideo.description || "In this session, we go over the core concepts and chapters for this subject's batch. Solve the workbook worksheets assigned to this lecture."}
              </p>
            </div>

            {/* Netflix-style Horizontal Carousel - UP NEXT */}
            <div className="space-y-3 pl-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Up Next</h3>
              
              <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-3 pr-5">
                {recordedClasses
                  .filter(v => v.id !== activeVideo.id)
                  .map((item) => {
                    const videoId = getYoutubeVideoId(item.youtubeUrl);
                    const progress = getLectureProgress(item.id);
                    const isCompleted = progress && progress.percent > 90;
                    
                    return (
                      <button 
                        key={item.id}
                        onClick={() => selectActiveVideo(item)}
                        className="flex-shrink-0 w-36 text-left space-y-1.5 group select-none cursor-pointer focus:outline-none"
                      >
                        {/* Netflix-style Thumbnail */}
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-white/5 shadow group-hover:border-blue-500 transition duration-200">
                          {videoId ? (
                            <img 
                              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                              <span className="material-symbols-rounded text-slate-650">play_circle</span>
                            </div>
                          )}

                          {/* Completed status tag */}
                          {isCompleted && (
                            <span className="absolute top-1 right-1 bg-emerald-600 text-white font-extrabold text-[7px] px-1.5 py-0.5 rounded flex items-center tracking-wider">
                              ✓ DONE
                            </span>
                          )}

                          {/* Mini progress trackbar */}
                          {progress && !isCompleted && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                              <div className="bg-blue-500 h-full" style={{ width: `${progress.percent}%` }}></div>
                            </div>
                          )}
                        </div>

                        {/* Text meta */}
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-extrabold text-blue-500 uppercase tracking-widest">{item.subject}</span>
                          <h4 className="text-[10px] font-bold text-slate-200 leading-tight group-hover:text-white transition line-clamp-2">
                            {item.title}
                          </h4>
                        </div>
                      </button>
                    );
                  })}
                
                {recordedClasses.filter(v => v.id !== activeVideo.id).length === 0 && (
                  <div className="w-full text-center py-6 pr-5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    No further classes available.
                  </div>
                )}
              </div>
            </div>

            {/* Continue Learning - Subjects list */}
            <div className="space-y-3 pl-5 pb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Continue Learning</h3>
              
              <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 pr-5">
                {recordedClasses.map((item) => (
                  <button 
                    key={`continue-${item.id}`}
                    onClick={() => selectActiveVideo(item)}
                    className="flex-shrink-0 bg-white/5 border border-white/5 hover:border-white/10 p-3 rounded-2xl flex items-center space-x-3 w-48 text-left transition active:scale-95 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <span className="material-symbols-rounded text-sm">menu_book</span>
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <h4 className="text-[10px] font-bold text-white leading-none uppercase truncate">{item.subject}</h4>
                      <p className="text-[8px] font-semibold text-slate-450 leading-tight line-clamp-1">{item.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center space-y-4 select-none px-6">
            <span className="material-symbols-rounded text-slate-700 text-5xl">video_library</span>
            <div>
              <h4 className="text-sm font-bold text-slate-400">No recorded classes available.</h4>
              <p className="text-[10px] text-slate-550 max-w-[240px] mx-auto mt-1">
                Your batch has no video recordings registered in Firestore. Check back later!
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
