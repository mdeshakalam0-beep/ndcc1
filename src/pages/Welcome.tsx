import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeIllustrationSVG } from '../components/Illustrations';

export default function Welcome() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 800);
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-6 bg-white z-20 animate-fade-in">
      <div className="flex justify-center pt-8">
        <WelcomeIllustrationSVG className="w-full max-w-xs h-auto" />
      </div>
      
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 px-4 leading-tight">
          Welcome to <span className="text-blue-600">New Direction</span> Coaching Centre
        </h2>
        <p className="text-sm text-slate-500 px-6 leading-relaxed">
          Join a community of high achievers. Learn from top educators with video lessons, customized notes, and mock examinations.
        </p>
      </div>

      <div className="pb-6">
        <button
          onClick={handleContinue}
          className="w-full py-4 bg-blue-600 text-white font-semibold rounded-[20px] shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition flex items-center justify-center space-x-2 relative overflow-hidden cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Get Started</span>
              <span className="material-symbols-rounded">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
