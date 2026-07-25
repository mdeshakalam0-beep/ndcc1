import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Onboarding1SVG,
  Onboarding2SVG,
  Onboarding3SVG,
  Onboarding4SVG
} from '../components/Illustrations';

export default function Onboarding() {
  const navigate = useNavigate();
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  const onboardingSlides = [
    {
      title: "How to use the website",
      description: "Access study notes, practice sheets, progress reports, and notifications anywhere on any device.",
      component: <Onboarding1SVG />
    },
    {
      title: "How to take tests",
      description: "Answer objective multiple-choice questions with real-time timers to evaluate your preparations.",
      component: <Onboarding2SVG />
    },
    {
      title: "How to edit profile",
      description: "Keep your details, father's name, class, and profile avatar up-to-date for coaching records.",
      component: <Onboarding3SVG />
    },
    {
      title: "Receive notifications",
      description: "Get instant alerts regarding offline schedules, holiday announcements, test results, and notes.",
      component: <Onboarding4SVG />
    }
  ];

  return (
    <div className="absolute inset-0 flex flex-col justify-between px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-white z-20 animate-fade-in select-none">
      {/* Onboarding Skip */}
      <div className="flex justify-end pt-2">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition uppercase tracking-wider cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Illustration and Onboarding Text */}
      <div className="my-auto text-center space-y-6">
        <div className="h-48 flex items-center justify-center">
          {onboardingSlides[onboardingIndex].component}
        </div>
        <div className="space-y-3 px-4">
          <h3 className="text-xl font-bold text-slate-800 transition-all duration-300">
            {onboardingSlides[onboardingIndex].title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed min-h-[48px]">
            {onboardingSlides[onboardingIndex].description}
          </p>
        </div>
      </div>

      {/* Bottom indicators and buttons */}
      <div className="space-y-6 pb-4">
        {/* Bullets */}
        <div className="flex justify-center space-x-2">
          {onboardingSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setOnboardingIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${onboardingIndex === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'}`}
            ></button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          {onboardingIndex > 0 ? (
            <button
              onClick={() => setOnboardingIndex(prev => prev - 1)}
              className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition active:scale-95 text-sm cursor-pointer"
            >
              Back
            </button>
          ) : null}
          
          <button
            onClick={() => {
              if (onboardingIndex < onboardingSlides.length - 1) {
                setOnboardingIndex(prev => prev + 1);
              } else {
                navigate('/dashboard');
              }
            }}
            className="flex-1 py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition active:scale-[0.98] text-sm cursor-pointer"
          >
            {onboardingIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
