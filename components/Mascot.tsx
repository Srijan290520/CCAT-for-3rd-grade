import React from 'react';

type MascotStatus = 'greeting' | 'thinking' | 'correct' | 'incorrect' | 'celebrating';

interface MascotProps {
  status: MascotStatus;
  large?: boolean;
}

const Mascot: React.FC<MascotProps> = ({ status, large = false }) => {
  const size = large ? 'w-48 h-48' : 'w-24 h-24';

  const getEyes = () => {
    switch (status) {
      case 'correct':
      case 'celebrating':
        return (
          <>
            <path d="M10 14 C 12 16, 16 16, 18 14" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M22 14 C 24 16, 28 16, 30 14" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      case 'incorrect':
        return (
          <>
            <line x1="10" y1="12" x2="16" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="12" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="12" x2="30" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="12" x2="24" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      case 'thinking':
          return (
             <>
                <circle cx="13" cy="15" r="2" fill="currentColor" />
                <path d="M22 15 C 24 13, 28 13, 30 15" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />
             </>
          );
      case 'greeting':
      default:
        return (
          <>
            <circle cx="13" cy="15" r="2.5" fill="currentColor" />
            <circle cx="27" cy="15" r="2.5" fill="currentColor" />
          </>
        );
    }
  };

  const getMouth = () => {
    switch (status) {
      case 'celebrating':
      case 'correct':
        return <path d="M14 24 Q 20 30, 26 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />;
      case 'incorrect':
        return <path d="M14 26 Q 20 22, 26 26" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />;
      case 'thinking':
        return <circle cx="20" cy="25" r="2" fill="currentColor" />;
      case 'greeting':
      default:
        return <path d="M14 25 Q 20 28, 26 25" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" />;
    }
  };

  const animationClass = status === 'celebrating' ? 'animate-bounce' : 'transition-transform duration-300 hover:scale-110';

  return (
    <div className={`${size} ${animationClass}`}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-label={`Mascot with a ${status} expression`}>
        {/* Antenna */}
        <line x1="20" y1="5" x2="20" y2="2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="2" r="2" fill="#FBBF24" />
        
        {/* Head */}
        <rect x="5" y="5" width="30" height="30" rx="10" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
        <rect x="8" y="8" width="24" height="24" rx="6" fill="#F9FAFB" />

        {/* Eyes & Mouth Container */}
        <g className="text-gray-700">
          {getEyes()}
          {getMouth()}
        </g>
      </svg>
    </div>
  );
};

export default Mascot;