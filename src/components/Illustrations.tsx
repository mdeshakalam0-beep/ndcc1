import React from 'react';

// NDCC Emblem Logo
export const LogoSVG: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <img 
    src="/icon-192.png" 
    alt="NDCC Logo" 
    className={`${className} object-contain`} 
    style={{ contentVisibility: 'auto' }}
  />
);

// Welcome Screen Illustration (Students Learning)
export const WelcomeIllustrationSVG: React.FC<{ className?: string }> = ({ className = "w-full h-64" }) => (
  <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="welGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#E0F2FE" />
      </linearGradient>
      <linearGradient id="mainBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0891B2" />
      </linearGradient>
    </defs>
    
    {/* Background Circle */}
    <circle cx="200" cy="150" r="120" fill="url(#welGrad)" />
    <circle cx="90" cy="90" r="16" fill="#22C55E" opacity="0.15" />
    <circle cx="310" cy="210" r="24" fill="#06B6D4" opacity="0.1" />
    
    {/* Floating Mathematical Symbols */}
    <path d="M280 70 L290 70 M285 65 L285 75" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" /> {/* Plus */}
    <path d="M90 200 H105" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" /> {/* Minus */}
    <path d="M305 130 C310 120 320 120 325 130" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" fill="none" /> {/* Wave */}
    
    {/* The Stack of Books */}
    <rect x="130" y="210" width="140" height="24" rx="4" fill="url(#mainBlue)" />
    <rect x="130" y="210" width="30" height="24" fill="#3B82F6" />
    <line x1="175" y1="222" x2="250" y2="222" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    
    <rect x="145" y="185" width="110" height="25" rx="4" fill="url(#cyanGrad)" />
    <rect x="225" y="185" width="30" height="25" fill="#0891B2" />
    <line x1="160" y1="197" x2="210" y2="197" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    
    {/* Laptop / Screen */}
    <rect x="110" y="90" width="180" height="110" rx="12" fill="#1E293B" stroke="#64748B" strokeWidth="4" />
    <rect x="120" y="100" width="160" height="80" rx="6" fill="#0F172A" />
    
    {/* Coding / Chart graphics inside screen */}
    <path d="M135 125 L150 115 L135 105" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="160" y="112" width="40" height="6" rx="3" fill="#3B82F6" />
    <rect x="135" y="135" width="70" height="6" rx="3" fill="#22C55E" />
    <circle cx="230" cy="140" r="22" fill="none" stroke="#64748B" strokeWidth="6" />
    <circle cx="230" cy="140" r="22" fill="none" stroke="#2563EB" strokeWidth="6" strokeDasharray="100 138" strokeDashoffset="25" strokeLinecap="round" />
    
    {/* Glowing Idea Bulb floating */}
    <path d="M200 45 C190 45 185 53 185 60 C185 67 192 70 195 74 V80 H205 V74 C208 70 215 67 215 60 C215 53 210 45 200 45 Z" fill="#F59E0B" opacity="0.8" />
    <rect x="194" y="80" width="12" height="4" fill="#64748B" />
    <path d="M200 30 V38 M180 40 L186 45 M220 40 L214 45" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
    
    {/* Base of laptop */}
    <path d="M90 200 H310 C310 200 300 210 280 210 H120 C100 210 90 200 90 200 Z" fill="#475569" />
  </svg>
);

// Login Screen Illustration
export const LoginIllustrationSVG: React.FC<{ className?: string }> = ({ className = "w-full h-48" }) => (
  <svg className={className} viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EEF2F6" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
      <linearGradient id="shieldBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    
    <circle cx="150" cy="100" r="75" fill="url(#logBg)" />
    
    {/* Floating Card (Simulated UI) */}
    <rect x="70" y="55" width="160" height="90" rx="16" fill="#FFFFFF" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.06))" />
    
    {/* Profile Card Header */}
    <circle cx="105" cy="85" r="16" fill="#DBEAFE" />
    {/* Avatar Head/Body */}
    <circle cx="105" cy="80" r="6" fill="#2563EB" />
    <path d="M96 93 C96 89 100 87 105 87 C110 87 114 89 114 93 H96 Z" fill="#2563EB" />
    
    {/* Text Placeholders */}
    <rect x="130" y="75" width="70" height="8" rx="4" fill="#E2E8F0" />
    <rect x="130" y="89" width="40" height="6" rx="3" fill="#94A3B8" opacity="0.6" />
    
    {/* Safe Lock Shield */}
    <path d="M210 115 C210 125 195 135 195 135 C195 135 180 125 180 115 V102 L195 97 L210 102 V115 Z" fill="url(#shieldBlue)" />
    <path d="M195 106 V112" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <circle cx="195" cy="114" r="2" fill="#FFFFFF" />
    
    {/* Floating Checkmark Badge */}
    <circle cx="80" cy="120" r="12" fill="#22C55E" />
    <path d="M76 120 L79 123 L85 117" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Onboarding Guide Screen 1: Website Overview
export const Onboarding1SVG: React.FC = () => (
  <svg className="w-full h-44 mx-auto" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#DBEAFE" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="80" r="60" fill="url(#phoneGrad)" />
    
    {/* Hand holding phone (Simplified) */}
    <rect x="75" y="40" width="50" height="90" rx="8" fill="#1E293B" stroke="#475569" strokeWidth="3" />
    <rect x="78" y="46" width="44" height="74" rx="4" fill="#FFFFFF" />
    
    {/* Screen components */}
    <rect x="82" y="52" width="36" height="15" rx="3" fill="#2563EB" opacity="0.8" />
    <circle cx="100" cy="60" r="5" fill="#FFFFFF" opacity="0.6" />
    <rect x="82" y="73" width="16" height="16" rx="2" fill="#E2E8F0" />
    <rect x="102" y="73" width="16" height="16" rx="2" fill="#E2E8F0" />
    <rect x="82" y="94" width="36" height="8" rx="2" fill="#06B6D4" opacity="0.8" />
    <rect x="82" y="106" width="24" height="6" rx="2" fill="#E2E8F0" />
    
    {/* Phone home indicator */}
    <rect x="94" y="121" width="12" height="2" rx="1" fill="#94A3B8" />
  </svg>
);

// Onboarding Guide Screen 2: How to take tests
export const Onboarding2SVG: React.FC = () => (
  <svg className="w-full h-44 mx-auto" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="testGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ECFDF5" />
        <stop offset="100%" stopColor="#D1FAE5" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="80" r="60" fill="url(#testGrad)" />
    
    {/* Quiz Clipboard */}
    <rect x="75" y="35" width="50" height="70" rx="6" fill="#FFFFFF" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))" />
    <rect x="87" y="30" width="26" height="10" rx="3" fill="#94A3B8" />
    
    {/* Checklist lines */}
    <circle cx="85" cy="55" r="4" fill="#22C55E" />
    <line x1="93" y1="55" x2="115" y2="55" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
    
    <circle cx="85" cy="70" r="4" fill="#22C55E" />
    <line x1="93" y1="70" x2="115" y2="70" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
    
    <circle cx="85" cy="85" r="4" fill="#E2E8F0" />
    <line x1="93" y1="85" x2="108" y2="85" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
    
    {/* Stopwatch overlay */}
    <circle cx="125" cy="95" r="22" fill="#FFFFFF" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.1))" />
    <circle cx="125" cy="95" r="18" fill="none" stroke="#F59E0B" strokeWidth="3" />
    <path d="M125 83 V95 H133" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="123" y="70" width="4" height="4" fill="#64748B" />
  </svg>
);

// Onboarding Guide Screen 3: How to edit profile
export const Onboarding3SVG: React.FC = () => (
  <svg className="w-full h-44 mx-auto" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="profGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF7ED" />
        <stop offset="100%" stopColor="#FFEDD5" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="80" r="60" fill="url(#profGrad)" />
    
    {/* Big Profile Avatar */}
    <circle cx="100" cy="70" r="28" fill="#FFFFFF" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.05))" />
    <circle cx="100" cy="62" r="10" fill="#3B82F6" />
    <path d="M84 83 C84 76 91 73 100 73 C109 73 116 76 116 83 H84 Z" fill="#3B82F6" />
    
    {/* Pencil editing badge overlay */}
    <circle cx="125" cy="85" r="14" fill="#06B6D4" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.15))" />
    <path d="M120 90 L123 90 L130 83 L127 80 L120 87 Z" fill="#FFFFFF" />
    <path d="M129 82 L128 81" stroke="#06B6D4" strokeWidth="1" />
  </svg>
);

// Onboarding Guide Screen 4: Notifications
export const Onboarding4SVG: React.FC = () => (
  <svg className="w-full h-44 mx-auto" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="notifGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5F3FF" />
        <stop offset="100%" stopColor="#EDE9FE" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="80" r="60" fill="url(#notifGrad)" />
    
    {/* Ringing Bell */}
    <path d="M100 35 C94 35 90 40 90 46 V52 C82 55 77 62 77 71 V85 L70 90 V95 H130 V90 L123 85 V71 C123 62 118 55 110 52 V46 C110 40 106 35 100 35 Z" fill="#2563EB" />
    <path d="M92 100 C92 105 95 108 100 108 C105 108 108 105 108 100 H92 Z" fill="#3B82F6" />
    
    {/* Notification Badge Dot */}
    <circle cx="128" cy="44" r="10" fill="#EF4444" />
    <text x="125" y="48" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="sans-serif">1</text>
    
    {/* Sound waves */}
    <path d="M68 60 C60 65 60 75 68 80" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M132 60 C140 65 140 75 132 80" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
