import React from 'react';
import { LandingNavbar } from '../components/navigation/LandingNavbar';
import { NOVAGuideChat } from '../components/guide/NOVAGuideChat';
import { Compass, Sparkles } from 'lucide-react';

export const AIGuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B3A53] border border-[#16A6A1]/40 flex items-center justify-center text-[#16A6A1] shadow-lg">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-teal-400 text-xs font-black uppercase tracking-wider">NOVA Guide AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-white text-xl sm:text-2xl font-black font-heading">
                Sri Lanka Travel Companion
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Gemini Multimodal Vision + Sri Lanka Context</span>
          </div>
        </div>

        <div className="w-full max-w-6xl flex-1 flex flex-col">
          <NOVAGuideChat />
        </div>
      </main>
    </div>
  );
};

export default AIGuidePage;
