import React from 'react';

interface PickMeLogoProps {
  className?: string;
  textColor?: 'white' | 'dark';
  iconSize?: 'sm' | 'md' | 'lg';
}

export const PickMeLogo: React.FC<PickMeLogoProps> = ({
  className = '',
  textColor = 'white',
  iconSize = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-8 text-xl',
    md: 'h-11 sm:h-12 text-2xl sm:text-3xl',
    lg: 'h-14 sm:h-16 text-3xl sm:text-4xl'
  };

  const boxSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* App Icon Square */}
      <div className={`relative ${boxSizes[iconSize]} bg-gradient-to-b from-[#FFD600] to-[#FFA800] p-1.5 shadow-lg flex items-center justify-center shrink-0 border border-amber-300/40`}>
        <svg
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-slate-950"
        >
          {/* Head */}
          <circle cx="33" cy="17" r="6.5" fill="#111111" />
          
          {/* Raised Hailing Arm */}
          <path
            d="M 17 13 C 14 10 12 17 17 23 C 22 28 26 33 29 37 C 32 32 29 24 22 17 Z"
            fill="#111111"
          />
          
          {/* Body & Torso */}
          <path
            d="M 29 37 C 26 40 28 55 29 55 L 39 55 C 39 55 41 40 40 37 C 47 42 53 47 54 45 C 55 44 50 36 43 32 C 38 29 33 32 29 37 Z"
            fill="#111111"
          />
        </svg>
      </div>

      {/* Brand Name Typography */}
      <div className={`font-black tracking-tight font-heading flex items-baseline ${sizeClasses[iconSize].split(' ').slice(1).join(' ')}`}>
        <span className={textColor === 'white' ? 'text-white drop-shadow-sm' : 'text-slate-900'}>
          Pick
        </span>
        <span className="text-[#FFC72C] drop-shadow-sm">
          Me
        </span>
      </div>
    </div>
  );
};
