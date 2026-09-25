import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Bot,
  Sparkles,
  Search,
  Send,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Ticket,
  ShieldCheck,
  Compass,
  CheckCircle2,
  ChevronRight,
  Info,
  HelpCircle,
  Camera,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  BookOpen,
  Award
} from 'lucide-react';
import {
  aiBotGuideService,
  RecognizedLandmark,
  BotChatMessage,
  LANDMARK_KNOWLEDGE_BASE
} from '../../services/aiBotGuideService';

interface AIBotGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLandmarkId?: string;
}

export const AIBotGuideModal: React.FC<AIBotGuideModalProps> = ({
  isOpen,
  onClose,
  initialLandmarkId
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'chat'>('scan');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [activeLandmark, setActiveLandmark] = useState<RecognizedLandmark | null>(null);
  const [activeTabSection, setActiveTabSection] = useState<'info' | 'history' | 'tips'>('info');

  // Chat State
  const [chatMessages, setChatMessages] = useState<BotChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: 'Ayubowan! 🇱🇰 I am your **NOVA AI Bot Guide**. Upload a picture of any landmark, temple, wildlife, or food, or ask me any question about traveling in Sri Lanka!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'What is the best time to visit Sigiriya?',
        'What should I wear at Buddhist temples?',
        'How to travel from Kandy to Ella?'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Text-to-Speech / Audio State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, isTyping]);

  // Handle initial landmark if passed
  useEffect(() => {
    if (isOpen && initialLandmarkId) {
      const landmark = LANDMARK_KNOWLEDGE_BASE.find((l) => l.id === initialLandmarkId);
      if (landmark) {
        handleSelectPreset(landmark);
      }
    }
  }, [isOpen, initialLandmarkId]);

  if (!isOpen) return null;

  // Handle preset landmark select
  const handleSelectPreset = async (landmark: RecognizedLandmark) => {
    setIsAnalyzing(true);
    setUploadedImagePreview(landmark.imageUrl);
    setActiveLandmark(null);

    const result = await aiBotGuideService.analyzeImage(landmark.imageUrl);
    setIsAnalyzing(false);
    setActiveLandmark(result.landmark);

    // Append recognition msg to chat
    setChatMessages((prev) => [...prev, result.initialMessage]);
  };

  // Handle file input upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const previewUrl = reader.result as string;
      setUploadedImagePreview(previewUrl);
      setIsAnalyzing(true);
      setActiveLandmark(null);

      const result = await aiBotGuideService.analyzeImage(file);
      setIsAnalyzing(false);
      setActiveLandmark(result.landmark);

      setChatMessages((prev) => [...prev, result.initialMessage]);
    };
    reader.readAsDataURL(file);
  };

  // Handle chat submit
  const handleSendChat = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: BotChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    const botReply = await aiBotGuideService.sendQuestion(textToSend, activeLandmark || undefined);
    setIsTyping(false);
    setChatMessages((prev) => [...prev, botReply]);
  };

  // Handle TTS Speak
  const toggleTTS = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const cleanText = textToSpeak.replace(/[*_#`[\]()]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] max-h-[850px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-[#0B3A53] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16A6A1] to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-[#16A6A1]/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white font-heading tracking-tight">
                  NOVA AI Bot Guide
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AI Vision & Chat
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                24/7 Intelligent Visual Recognition & Travel Companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* TABS SWITCHER */}
            <div className="bg-white/10 p-1 rounded-2xl flex items-center text-xs font-bold border border-white/15">
              <button
                onClick={() => setActiveTab('scan')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'scan'
                    ? 'bg-[#16A6A1] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap & Identify</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-[#16A6A1] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Bot Guide ({chatMessages.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          {activeTab === 'scan' ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* UPLOAD & PRESETS SECTION */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-black text-[#0B3A53] font-heading flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#16A6A1]" />
                      Upload Picture or Choose Preset Landmark
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Upload any photo from your device, or click one of our popular Sri Lankan attraction samples to test the AI Bot Guide.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-2xl bg-[#0B3A53] hover:bg-[#146C86] text-white text-xs font-bold transition-all shadow-md shadow-[#0B3A53]/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Custom Photo</span>
                  </button>
                </div>

                {/* PRESET SAMPLES GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
                  {LANDMARK_KNOWLEDGE_BASE.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectPreset(item)}
                      className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all duration-200 aspect-square ${
                        activeLandmark?.id === item.id
                          ? 'border-[#16A6A1] ring-4 ring-[#16A6A1]/20 scale-105'
                          : 'border-slate-200 hover:border-[#16A6A1]/50 hover:scale-102'
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[10px] font-black text-white line-clamp-1 leading-tight">
                          {item.name.split('(')[0]}
                        </span>
                        <span className="text-[9px] text-slate-300 font-medium">
                          {item.province.split(' ')[0]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI ANALYZING STATE */}
              {isAnalyzing && (
                <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-4 animate-in fade-in duration-300">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-[#16A6A1]/20 border-t-[#16A6A1] animate-spin"></div>
                    <div className="w-full h-full rounded-full flex items-center justify-center text-[#16A6A1]">
                      <Bot className="w-8 h-8 animate-bounce" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-[#0B3A53] font-heading">
                      AI Vision Analyzing Photo...
                    </h4>
                    <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                      Matching visual features with our Sri Lanka cultural & natural heritage neural database...
                    </p>
                  </div>
                </div>
              )}

              {/* RECOGNIZED LANDMARK RESULT CARD */}
              {activeLandmark && !isAnalyzing && (
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
                  
                  {/* HERO BANNER & OVERLAY */}
                  <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
                    <img
                      src={uploadedImagePreview || activeLandmark.imageUrl}
                      alt={activeLandmark.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                    {/* TOP BADGES */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 border border-white/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{Math.round(activeLandmark.confidenceScore * 100)}% Match</span>
                        </span>

                        {activeLandmark.unsecoSite && (
                          <span className="px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-slate-950 text-xs font-black shadow-md flex items-center gap-1 border border-white/20">
                            <Award className="w-3.5 h-3.5" />
                            <span>UNESCO World Heritage</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => toggleTTS(`${activeLandmark.name}. ${activeLandmark.shortDesc}. ${activeLandmark.history}`)}
                        className={`p-2.5 rounded-full backdrop-blur-md text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                          isSpeaking
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-slate-900/80 text-white hover:bg-slate-900'
                        }`}
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isSpeaking ? 'Stop Audio' : 'Listen to Audio Guide'}</span>
                      </button>
                    </div>

                    {/* HERO TITLE BLOCK */}
                    <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-[#16A6A1] uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" />
                        <span>{activeLandmark.location} • {activeLandmark.province}</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black font-heading leading-tight flex items-baseline gap-3">
                        <span>{activeLandmark.name}</span>
                        {activeLandmark.nativeName && (
                          <span className="text-base font-normal text-slate-300 font-sans">
                            ({activeLandmark.nativeName})
                          </span>
                        )}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-2xl">
                        {activeLandmark.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* DETAILS NAVIGATION TABS */}
                  <div className="border-b border-slate-200 bg-slate-50/80 px-6 flex items-center gap-4 text-xs font-bold text-slate-600">
                    <button
                      onClick={() => setActiveTabSection('info')}
                      className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTabSection === 'info'
                          ? 'border-[#16A6A1] text-[#16A6A1]'
                          : 'border-transparent hover:text-slate-900'
                      }`}
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Visitor & Ticket Info</span>
                    </button>
                    <button
                      onClick={() => setActiveTabSection('history')}
                      className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTabSection === 'history'
                          ? 'border-[#16A6A1] text-[#16A6A1]'
                          : 'border-transparent hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>History & Lore</span>
                    </button>
                    <button
                      onClick={() => setActiveTabSection('tips')}
                      className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTabSection === 'tips'
                          ? 'border-[#16A6A1] text-[#16A6A1]'
                          : 'border-transparent hover:text-slate-900'
                      }`}
                    >
                      <Compass className="w-4 h-4" />
                      <span>Highlights & Insider Secrets</span>
                    </button>
                  </div>

                  {/* DETAILS CONTENT BODY */}
                  <div className="p-6 space-y-6">
                    {activeTabSection === 'info' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#146C86]">
                            <Clock className="w-4 h-4" />
                            <span>Best Time to Visit</span>
                          </div>
                          <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                            {activeLandmark.visitorInfo.bestTimeToVisit}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#146C86]">
                            <Ticket className="w-4 h-4" />
                            <span>Entry Ticket Costs</span>
                          </div>
                          <div className="text-xs text-slate-700 font-semibold space-y-0.5">
                            <p>Foreign Adult: <span className="font-bold text-[#0B3A53]">{activeLandmark.visitorInfo.entryFee.foreignAdult}</span></p>
                            <p>Foreign Child: <span className="font-bold text-[#0B3A53]">{activeLandmark.visitorInfo.entryFee.foreignChild}</span></p>
                            <p>Local Adult: <span className="font-bold text-slate-500">{activeLandmark.visitorInfo.entryFee.localAdult}</span></p>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5 sm:col-span-2 md:col-span-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#146C86]">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Dress Code & Etiquette</span>
                          </div>
                          <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                            {activeLandmark.visitorInfo.dressCodeEtiquette}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTabSection === 'history' && (
                      <div className="space-y-4">
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                          <h4 className="text-sm font-black text-[#0B3A53] uppercase tracking-wider">
                            Historical Background
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                            {activeLandmark.history}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTabSection === 'tips' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-xs font-extrabold text-[#146C86] uppercase tracking-wider">
                            Key Highlights
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeLandmark.highlights.map((item, idx) => (
                              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#16A6A1] shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                            🤫 Insider Secrets & Hidden Tips
                          </h4>
                          <div className="space-y-2">
                            {activeLandmark.insiderSecrets.map((secret, idx) => (
                              <div key={idx} className="bg-amber-500/10 p-3 rounded-xl border border-amber-300/40 text-xs font-medium text-slate-800 flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span>{secret}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ASK BOT ABOUT THIS LANDMARK ACTION BAR */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-xs font-black text-[#0B3A53] uppercase tracking-wider">
                          Have a Question About {activeLandmark.name.split('(')[0]}?
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Ask the AI Bot Guide for directions, travel routes, nearby restaurants, or safety advice.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {activeLandmark.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveTab('chat');
                              handleSendChat(q);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#16A6A1] hover:text-white text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{q}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          ) : (
            /* TAB 2: INTERACTIVE CHATBOT */
            <div className="max-w-3xl mx-auto h-full flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
              
              {/* CHAT MESSAGES LIST */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0B3A53] to-[#16A6A1] text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm space-y-2 ${
                        msg.sender === 'user'
                          ? 'bg-[#0B3A53] text-white rounded-tr-none shadow-sm'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed font-medium">
                        {msg.text}
                      </div>

                      <div
                        className={`text-[10px] text-right ${
                          msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>

                      {/* SUGGESTED ACTIONS CHIPS */}
                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {msg.suggestedActions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendChat(action)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-[#16A6A1] hover:text-white text-slate-700 text-[11px] font-semibold transition-colors border border-slate-200 cursor-pointer text-left"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-extrabold text-xs shadow-xs mt-1">
                        You
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start items-center">
                    <div className="w-8 h-8 rounded-xl bg-[#0B3A53] text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white rounded-2xl p-3 border border-slate-200 text-xs font-semibold text-slate-500 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#16A6A1]" />
                      <span>NOVA AI Bot Guide is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* CHAT INPUT BAR */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder={
                      activeLandmark
                        ? `Ask anything about ${activeLandmark.name.split('(')[0]}...`
                        : 'Ask your AI Bot Guide anything about Sri Lanka travel...'
                    }
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20 transition-all text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isTyping}
                    className="px-5 py-3 rounded-2xl bg-[#16A6A1] hover:bg-[#146C86] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#16A6A1]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* QUICK SUGGESTIONS ROW */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-bold text-slate-500 no-scrollbar">
                  <span className="shrink-0 text-slate-400">Quick Ask:</span>
                  <button
                    onClick={() => handleSendChat('What is the best weather season in Sri Lanka?')}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 cursor-pointer"
                  >
                    ☀️ Best Weather
                  </button>
                  <button
                    onClick={() => handleSendChat('How do I book tickets for Kandy to Ella train?')}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 cursor-pointer"
                  >
                    🚂 Train Tickets
                  </button>
                  <button
                    onClick={() => handleSendChat('What are the top local Sri Lankan dishes to try?')}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 cursor-pointer"
                  >
                    🍲 Local Food Guide
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
