import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecordedClassItem, StudentProfile } from '../types';
import { getYoutubeEmbedUrl } from '../utils/youtube';

interface RecordedClassesProps {
  recordedClasses: RecordedClassItem[];
  profile: StudentProfile;
}

export default function RecordedClasses({ recordedClasses, profile }: RecordedClassesProps) {
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
      setTimeout(() => {
        try {
          playerRef.current = new (window as any).YT.Player('youtube-player', {
            events: {
              onStateChange: (event: any) => {
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
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    }
  };

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
  const activeProgress = activeVideo ? getLectureProgress(activeVideo.id) : null;
  const isActiveCompleted = activeProgress && activeProgress.percent > 90;

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 text-slate-800 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-20 overflow-hidden select-none">
      
      <span className="hidden" data-key={progressUpdateKey}></span>

      {/* Header bar */}
      <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 shrink-0 bg-white shadow-sm select-none">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        
        {/* Branded Title Row */}
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center">
            <span className="material-symbols-rounded text-white text-sm">play_circle</span>
          </div>
          <div className="text-left">
            <h4 className="text-[10px] font-black tracking-widest text-slate-900 uppercase leading-none">New Direction</h4>
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
              <div className="flex justify-between items-center select-none pb-1">
                <div className="space-y-0.5">
                  {activeVideo.subject && (
                    <span className="bg-blue-50 text-blue-600 font-extrabold text-[8px] px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest">
                      {activeVideo.subject}
                    </span>
                  )}
                  <p className="text-[9px] text-slate-500 font-semibold pt-0.5">
                    Class: <span className="text-slate-800 font-bold">{profile.className || "Coaching Student"}</span>
                  </p>
                </div>
                
                <div className="text-right">
                  <h4 className="text-[10px] font-black text-slate-800">NDCC Faculty</h4>
                  <span className="text-[8px] font-bold text-slate-400">Expert Instructor</span>
                </div>
              </div>

              {/* Video aspect frame */}
              <div className="relative w-full aspect-video rounded-[16px] overflow-hidden bg-slate-900 border border-slate-200 shadow-lg relative group">
                {activeEmbedUrl ? (
                  <>
                    <iframe
                      id="youtube-player"
                      src={activeEmbedUrl}
                      title={activeVideo.title}
                      className="absolute inset-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => setIframeLoading(false)}
                    ></iframe>
                    
                    {/* Branding overlay mask to cover YouTube watermark/logo */}
                    {!iframeLoading && (
                      <div className="absolute bottom-12 right-3 z-10 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-[6px] text-[8px] font-black text-blue-400 select-none pointer-events-none border border-white/10 flex items-center space-x-1 animate-fade-in shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <span>NDCC ACADEMY</span>
                      </div>
                    )}

                    {/* Dark loading state skeleton */}
                    {iframeLoading && (
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center space-y-3 select-none text-white">
                        <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold text-slate-450 tracking-wider">Configuring Video Stream...</span>
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

              {/* Player Helper Actions */}
              <div className="flex justify-between items-center select-none pt-1">
                {isActiveCompleted ? (
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[9px] px-3 py-1 rounded-full flex items-center tracking-wider uppercase">
                    <span className="material-symbols-rounded text-[10px] mr-1">check_circle</span>
                    Completed ✓
                  </span>
                ) : activeProgress ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${activeProgress.percent}%` }}></div>
                    </div>
                    <span className="text-[8px] font-bold text-slate-500">Resuming ({Math.round(activeProgress.percent)}%)</span>
                  </div>
                ) : (
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Unwatched</span>
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

            {/* Video metadata description */}
            <div className="px-5 space-y-2 select-none border-b border-slate-100 pb-5">
              <h1 className="text-base font-extrabold text-slate-850 leading-tight">
                {activeVideo.title}
              </h1>

              <div className="flex flex-wrap gap-2 text-[9px] font-bold">
                {activeVideo.subject && (
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{activeVideo.subject}</span>
                )}
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Senior Faculty</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">45 mins</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Recent Upload</span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1.5 font-medium">
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
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-100 shadow group-hover:border-blue-500 transition duration-200">
                          {videoId ? (
                            <img 
                              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <span className="material-symbols-rounded text-slate-400">play_circle</span>
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
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-250">
                              <div className="bg-blue-600 h-full" style={{ width: `${progress.percent}%` }}></div>
                            </div>
                          )}
                        </div>

                        {/* Text meta */}
                        <div className="space-y-0.5">
                          {item.subject && (
                            <span className="text-[8px] font-extrabold text-blue-600 uppercase tracking-widest block">{item.subject}</span>
                          )}
                          <h4 className="text-[10px] font-bold text-slate-700 leading-tight group-hover:text-blue-600 transition line-clamp-2">
                            {item.title}
                          </h4>
                        </div>
                      </button>
                    );
                  })}
                
                {recordedClasses.filter(v => v.id !== activeVideo.id).length === 0 && (
                  <div className="w-full text-center py-6 pr-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
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
                    className="flex-shrink-0 bg-white border border-slate-100 hover:border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3 w-48 text-left transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <span className="material-symbols-rounded text-sm">menu_book</span>
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      {item.subject && (
                        <h4 className="text-[10px] font-bold text-slate-800 leading-none uppercase truncate">{item.subject}</h4>
                      )}
                      <p className="text-[8px] font-semibold text-slate-450 leading-tight line-clamp-1">{item.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center space-y-4 select-none px-6">
            <span className="material-symbols-rounded text-slate-300 text-5xl">video_library</span>
            <div>
              <h4 className="text-sm font-bold text-slate-700">No recorded classes available.</h4>
              <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto mt-1">
                Your batch has no video recordings registered in Firestore. Check back later!
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
