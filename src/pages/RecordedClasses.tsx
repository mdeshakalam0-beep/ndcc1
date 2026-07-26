import { useNavigate } from 'react-router-dom';
import type { RecordedClassItem } from '../types';
import { getYoutubeEmbedUrl } from '../utils/youtube';

interface RecordedClassesProps {
  recordedClasses: RecordedClassItem[];
}

export default function RecordedClasses({ recordedClasses }: RecordedClassesProps) {
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
        <h3 className="text-sm font-bold text-slate-900">Recorded Classes</h3>
        <div className="w-8"></div>
      </div>

      {/* Recorded Classes list */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 py-4">
        {recordedClasses.length > 0 ? (
          recordedClasses.map((item) => {
            const embedUrl = getYoutubeEmbedUrl(item.youtubeEmbedUrl || item.youtubeUrl);
            
            return (
              <div 
                key={item.id}
                className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col space-y-4 hover:shadow-md transition duration-200"
              >
                {/* Embedded Video Player */}
                {embedUrl ? (
                  <div className="relative w-full aspect-video rounded-[18px] overflow-hidden bg-black shadow-inner">
                    <iframe
                      src={`${embedUrl}?rel=0&modestbranding=1`}
                      title={item.title}
                      className="absolute inset-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-[18px] bg-slate-100 flex flex-col items-center justify-center text-center space-y-2 select-none border border-dashed border-slate-200">
                    <span className="material-symbols-rounded text-slate-400 text-3xl">play_circle</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Video link unavailable</span>
                  </div>
                )}

                {/* Video details */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="inline-block bg-blue-50 text-blue-600 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
                      {item.subject}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 leading-tight pt-1">
                      {item.title}
                    </h4>
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
            <span className="material-symbols-rounded text-slate-300 text-5xl">video_library</span>
            <div>
              <h4 className="text-sm font-bold text-slate-800">No Recorded Lectures</h4>
              <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto mt-1">
                No recorded video lectures have been uploaded for your class batch yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
