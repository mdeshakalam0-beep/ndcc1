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
  const [selectedSubject, setSelectedSubject] = useState("All");

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
    if (trimmed.includes("/live/")) {
      return trimmed.split("/live/")[1].split("?")[0].trim();
    }
    if (!trimmed.includes("/") && !trimmed.includes(".")) {
      return trimmed;
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

  if (activeVideo) {
    console.log("🎥 [YouTube Logger - Recorded]");
    console.log("- Original Firestore URL:", activeVideo.youtubeEmbedUrl || activeVideo.youtubeUrl);
    console.log("- Extracted Video ID:", getYoutubeVideoId(activeVideo.youtubeUrl));
    console.log("- Generated embed URL:", activeEmbedUrl);
    console.log("- Final iframe src:", activeEmbedUrl);
  }

  // Extract unique subjects for chips filtering
  const subjectsList = ["All", ...Array.from(new Set(recordedClasses.map(v => v.subject).filter(Boolean)))];

  // Filter video carousels
  const filteredVideos = recordedClasses.filter(v => {
    if (selectedSubject === "All") return true;
    return v.subject === selectedSubject;
  });

  // Calculate learning progress stats
  const totalLectures = recordedClasses.length;
  const completedLectures = recordedClasses.filter(v => {
    const progress = getLectureProgress(v.id);
    return progress && progress.percent > 90;
  }).length;

  const overallCompletionPercentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 text-slate-800 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-20 overflow-hidden select-none">
      
      <span className="hidden" data-key={progressUpdateKey}></span>

      {/* Header bar */}
      <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 shrink-0 bg-white shadow-sm select-none">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-850 transition flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-rounded">arrow_back</span>
        </button>
        
        {/* Branded Title Row */}
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-650 p-2 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="material-symbols-rounded text-white text-base font-bold">play_circle</span>
          </div>
          <div className="text-left">
            <h4 className="text-[10px] font-black tracking-widest text-slate-900 uppercase leading-none">New Direction</h4>
            <span className="text-[8px] font-bold text-slate-455 tracking-wider">OTT Learning Center</span>
          </div>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">
        
        {recordedClasses.length > 0 && activeVideo ? (
          <div className="space-y-5">
            
            {/* Player Canvas Area */}
            <div id="ott-player-container" className="px-5 pt-3 space-y-3.5">
              
              {/* Branded Meta above player */}
              <div className="flex justify-between items-center select-none">
                <div className="space-y-0.5">
                  {activeVideo.subject && (
                    <span className="bg-blue-50 text-blue-600 font-extrabold text-[8px] px-2.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest shadow-sm">
                      {activeVideo.subject}
                    </span>
                  )}
                  <p className="text-[9px] text-slate-500 font-semibold pt-0.5">
                    Class: <span className="text-slate-800 font-bold">{profile.className || "Coaching Student"}</span>
                  </p>
                </div>
                
                {/* Faculty Card */}
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <h4 className="text-[10px] font-black text-slate-850 leading-none">NDCC Faculty</h4>
                    <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-wider">Expert Teacher</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=60&h=60" alt="Teacher profile" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Video aspect frame */}
              <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-slate-900 border border-slate-200/60 shadow-xl relative group">
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
                    <span className="material-symbols-rounded text-slate-655 text-4xl">error</span>
                    <span className="text-xs font-semibold text-slate-400">Video is currently unavailable.</span>
                  </div>
                )}
              </div>

              {/* Player Helper Actions */}
              <div className="flex justify-between items-center select-none pt-0.5">
                {isActiveCompleted ? (
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[9px] px-3.5 py-1 rounded-full flex items-center tracking-wider uppercase shadow-sm">
                    <span className="material-symbols-rounded text-[10px] mr-1.5">check_circle</span>
                    Completed ✓
                  </span>
                ) : activeProgress ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${activeProgress.percent}%` }}></div>
                    </div>
                    <span className="text-[8px] font-extrabold text-slate-500 uppercase">Resuming ({Math.round(activeProgress.percent)}%)</span>
                  </div>
                ) : (
                  <span className="bg-slate-100 text-slate-455 border border-slate-200/50 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Unwatched</span>
                )}

                <button 
                  onClick={handleFullscreen}
                  className="bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 px-3.5 py-1.5 rounded-xl text-[9px] font-extrabold tracking-wider uppercase flex items-center space-x-1.5 transition cursor-pointer border border-slate-200 shadow-sm active:scale-95"
                >
                  <span className="material-symbols-rounded text-xs font-black">fullscreen</span>
                  <span>Full Screen</span>
                </button>
              </div>

            </div>

            {/* Video metadata description */}
            <div className="px-5 space-y-3.5 select-none">
              <div className="space-y-1.5">
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  {activeVideo.title}
                </h1>

                <div className="flex flex-wrap gap-2 text-[9px] font-bold">
                  {activeVideo.subject && (
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{activeVideo.subject}</span>
                  )}
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center">
                    <span className="material-symbols-rounded text-[10px] mr-1">person</span>
                    Senior Faculty
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center">
                    <span className="material-symbols-rounded text-[10px] mr-1">schedule</span>
                    45 mins
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded flex items-center">
                    <span className="material-symbols-rounded text-[10px] mr-1">event_note</span>
                    Recent Upload
                  </span>
                </div>
              </div>

              {/* Study Materials & Worksheet module */}
              <div className="bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-rounded text-base font-bold">description</span>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-800 leading-none">Class Worksheet PDF</h4>
                    <span className="text-[8px] font-bold text-slate-450">Notes & Assignment workbook</span>
                  </div>
                </div>
                <button 
                  onClick={() => alert("Mock PDF downloaded successfully to device.")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[8px] px-3.5 py-2 rounded-xl uppercase tracking-wider flex items-center space-x-1 transition shadow shadow-blue-500/20 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-rounded text-[10px] font-bold">download</span>
                  <span>Get Notes</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed font-medium bg-white border border-slate-100 p-3.5 rounded-2xl shadow-sm">
                {activeVideo.description || "In this session, we go over the core concepts and chapters for this subject's batch. Solve the workbook worksheets assigned to this lecture."}
              </p>
            </div>

            {/* Student Learning Progress Card */}
            <div className="px-5">
              <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="space-y-1 w-[70%]">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Your Progress</h4>
                  <p className="text-[11px] text-slate-700 font-bold leading-tight">
                    You completed <span className="text-blue-600 font-black">{completedLectures}</span> of <span className="text-slate-800">{totalLectures}</span> lectures
                  </p>
                  
                  {/* Progress bar track */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${overallCompletionPercentage}%` }}></div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-2xl flex flex-col items-center justify-center shrink-0 w-16 text-center select-none shadow-sm">
                  <span className="text-slate-900 font-black text-xs leading-none">{overallCompletionPercentage}%</span>
                  <span className="text-[7px] text-blue-600 font-black tracking-wider uppercase mt-1">Done</span>
                </div>
              </div>
            </div>

            {/* Subject Genre Chips Slider */}
            <div className="space-y-3 pl-5 select-none">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-rounded text-slate-400 text-sm font-bold">filter_alt</span>
                <h3 className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Filter by Subject</h3>
              </div>
              
              <div className="flex space-x-2 overflow-x-auto no-scrollbar pr-5">
                {subjectsList.map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[9px] font-extrabold tracking-wider transition cursor-pointer border ${selectedSubject === subj ? 'bg-slate-900 text-white border-slate-900 shadow' : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100'}`}
                  >
                    {subj === "All" ? "All Subjects" : subj}
                  </button>
                ))}
              </div>
            </div>

            {/* Netflix-style Horizontal Carousel - UP NEXT */}
            <div className="space-y-3 pl-5">
              <div className="flex justify-between items-center pr-5">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Up Next</h3>
                <span className="text-[8px] font-extrabold text-blue-600 uppercase tracking-wider">{filteredVideos.length} lectures found</span>
              </div>
              
              <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-3 pr-5">
                {filteredVideos.map((item) => {
                  const videoId = getYoutubeVideoId(item.youtubeUrl);
                  const progress = getLectureProgress(item.id);
                  const isCompleted = progress && progress.percent > 90;
                  const isPlaying = activeVideo.id === item.id;
                  
                  return (
                    <button 
                      key={item.id}
                      onClick={() => selectActiveVideo(item)}
                      className="flex-shrink-0 w-36 text-left space-y-1.5 group select-none cursor-pointer focus:outline-none"
                    >
                      {/* Netflix-style Thumbnail */}
                      <div className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-200 border shadow transition duration-200 ${isPlaying ? 'border-blue-600 ring-4 ring-blue-100 scale-[0.98]' : 'border-slate-100 group-hover:border-blue-500'}`}>
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

                        {/* Playing state equalizers or indicators */}
                        {isPlaying ? (
                          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white select-none">
                            <span className="material-symbols-rounded text-base animate-bounce">equalizer</span>
                            <span className="text-[7px] font-black tracking-widest uppercase mt-0.5">NOW PLAYING</span>
                          </div>
                        ) : isCompleted ? (
                          <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white font-extrabold text-[7px] px-1.5 py-0.5 rounded flex items-center tracking-wider shadow">
                            ✓ DONE
                          </span>
                        ) : null}

                        {/* Mini progress trackbar */}
                        {progress && !isCompleted && !isPlaying && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-250">
                            <div className="bg-blue-600 h-full" style={{ width: `${progress.percent}%` }}></div>
                          </div>
                        )}
                      </div>

                      {/* Text meta */}
                      <div className="space-y-0.5 pl-0.5">
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
                
                {filteredVideos.length === 0 && (
                  <div className="w-full text-center py-6 pr-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    No lectures available under this category.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Revision section */}
            <div className="space-y-3 pl-5 pb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Revision List</h3>
              
              <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 pr-5">
                {recordedClasses.map((item) => (
                  <button 
                    key={`continue-${item.id}`}
                    onClick={() => selectActiveVideo(item)}
                    className="flex-shrink-0 bg-white border border-slate-100 hover:border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3 w-48 text-left transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <span className="material-symbols-rounded text-sm">auto_stories</span>
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
            <span className="material-symbols-rounded text-slate-350 text-5xl">video_library</span>
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
