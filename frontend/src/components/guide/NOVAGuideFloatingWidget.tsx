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
  Bot
} from 'lucide-react';
import { novaGuideService, NOVAGuideMessage } from '../../services/novaGuideService';
import { TravelPackage } from '../../mock/tourAndGuideData';
import { NOVAGuideIcon } from './NOVAGuideChat';
import { TravelBotVector } from './TravelBotVector';

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isProcessing]);

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
      label: '📸 Identify This',
      action: () => fileInputRef.current?.click()
    },
    {
      id: 'plan-day',
      label: '🗺 Plan My Day',
      action: () => handleSend('Plan my day itinerary for Sri Lanka')
    },
    {
      id: 'food',
      label: "🍛 What's This Food?",
      action: () => handleSend('What is this authentic Sri Lankan dish?', '/assets/destinations/Nilaweli.png')
    },
    {
      id: 'visit',
      label: '📍 What Should I Visit?',
      action: () => handleSend('What should I visit in Kandy and Ella?')
    },
    {
      id: 'budget',
      label: '💰 Plan Within My Budget',
      action: () => handleSend('I have 5 days in Sri Lanka and a budget of $600')
    },
    {
      id: 'transport',
      label: '🚗 How Do I Get There?',
      action: () => handleSend('How do I travel from Kandy to Ella?')
    },
    {
      id: 'culture',
      label: '🏛 Tell Me About This Place',
      action: () => handleSend('Tell me about Sigiriya Rock Fortress history', '/assets/destinations/sigiriya.jpg')
    }
  ];

  return (
    <>
      {/* FLOATING ACTION BUTTON (BOTTOM-RIGHT CORNER) */}
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

      {/* POPPING CHAT DRAWER / WINDOW */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[440px] md:w-[480px] h-[580px] max-h-[82vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-300">
          
          {/* HEADER */}
          <div className="bg-[#0B3A53] px-5 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-[#16A6A1]/40 flex items-center justify-center p-1 shadow-inner">
                <TravelBotVector className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#16A6A1] text-[11px] font-black tracking-wider uppercase">✦ NOVA GUIDE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <h4 className="text-white text-xs font-extrabold font-heading">
                  AI Travel Companion
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggle}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGES THREAD */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/60 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-[#16A6A1]/40 flex items-center justify-center shrink-0 p-0.5 shadow-xs mt-1">
                    <TravelBotVector className="w-7 h-7" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-[#0B3A53] text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                  }`}
                >
                  {/* IMAGE PREVIEW IN THREAD */}
                  {msg.imagePreview && (
                    <div className="rounded-xl overflow-hidden max-h-40 w-full bg-slate-900 border border-slate-200">
                      <img
                        src={msg.imagePreview}
                        alt="Uploaded snippet"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="whitespace-pre-line leading-relaxed font-medium">
                    {msg.text}
                  </div>

                  {/* INLINE PACKAGE RECOMMENDATION */}
                  {msg.recommendedPackage && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-[#16A6A1]">
                          Package Match
                        </span>
                        <span className="text-[10px] font-bold text-[#0B3A53]">{msg.recommendedPackage.duration}</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <img
                          src={msg.recommendedPackage.imageUrl}
                          alt={msg.recommendedPackage.name}
                          className="w-11 h-11 rounded-lg object-cover shrink-0"
                        />
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-xs font-heading">
                            {msg.recommendedPackage.name}
                          </h5>
                          <span className="text-[11px] font-black text-[#0B3A53] block">
                            {msg.recommendedPackage.priceFrom}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onSelectPackage) onSelectPackage(msg.recommendedPackage!);
                          onToggle();
                        }}
                        className="w-full py-1.5 rounded-lg bg-[#0B3A53] hover:bg-[#146C86] text-white text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* SUGGESTIONS */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#16A6A1] hover:text-white text-slate-700 text-[10px] font-bold transition-all border border-slate-200 cursor-pointer text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[9px] text-right ${
                      msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-2 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-[#0B3A53] text-[#16A6A1] flex items-center justify-center shrink-0 p-1">
                  <NOVAGuideIcon className="w-4 h-4" />
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16A6A1]" />
                  <span>NOVA Guide analyzing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT FORM */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2 shrink-0">
            {filePreview && (
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-100 border border-slate-200 w-fit">
                <img src={filePreview} alt="Selected" className="w-6 h-6 rounded-md object-cover" />
                <span className="text-[11px] text-slate-700 font-semibold truncate max-w-[120px]">
                  {selectedFile?.name}
                </span>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
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
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0 border border-slate-200"
                title="Upload Photo"
              >
                <Paperclip className="w-4 h-4 text-[#16A6A1]" />
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask NOVA Guide..."
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#16A6A1] text-slate-900"
              />

              <button
                type="submit"
                disabled={(!inputQuery.trim() && !selectedFile) || isProcessing}
                className="p-2.5 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] disabled:opacity-50 text-white transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 text-[#16A6A1]" />
              </button>
            </form>

            {/* QUICK ACTIONS ROW */}
            <div className="overflow-x-auto pb-1 flex items-center gap-1.5 text-[10px] no-scrollbar">
              {quickActions.map((qa) => (
                <button
                  key={qa.id}
                  onClick={qa.action}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0B3A53] hover:text-white text-slate-700 font-bold transition-all shrink-0 border border-slate-200/80 cursor-pointer"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </>
  );
};
