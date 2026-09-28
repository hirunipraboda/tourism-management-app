import React from 'react';

interface BotWaveVectorProps {
  className?: string;
  showBackground?: boolean;
}

/**
 * Pure vector SVG representation of the Waving NOVA Travel Bot (Bot-wave.svg).
 * Renders high-resolution vector paths, waving arm animation, safari hat, visor smile, and compass.
 */
export const BotWaveVector: React.FC<BotWaveVectorProps> = ({
  className = 'w-48 h-48',
  showBackground = false
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 800"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="bgGlowWave" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a2636" />
          <stop offset="100%" stopColor="#0d1117" />
        </radialGradient>

        <linearGradient id="botBodyWave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        <linearGradient id="tealAccentWave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>

        <linearGradient id="goldAccentWave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="darkMetalWave" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        <linearGradient id="screenGlassWave" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        <filter id="glowCyanWave" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="glowSoftWave" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="shadowWave" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {showBackground && (
        <rect width="800" height="800" fill="url(#bgGlowWave)" rx="400" />
      )}

      {/* Ground Shadow */}
      <ellipse cx="400" cy="740" rx="180" ry="25" fill="#000000" opacity="0.5" filter="url(#glowSoftWave)" />

      {/* BOT GROUP */}
      <g id="travel-bot" transform="translate(0, 30)">

        {/* BACKPACK */}
        <g id="backpack" filter="url(#shadowWave)">
          <rect x="280" y="330" width="240" height="200" rx="35" fill="url(#goldAccentWave)" />
          <rect x="310" y="420" width="180" height="90" rx="20" fill="#b45309" opacity="0.8" />
          <rect x="300" y="350" width="25" height="130" rx="10" fill="#78350f" />
          <rect x="475" y="350" width="25" height="130" rx="10" fill="#78350f" />
          <rect x="260" y="300" width="280" height="45" rx="20" fill="url(#tealAccentWave)" />
          <line x1="320" y1="300" x2="320" y2="345" stroke="#0f766e" strokeWidth="4" />
          <line x1="480" y1="300" x2="480" y2="345" stroke="#0f766e" strokeWidth="4" />
        </g>

        {/* LEFT ARM (Waving Hello) */}
        <g id="left-arm">
          <circle cx="260" cy="350" r="28" fill="url(#darkMetalWave)" />
          <circle cx="260" cy="350" r="15" fill="url(#tealAccentWave)" />
          
          <path d="M 250 340 Q 180 280 185 200" fill="none" stroke="url(#darkMetalWave)" strokeWidth="28" strokeLinecap="round" />
          <path d="M 250 340 Q 180 280 185 200" fill="none" stroke="url(#botBodyWave)" strokeWidth="16" strokeLinecap="round" />
          
          <circle cx="185" cy="190" r="20" fill="url(#darkMetalWave)" />
          <circle cx="175" cy="175" r="6" fill="url(#botBodyWave)" />
          <circle cx="188" cy="172" r="6" fill="url(#botBodyWave)" />
          <circle cx="200" cy="177" r="6" fill="url(#botBodyWave)" />

          {/* Wave Motion Lines */}
          <path d="M 145 170 C 135 185 135 205 145 220" fill="none" stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" filter="url(#glowCyanWave)" />
          <path d="M 130 160 C 115 185 115 215 130 240" fill="none" stroke="#2dd4bf" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" filter="url(#glowCyanWave)" />
        </g>

        {/* RIGHT ARM (Holding Compass) */}
        <g id="right-arm">
          <circle cx="540" cy="350" r="28" fill="url(#darkMetalWave)" />
          <circle cx="540" cy="350" r="15" fill="url(#tealAccentWave)" />
          
          <path d="M 550 365 Q 600 420 570 480" fill="none" stroke="url(#darkMetalWave)" strokeWidth="28" strokeLinecap="round" />
          <path d="M 550 365 Q 600 420 570 480" fill="none" stroke="url(#botBodyWave)" strokeWidth="16" strokeLinecap="round" />
          
          <circle cx="570" cy="490" r="18" fill="url(#darkMetalWave)" />

          {/* COMPASS */}
          <g id="compass" transform="translate(600, 480)" filter="url(#shadowWave)">
            <circle cx="0" cy="0" r="30" fill="url(#goldAccentWave)" />
            <circle cx="0" cy="0" r="24" fill="#0f172a" />
            <circle cx="0" cy="0" r="20" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 5" />
            <polygon points="0,-16 5,0 0,3 -5,0" fill="#ef4444" />
            <polygon points="0,16 5,0 0,-3 -5,0" fill="#cbd5e1" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </g>

        {/* TORSO / BODY */}
        <g id="torso" filter="url(#shadowWave)">
          <rect x="280" y="310" width="240" height="220" rx="60" fill="url(#botBodyWave)" />
          <rect x="284" y="314" width="232" height="212" rx="56" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.6" />

          <rect x="310" y="340" width="180" height="150" rx="30" fill="url(#screenGlassWave)" />
          <rect x="312" y="342" width="176" height="146" rx="28" fill="none" stroke="url(#tealAccentWave)" strokeWidth="2" opacity="0.8" />

          <g id="screen-ui" filter="url(#glowCyanWave)">
            <path d="M 330 430 Q 360 400 400 440 T 470 390" fill="none" stroke="#14b8a6" strokeWidth="3" strokeDasharray="4 4" />
            
            <g transform="translate(400, 440)">
              <path d="M 0 0 C -4 -4 -6 -8 -6 -11 A 6 6 0 1 1 6 -11 C 6 -8 4 -4 0 0 Z" fill="#ef4444" />
              <circle cx="0" cy="-11" r="2.5" fill="#ffffff" />
            </g>
            <g transform="translate(470, 390)">
              <path d="M 0 0 C -4 -4 -6 -8 -6 -11 A 6 6 0 1 1 6 -11 C 6 -8 4 -4 0 0 Z" fill="#22c55e" />
              <circle cx="0" cy="-11" r="2.5" fill="#ffffff" />
            </g>

            <text x="330" y="375" fontFamily="'Segoe UI', Roboto, sans-serif" fontWeight="700" fontSize="14" fill="#38bdf8" letterSpacing="1">NOVA AI</text>
            <circle cx="455" cy="370" r="5" fill="#22c55e" />
          </g>

          <path d="M 340 500 L 460 500" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* LEGS */}
        <g id="legs">
          <rect x="350" y="520" width="100" height="30" rx="10" fill="url(#darkMetalWave)" />

          <g id="left-leg">
            <rect x="345" y="540" width="40" height="110" rx="20" fill="url(#botBodyWave)" />
            <rect x="355" y="560" width="20" height="40" rx="10" fill="url(#darkMetalWave)" />
            <path d="M 330 640 L 390 640 C 395 640 400 645 400 650 L 400 670 C 400 680 390 685 380 685 L 330 685 C 320 685 315 675 320 665 L 325 645 C 327 642 328 640 330 640 Z" fill="url(#darkMetalWave)" />
            <rect x="325" y="670" width="70" height="10" rx="5" fill="url(#tealAccentWave)" />
          </g>

          <g id="right-leg">
            <rect x="415" y="540" width="40" height="110" rx="20" fill="url(#botBodyWave)" />
            <rect x="425" y="560" width="20" height="40" rx="10" fill="url(#darkMetalWave)" />
            <path d="M 470 640 L 410 640 C 405 640 400 645 400 650 L 400 670 C 400 680 410 685 420 685 L 470 685 C 480 685 485 675 480 665 L 475 645 C 473 642 472 640 470 640 Z" fill="url(#darkMetalWave)" />
            <rect x="405" y="670" width="70" height="10" rx="5" fill="url(#tealAccentWave)" />
          </g>
        </g>

        {/* HEAD & NECK */}
        <g id="head-group" filter="url(#shadowWave)">
          <rect x="370" y="280" width="60" height="40" rx="10" fill="url(#darkMetalWave)" />
          <path d="M 380 295 L 420 295" stroke="#2dd4bf" strokeWidth="3" filter="url(#glowCyanWave)" />

          <g transform="rotate(-3, 400, 215)">
            <rect x="270" y="130" width="260" height="170" rx="75" fill="url(#botBodyWave)" />
            <rect x="274" y="134" width="252" height="162" rx="71" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.7" />

            <rect x="295" y="150" width="210" height="120" rx="50" fill="url(#screenGlassWave)" />
            <rect x="297" y="152" width="206" height="116" rx="48" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />

            {/* EYES */}
            <g id="eyes" filter="url(#glowCyanWave)">
              <path d="M 330 210 Q 350 185 370 210" fill="none" stroke="#2dd4bf" strokeWidth="8" strokeLinecap="round" />
              <circle cx="450" cy="205" r="22" fill="#2dd4bf" />
              <circle cx="454" cy="200" r="7" fill="#ffffff" />
            </g>

            <path d="M 375 238 Q 400 258 425 238" fill="none" stroke="#2dd4bf" strokeWidth="5" strokeLinecap="round" filter="url(#glowCyanWave)" />

            <rect x="250" y="175" width="25" height="80" rx="10" fill="url(#darkMetalWave)" />
            <rect x="260" y="190" width="10" height="50" rx="5" fill="url(#tealAccentWave)" />
            <rect x="525" y="175" width="25" height="80" rx="10" fill="url(#darkMetalWave)" />
            <rect x="530" y="190" width="10" height="50" rx="5" fill="url(#tealAccentWave)" />

            <g id="antenna">
              <rect x="393" y="80" width="14" height="55" fill="url(#darkMetalWave)" />
              <g transform="translate(400, 75)" filter="url(#glowCyanWave)">
                <path d="M 0 -25 C -12 -25 -20 -17 -20 -5 C -20 10 0 30 0 30 C 0 30 20 10 20 -5 C 20 -17 12 -25 0 -25 Z" fill="url(#tealAccentWave)" />
                <circle cx="0" cy="-7" r="7" fill="#ffffff" />
              </g>
            </g>

            <g id="hat">
              <path d="M 300 145 C 300 70 500 70 500 145 Z" fill="url(#goldAccentWave)" />
              <path d="M 240 145 C 240 135 270 130 400 130 C 530 130 560 135 560 145 C 560 158 520 162 400 162 C 280 162 240 158 240 145 Z" fill="#d97706" />
              <path d="M 255 145 C 255 140 280 135 400 135 C 520 135 545 140 545 145 C 545 152 510 156 400 156 C 290 156 255 152 255 145 Z" fill="#f59e0b" />
              <path d="M 301 140 C 330 133 470 133 499 140 L 497 128 C 450 120 350 120 303 128 Z" fill="#0f766e" />
              <circle cx="400" cy="115" r="10" fill="url(#botBodyWave)" />
              <polygon points="400,107 403,115 400,113 397,115" fill="#ef4444" />
              <polygon points="400,123 403,115 400,117 397,115" fill="#475569" />
            </g>
          </g>
        </g>

        {/* FLOATING SPARKLES */}
        <g fill="#2dd4bf" filter="url(#glowCyanWave)">
          <path d="M 620 160 L 624 172 L 636 176 L 624 180 L 620 192 L 616 180 L 604 176 L 616 172 Z" fill="#38bdf8" />
          <path d="M 150 320 L 153 328 L 161 331 L 153 334 L 150 342 L 147 334 L 139 331 L 147 328 Z" fill="#fbbf24" />
          <circle cx="670" cy="280" r="4" opacity="0.8" />
          <circle cx="220" cy="100" r="3" opacity="0.6" />
        </g>

      </g>
    </svg>
  );
};
