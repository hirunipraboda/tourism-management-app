import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  X,
  Paperclip,
  Send,
  Camera,
  Utensils,
  Calendar,
  DollarSign,
  Navigation,
  Landmark,
  Loader2,
  ArrowRight,
  Minus,
  Bot,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { novaGuideService, NOVAGuideMessage } from '../../services/novaGuideService';
import { TravelPackage } from '../../mock/tourAndGuideData';
import { NOVAGuideIcon } from './NOVAGuideChat';
import { TravelBotVector } from './TravelBotVector';
import { MarkdownContent } from './MarkdownContent';

interface NOVAGuideFloatingWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectPackage?: (pkg: TravelPackage) => void;
}

export const NOVAGuideFloatingWidget: React.FC<NOVAGuideFloatingWidgetProps> = ({
  isOpen,
  onToggle,
  onSelectPackage
}) => {
  const [messages, setMessages] = useState<NOVAGuideMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi! I'm **NOVA Guide**, your AI travel companion. What would you like to discover today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '📸 Upload photo to identify a landmark',
        '🗺 Plan a 1-day itinerary',
        '💰 Recommend packages within budget'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isProcessing]);

  // Prevent background page scrolling when displayed all over the page
  useEffect(() => {
    if (isOpen && isMaximized) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, isMaximized]);

  // Press ESC to close/minimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (queryText?: string, presetImage?: string) => {
    const text = queryText !== undefined ? queryText : inputQuery;
    if (!text.trim() && !selectedFile && !presetImage) return;

    const userMessage: NOVAGuideMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text || (selectedFile ? 'Uploaded image for analysis' : 'Discover this location'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imagePreview: filePreview || presetImage || undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    const fileToAnalyze = selectedFile;
    setSelectedFile(null);
    setFilePreview(null);
    setIsProcessing(true);

    const botResponse = await novaGuideService.processUserQuery(
      text,
      fileToAnalyze || presetImage
    );

    setIsProcessing(false);
    setMessages((prev) => [...prev, botResponse]);
  };

  const quickActions = [
    {
      id: 'identify',
      label: '📸 Identify Landmark',
      action: () => fileInputRef.current?.click()
    },
    {
      id: 'plan-day',
      label: '🗺 Plan My Day',
      action: () => handleSend('Plan a 1-day itinerary for Sri Lanka')
    },
    {
      id: 'food',
      label: "🍛 What's This Food?",
      action: () => handleSend('What is this authentic Sri Lankan dish?', '/assets/destinations/Nilaweli.png')
    },
    {
      id: 'visit',
      label: '📍 What Should I Visit?',
      action: () => handleSend('What are the best places to visit in Ella and Kandy?')
    },
    {
      id: 'budget',
      label: '💰 Travel Within Budget',
      action: () => handleSend('I have 5 days in Sri Lanka with a budget of $600')
    },
    {
      id: 'transport',
      label: '🚗 How Do I Get There?',
      action: () => handleSend('How do I travel from Kandy to Ella by train?')
    },
    {
      id: 'culture',
      label: '🏛 Heritage & Culture',
      action: () => handleSend('Tell me about Sigiriya Rock Fortress history', '/assets/destinations/sigiriya.jpg')
    }
  ];

  return (
    <>
      {/* FLOATING ACTION BUTTON (BOTTOM-RIGHT CORNER) - Shown when closed or docked */}
      {(!isOpen || !isMaximized) && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {!isOpen && (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0B3A53] text-white text-xs font-extrabold shadow-2xl border border-[#16A6A1]/40">
              <Bot className="w-3.5 h-3.5 text-teal-300" />
              <span>Ask NOVA Guide</span>
            </div>
          )}

          <button
            onClick={onToggle}
            aria-label="Open NOVA AI Guide"
            className="relative group transition-transform duration-300 hover:scale-110 cursor-pointer focus:outline-none"
          >
            {isOpen ? (
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0B3A53] to-[#146C86] shadow-2xl border-2 border-white/40 flex items-center justify-center text-white">
                <X className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]">
                <TravelBotVector className="w-full h-full" />
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"></span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* CHAT DISPLAY: ALL OVER THE PAGE (FULLSCREEN) OR DOCKED WINDOW */}
      {isOpen && (
        <div
          className={
            isMaximized
              ? "fixed inset-0 z-50 w-full h-full bg-white flex flex-col overflow-hidden animate-in fade-in duration-200"
              : "fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[500px] md:w-[560px] lg:w-[600px] h-[660px] max-h-[88vh] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-300"
          }
        >
          {/* HEADER */}
          <div className="bg-[#0B3A53] px-4 sm:px-8 py-3.5 sm:py-4.5 border-b border-white/10 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900/80 border border-[#16A6A1]/40 flex items-center justify-center p-1 shadow-inner shrink-0">
                <TravelBotVector className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#16A6A1] text-xs font-black tracking-wider uppercase">✦ NOVA GUIDE</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isMaximized && (
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 text-teal-200 text-[11px] font-semibold">
                      Sri Lanka Travel AI Companion
                    </span>
                  )}
                </div>
                <h4 className="text-white text-sm sm:text-base font-extrabold font-heading">
                  AI Travel Guide
                </h4>
              </div>
            </div>

            {/* HEADER CONTROLS */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Maximize / Dock Toggle */}
              <button
                onClick={() => setIsMaximized((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-transparent hover:border-white/20"
                title={isMaximized ? "Switch to Floating Window" : "Display all over the page"}
              >
                {isMaximized ? (
                  <>
                    <Minimize2 className="w-4 h-4 text-teal-300" />
                    <span className="hidden sm:inline">Docked Window</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 text-teal-300" />
                    <span className="hidden sm:inline">All Over Page</span>
                  </>
                )}
              </button>

              <button
                onClick={onToggle}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                onClick={onToggle}
                className="p-2 rounded-xl hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGES THREAD */}
          <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-slate-50/70">
            <div className={isMaximized ? "max-w-4xl lg:max-w-5xl mx-auto space-y-6 w-full" : "space-y-4 w-full"}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900 border border-[#16A6A1]/40 flex items-center justify-center shrink-0 p-1 shadow-xs mt-0.5">
                      <TravelBotVector className="w-8 h-8 sm:w-9 sm:h-9" />
                    </div>
                  )}

                  <div
                    className={`${isMaximized ? 'max-w-[82%]' : 'max-w-[85%]'} rounded-3xl p-4 sm:p-5 text-sm sm:text-[15px] space-y-2.5 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#0B3A53] text-white rounded-tr-none shadow-md font-medium'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {/* IMAGE PREVIEW IN THREAD */}
                    {msg.imagePreview && (
                      <div className="rounded-2xl overflow-hidden max-h-72 w-full bg-slate-900 border border-slate-200 shadow-inner">
                        <img
                          src={msg.imagePreview}
                          alt="Uploaded snippet"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <MarkdownContent content={msg.text} isUser={msg.sender === 'user'} />

                    {/* INLINE PACKAGE RECOMMENDATION */}
                    {msg.recommendedPackage && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-[#16A6A1] tracking-wider">
                            Package Match
                          </span>
                          <span className="text-xs font-bold text-[#0B3A53]">{msg.recommendedPackage.duration}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={msg.recommendedPackage.imageUrl}
                            alt={msg.recommendedPackage.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-xs"
                          />
                          <div>
                            <h5 className="font-extrabold text-slate-900 text-sm font-heading">
                              {msg.recommendedPackage.name}
                            </h5>
                            <span className="text-xs font-black text-[#0B3A53] block">
                              {msg.recommendedPackage.priceFrom}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (onSelectPackage) onSelectPackage(msg.recommendedPackage!);
                            onToggle();
                          }}
                          className="w-full py-2 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* SUGGESTIONS */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(sug)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#16A6A1] hover:text-white text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer text-left shadow-2xs"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[10px] text-right font-medium ${
                        msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-9 h-9 rounded-2xl bg-[#0B3A53] text-[#16A6A1] flex items-center justify-center shrink-0 p-1 shadow-xs">
                    <NOVAGuideIcon className="w-5 h-5" />
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-2.5 shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#16A6A1]" />
                    <span>NOVA Guide is analyzing and typing...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* INPUT FORM */}
          <div className="p-3.5 sm:p-5 bg-white border-t border-slate-200 shrink-0 shadow-lg">
            <div className={isMaximized ? "max-w-4xl lg:max-w-5xl mx-auto space-y-3 w-full" : "space-y-2.5 w-full"}>
              {filePreview && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 border border-slate-200 w-fit">
                  <img src={filePreview} alt="Selected" className="w-9 h-9 rounded-lg object-cover" />
                  <span className="text-xs text-slate-700 font-semibold truncate max-w-[200px]">
                    {selectedFile?.name}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0 border border-slate-200 flex items-center justify-center hover:scale-105 shadow-xs"
                  title="Upload Photo (Landmark, Food, Temple...)"
                >
                  <Paperclip className="w-5 h-5 text-[#16A6A1]" />
                </button>

                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask NOVA Guide anything about Sri Lanka, attractions, packing, trains, food..."
                  className="flex-1 px-4 sm:px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm sm:text-base font-medium focus:outline-none focus:border-[#16A6A1] text-slate-900 shadow-inner"
                />

                <button
                  type="submit"
                  disabled={(!inputQuery.trim() && !selectedFile) || isProcessing}
                  className="w-12 h-12 rounded-2xl bg-[#0B3A53] hover:bg-[#146C86] disabled:opacity-50 text-white transition-all cursor-pointer shrink-0 flex items-center justify-center hover:scale-105 shadow-md"
                >
                  <Send className="w-5 h-5 text-[#16A6A1]" />
                </button>
              </form>

              {/* QUICK ACTIONS ROW */}
              <div className="overflow-x-auto pb-1 flex items-center gap-2 text-xs no-scrollbar">
                {quickActions.map((qa) => (
                  <button
                    key={qa.id}
                    onClick={qa.action}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B3A53] hover:text-white text-slate-700 font-bold transition-all shrink-0 border border-slate-200/80 cursor-pointer text-xs sm:text-[13px] shadow-2xs whitespace-nowrap"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
