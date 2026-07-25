import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoSVG } from '../components/Illustrations';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white flex flex-col items-center justify-between px-8 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] z-30 select-none animate-fade-in">
      <div></div>
      
      <div className="flex flex-col items-center space-y-6 text-center animate-slide-up">
        <div className="bg-white/10 p-5 rounded-[24px] backdrop-blur-md border border-white/20 shadow-xl animate-bounce-soft">
          <LogoSVG className="w-20 h-20 filter drop-shadow-[0_8px_16px_rgba(255,255,255,0.2)]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight uppercase leading-snug drop-shadow-md">
            New Direction<br />Coaching Centre
          </h1>
          <div className="w-16 h-1 bg-cyan-300 mx-auto rounded-full"></div>
          <p className="text-cyan-100 text-sm font-medium tracking-wide">
            Guiding Minds, Shaping Futures
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        <button 
          onClick={() => navigate('/welcome')} 
          className="text-xs text-white/60 hover:text-white underline tracking-wider uppercase transition-colors cursor-pointer"
        >
          Skip Loading
        </button>
      </div>
    </div>
  );
}
