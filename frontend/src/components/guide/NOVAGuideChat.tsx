import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Sparkles,
  Paperclip,
  Send,
  Camera,
  Utensils,
  Calendar,
  DollarSign,
  Navigation,
  Landmark,
  Image as ImageIcon,
  Loader2,
  ArrowRight,
  X
} from 'lucide-react';
import { novaGuideService, NOVAGuideMessage } from '../../services/novaGuideService';
import { TravelPackage } from '../../mock/tourAndGuideData';
import pickmeLogoImg from '../../assets/pickme-logo.png';
import { PickMeLogo } from '../icons/PickMeLogo';

// Minimal AI Icon: Compass
export const NOVAGuideIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <Compass className="w-full h-full text-[#16A6A1]" />
  </div>
);

interface NOVAGuideChatProps {
  onSelectPackage?: (pkg: TravelPackage) => void;
}

export const NOVAGuideChat: React.FC<NOVAGuideChatProps> = ({ onSelectPackage }) => {
  const [messages, setMessages] = useState<NOVAGuideMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hi! I'm **NOVA Guide**, your AI travel companion. What would you like to discover today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '📸 Upload an image to identify a landmark',
        '🗺 Plan a 1-day itinerary for Sri Lanka',
        '💰 Recommend packages within my budget'
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

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

  // Quick Action Buttons definitions
  const quickActions = [
    {
      id: 'identify',
      label: '📸 Identify This',
      desc: 'Upload an image & discover what you looking at',
      icon: <Camera className="w-4 h-4 text-[#16A6A1]" />,
      action: () => fileInputRef.current?.click()
    },
    {
      id: 'plan-day',
      label: '🗺 Plan My Day',
      desc: 'Generate a personalized day itinerary',
      icon: <Calendar className="w-4 h-4 text-[#16A6A1]" />,
      action: () => handleSend('Plan my day itinerary for Sri Lanka')
    },
    {
      id: 'food',
      label: "🍛 What's This Food?",
      desc: 'Upload food & learn what it is',
      icon: <Utensils className="w-4 h-4 text-[#16A6A1]" />,
      action: () => handleSend('What is this authentic Sri Lankan dish?', '/assets/destinations/Nilaweli.png')
    },
    {
      id: 'visit',
      label: '📍 What Should I Visit?',
      desc: 'Get recommendations for selected destination',
      icon: <MapPin className="w-4 h-4 text-[#16A6A1]" />,
      action: () => handleSend('What should I visit in Kandy and Ella?')
    },
    {
      id: 'budget',
      label: '💰 Plan Within My Budget',
      desc: 'Get travel recommendations based on a budget',
      icon: <DollarSign className="w-4 h-4 text-[#16A6A1]" />,
      action: () => handleSend('I have 5 days in Sri Lanka and a budget of $600')
    },
    {
      id: 'transport',
      label: '🚗 How Do I Get There?',
      desc: 'Get transportation suggestions',
      icon: <Navigation className="w-4 h-4 text-[#16A6A1]" />,
      action: () => handleSend('How do I travel from Kandy to Ella?')
    },
    {
      id: 'culture',
      label: '🏛 Tell Me About This Place',
      desc: 'Learn about landmarks, history and culture',
      icon: <Landmark className="w-4 h-4 text-[#16A6A1]" />,
      action: () => handleSend('Tell me about Sigiriya Rock Fortress history', '/assets/destinations/sigiriya.jpg')
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-4xl mx-auto my-6">
      
      {/* CHAT HEADER */}
      <div className="bg-[#0B3A53] px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900/80 border border-[#16A6A1]/40 flex items-center justify-center p-2 shadow-inner">
            <NOVAGuideIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#16A6A1] text-xs font-black tracking-widest uppercase">✦ NOVA GUIDE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h3 className="text-white text-sm font-extrabold font-heading">
              Your AI Travel Companion
            </h3>
          </div>
        </div>

        <span className="text-xs text-slate-300 font-medium hidden sm:inline-block bg-white/10 px-3 py-1 rounded-full border border-white/10">
          Visual Recognition & AI Assistance
        </span>
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <div className="p-6 h-[420px] overflow-y-auto bg-slate-50/50 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-xl bg-[#0B3A53] text-[#16A6A1] flex items-center justify-center shrink-0 p-1.5 shadow-sm mt-1">
                <NOVAGuideIcon className="w-5 h-5" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-[#0B3A53] text-white rounded-tr-none shadow-sm'
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
              }`}
            >
              {/* IMAGE PREVIEW IN THREAD */}
              {msg.imagePreview && (
                <div className="rounded-xl overflow-hidden max-h-48 w-full bg-slate-900 border border-slate-200">
                  <img
                    src={msg.imagePreview}
                    alt="Uploaded snippet"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* TEXT CONTENT */}
              <div className="whitespace-pre-line leading-relaxed font-medium">
                {msg.text}
              </div>

              {/* INLINE PACKAGE RECOMMENDATION */}
              {msg.recommendedPackage && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#16A6A1] tracking-wider">
                      Recommended Package Match
                    </span>
                    <span className="text-xs font-bold text-[#0B3A53]">{msg.recommendedPackage.duration}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={msg.recommendedPackage.imageUrl}
                      alt={msg.recommendedPackage.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm font-heading">
                        {msg.recommendedPackage.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {msg.recommendedPackage.destinationsList.join(' · ')}
                      </p>
                      <span className="text-xs font-black text-[#0B3A53] block pt-0.5">
                        {msg.recommendedPackage.priceFrom}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPackage && onSelectPackage(msg.recommendedPackage!)}
                    className="w-full py-2 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Package Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* INLINE PICKME TRANSPORTATION PARTNER CARD */}
              {msg.showPickMePartnerCard && (
                <div className="mt-3 p-4 rounded-2xl bg-gradient-to-r from-[#0B3A53] to-[#146C86] text-white border border-[#16A6A1]/40 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-teal-300 tracking-wider">
                      TRANSPORTATION PARTNER
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#16A6A1] text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      10% OFF
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 pt-0.5">
                      <img src={pickmeLogoImg} alt="PickMe Logo" className="h-9 w-auto object-contain rounded-xl drop-shadow-md" />
                      <span className="text-[10px] text-teal-200 font-medium">· Sri Lanka's Partner</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium pt-1">
                      Enjoy 10% off eligible rides with PickMe when traveling across Sri Lanka.
                    </p>
                  </div>

                  <a
                    href="https://pickme.lk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#16A6A1] to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
                  >
                    <span>Get 10% Off with PickMe →</span>
                  </a>
                </div>
              )}

              {/* SUGGESTION CHIPS */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sug)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#16A6A1] hover:text-white text-slate-700 text-[11px] font-bold transition-all border border-slate-200 cursor-pointer text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] text-right ${
                  msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-black text-xs mt-1">
                You
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-[#0B3A53] text-[#16A6A1] flex items-center justify-center shrink-0 p-1.5">
              <NOVAGuideIcon className="w-5 h-5" />
            </div>
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#16A6A1]" />
              <span>NOVA Guide is analyzing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-3">
        {filePreview && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 border border-slate-200 w-fit">
            <img src={filePreview} alt="Selected" className="w-8 h-8 rounded-lg object-cover" />
            <span className="text-xs text-slate-700 font-semibold truncate max-w-[150px]">
              {selectedFile?.name || 'Selected photo'}
            </span>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
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
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0 border border-slate-200 flex items-center gap-1 text-xs font-bold"
            title="Upload photo of landmark, food, building, etc."
          >
            <Paperclip className="w-4 h-4 text-[#16A6A1]" />
            <span className="hidden sm:inline">Upload Image</span>
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about your journey..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20 transition-all text-slate-900"
          />

          <button
            type="submit"
            disabled={(!inputQuery.trim() && !selectedFile) || isProcessing}
            className="px-5 py-3 rounded-2xl bg-[#0B3A53] hover:bg-[#146C86] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#0B3A53]/20 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span className="hidden sm:inline">Send</span>
            <Send className="w-4 h-4 text-[#16A6A1]" />
          </button>
        </form>

        {/* QUICK ACTION BUTTONS ROW */}
        <div className="pt-2 border-t border-slate-100 overflow-x-auto pb-1 flex items-center gap-2 text-xs no-scrollbar">
          {quickActions.map((qa) => (
            <button
              key={qa.id}
              onClick={qa.action}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B3A53] hover:text-white text-slate-700 font-bold transition-all shrink-0 border border-slate-200/80 flex items-center gap-1.5 cursor-pointer group"
              title={qa.desc}
            >
              {qa.icon}
              <span>{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
