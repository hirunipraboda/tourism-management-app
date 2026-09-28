import React from 'react';
import { useNavigate } from 'react-router-dom';
import websiteLogo from '../../assets/website-logo.png';

interface FooterProps {
  onReplaySplash?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onReplaySplash }) => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#072537] text-white py-10 px-4 sm:px-8 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <img
            src={websiteLogo}
            alt="Tour Link"
            className="h-12 sm:h-16 w-auto object-contain"
          />
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Tour Link. Your Island Journey
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium">
          {onReplaySplash && (
            <button
              onClick={onReplaySplash}
              className="hover:text-[#16A6A1] transition-colors cursor-pointer text-[#16A6A1] font-bold"
            >
              ✦ Replay Splash Reveal
            </button>
          )}
          <button
            onClick={() => navigate('/destinations')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Destinations
          </button>
          <button
            onClick={() => navigate('/trips')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Trips
          </button>
          <button
            onClick={() => navigate('/tours')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Tour & Guide
          </button>
          <button
            onClick={() => navigate('/ai-workflows')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            AI Trip Planner
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="hover:text-white transition-colors cursor-pointer text-slate-400"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="hover:text-white transition-colors cursor-pointer text-slate-400"
          >
            Terms of Service
          </button>
        </div>
      </div>
    </footer>
  );
};
