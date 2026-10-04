import React from 'react';
import { Bot, Sparkles, MessageSquare, Compass, ShieldCheck } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const GuidesPlaceholder: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Virtual AI Travel Guide — NOVA Bot"
        subtitle="Travel Link features an AI Guide Bot to assist with Sri Lankan destinations, landmarks & itineraries"
        breadcrumbs={[{ label: 'AI Guide' }]}
      />
      <div className="bg-gradient-to-r from-teal-900/40 via-emerald-900/30 to-slate-900 border border-teal-500/30 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 shadow-inner">
            <Bot className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-white">NOVA Virtual Guide Bot</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Powered
              </span>
            </div>
            <p className="text-slate-300">
              Your 24/7 intelligent companion for exploring Sri Lanka’s UNESCO heritage, national park safaris, and local travel tips.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
            <Compass className="w-6 h-6 text-teal-400 mb-2" />
            <h3 className="text-white font-semibold text-sm mb-1">Landmark Insights</h3>
            <p className="text-slate-400 text-xs">Instant facts, opening hours, entry fees, and dress codes for top landmarks.</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
            <MessageSquare className="w-6 h-6 text-teal-400 mb-2" />
            <h3 className="text-white font-semibold text-sm mb-1">Interactive Q&A</h3>
            <p className="text-slate-400 text-xs">Ask anything about local food, weather, etiquette, and travel routes.</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-teal-400 mb-2" />
            <h3 className="text-white font-semibold text-sm mb-1">AI Trip Planning</h3>
            <p className="text-slate-400 text-xs">Generate custom day-by-day itineraries optimized for your preferences.</p>
          </div>
        </div>

        <div className="flex justify-center">
          <a
            href="/planner"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> Launch AI Travel Planner & NOVA Bot
          </a>
        </div>
      </div>
    </PageContainer>
  );
};
