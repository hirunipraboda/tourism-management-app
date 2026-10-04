import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Compass,
  Paperclip,
  Send,
  Loader2,
  X,
  Plus,
  Trash2,
  MessageSquare,
  Image as ImageIcon,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import {
  createChatSession,
  listChatSessions,
  getChatSession,
  deleteChatSession,
  sendChatMessage,
  fetchUserPackageStatus,
  ChatSessionSummary,
  ChatMessage,
  UserPackageStatus,
} from '../../services/novaGuideService';
import { MarkdownContent } from './MarkdownContent';

// ─── Icon ─────────────────────────────────────────────────────────────────────
export const NOVAGuideIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <Compass className="w-full h-full text-[#16A6A1]" />
  </div>
);

// ─── Types for local UI state ─────────────────────────────────────────────────
interface UIMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  imagePreview?: string; // data URL for display
  timestamp: string;
  isError?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface NOVAGuideChatProps {
  /** Optional: called when a package/tour suggestion is clicked */
  onSelectPackage?: (name: string) => void;
}

export const NOVAGuideChat: React.FC<NOVAGuideChatProps> = () => {
  // ── Session & Package state ─────────────────────────────────────────────
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [packageStatus, setPackageStatus] = useState<UserPackageStatus | null>(null);

  // ── Input state ──────────────────────────────────────────────────────────
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // ── Load sessions & package status ─────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const [list, pkg] = await Promise.allSettled([
        listChatSessions(),
        fetchUserPackageStatus(),
      ]);
      if (list.status === 'fulfilled') setSessions(list.value);
      if (pkg.status === 'fulfilled') setPackageStatus(pkg.value);
    } catch {
      // silently fail — user may not be logged in
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ── Load session messages ────────────────────────────────────────────────
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    setIsLoadingHistory(true);
    setMessages([]);
    try {
      const session = await getChatSession(sessionId);
      const uiMsgs: UIMessage[] = session.messages.map((m: ChatMessage) => ({
        id: m.id,
        role: m.role === 'USER' ? 'user' : 'bot',
        text: m.content,
        imagePreview: m.imageBase64 && m.imageMime
          ? `data:${m.imageMime};base64,${m.imageBase64}`
          : undefined,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      if (uiMsgs.length === 0) {
        setMessages([welcomeMessage()]);
      } else {
        setMessages(uiMsgs);
      }
    } catch (err) {
      setError('Failed to load conversation history.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // ── Start a new conversation ─────────────────────────────────────────────
  const startNewSession = async () => {
    setError(null);
    try {
      const session = await createChatSession();
      setActiveSessionId(session.id);
      setMessages([welcomeMessage()]);
      await loadSessions();
      setShowSidebar(false);
    } catch (err: any) {
      setError(err.message || 'Could not start a new conversation. Please log in.');
    }
  };

  // ── Select existing session ──────────────────────────────────────────────
  const selectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setShowSidebar(false);
    await loadSessionMessages(sessionId);
  };

  // ── Delete session ───────────────────────────────────────────────────────
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChatSession(sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      await loadSessions();
    } catch {
      setError('Failed to delete conversation.');
    }
  };

  // ── Initialize with welcome on first mount (no session yet) ─────────────
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([welcomeMessage()]);
    }
  }, []);

  // ── File selection ───────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported image format. Please use JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large. Maximum size is 5MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async (overrideText?: string) => {
    const text = overrideText !== undefined ? overrideText : inputText;

    if (!text.trim() && !selectedFile) return;
    if (isProcessing) return;

    setError(null);

    // Ensure we have an active session
    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const session = await createChatSession(text.length > 50 ? text.substring(0, 47) + '...' : text || 'New Conversation');
        sessionId = session.id;
        setActiveSessionId(sessionId);
        await loadSessions();
      } catch (err: any) {
        setError(err.message || 'Please log in to use the AI Travel Guide.');
        return;
      }
    }

    // Optimistically add user message to UI
    const userMsg: UIMessage = {
      id: `local-user-${Date.now()}`,
      role: 'user',
      text: text.trim() || (selectedFile ? 'Uploaded image for analysis' : ''),
      imagePreview: filePreview || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const fileToSend = selectedFile;
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    clearFile();
    setIsProcessing(true);

    try {
      const result = await sendChatMessage(sessionId, text, fileToSend);

      const botMsg: UIMessage = {
        id: result.messageId,
        role: 'bot',
        text: result.reply,
        timestamp: new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (result.remainingQueries !== undefined) {
        setPackageStatus(prev => prev ? { ...prev, remainingQueries: result.remainingQueries! } : prev);
      }

      setMessages(prev => [...prev, botMsg]);

      // Refresh session list to update title/preview
      loadSessions();
    } catch (err: any) {
      const errorMsg = err.message || 'Something went wrong. Please try again.';
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'bot',
          text: `⚠️ ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Keyboard submit ──────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Quick prompts ────────────────────────────────────────────────────────
  const quickPrompts = [
    '🏔️ Best places to visit in Ella?',
    '🚂 Train from Colombo to Kandy?',
    '🦁 Yala National Park safari tips',
    '🏰 Tell me about Sigiriya history',
    '🍛 Must-try Sri Lankan foods',
    '📅 2-day itinerary for Galle',
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden w-full max-w-6xl mx-auto my-6 sm:my-8 flex" style={{ minHeight: '680px', height: '82vh', maxHeight: '880px' }}>

      {/* ── SESSIONS SIDEBAR ────────────────────────────────────────────── */}
      <div className={`
        flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 overflow-hidden
        ${showSidebar ? 'w-72' : 'w-0'}
      `}>
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-white font-bold text-sm sm:text-base">Conversations</span>
          <button onClick={() => setShowSidebar(false)} className="text-slate-400 hover:text-white cursor-pointer p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={startNewSession}
          className="mx-4 mt-3 mb-2 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#16A6A1]/20 border border-[#16A6A1]/40 text-[#16A6A1] hover:bg-[#16A6A1]/30 text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-6">No conversations yet</p>
          ) : (
            sessions.map(s => (
              <button
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-2.5 group ${
                  activeSessionId === s.id
                    ? 'bg-[#0B3A53] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{s.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all cursor-pointer p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-[#0B3A53] px-5 sm:px-6 py-4.5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setShowSidebar(v => !v)}
              className="w-11 h-11 rounded-2xl bg-slate-900/80 border border-[#16A6A1]/40 flex items-center justify-center hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:scale-105"
              title="Chat history"
            >
              <NOVAGuideIcon className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#16A6A1] text-[11px] font-black tracking-widest uppercase">✦ NOVA GUIDE</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-white text-base sm:text-lg font-black leading-tight">AI Travel Companion</h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {packageStatus && (
              <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>{packageStatus.packageName}</span>
                <span className="opacity-80 font-mono">({packageStatus.remainingQueries} left)</span>
              </span>
            )}
            <span className="hidden md:block text-xs text-slate-300 font-medium bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
              Gemini AI · Sri Lanka Expert
            </span>
            <button
              onClick={startNewSession}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl bg-[#16A6A1]/20 border border-[#16A6A1]/40 text-[#16A6A1] hover:bg-[#16A6A1]/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Start new conversation"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 bg-slate-50/60">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-[#16A6A1] animate-spin" />
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot avatar */}
                {msg.role === 'bot' && (
                  <div className="w-10 h-10 rounded-2xl bg-[#0B3A53] flex items-center justify-center shrink-0 mt-0.5 shadow-md border border-[#16A6A1]/30">
                    <NOVAGuideIcon className="w-6 h-6" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-3xl p-4 sm:p-5 text-sm sm:text-[15px] space-y-2.5 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#0B3A53] text-white rounded-tr-none shadow-md'
                    : msg.isError
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-none shadow-sm'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-sm'
                }`}>
                  {/* Image preview */}
                  {msg.imagePreview && (
                    <div className="rounded-2xl overflow-hidden max-h-72 border border-slate-200 bg-slate-900 shadow-inner">
                      <img src={msg.imagePreview} alt="Uploaded" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Message text */}
                  <MarkdownContent content={msg.text} isUser={msg.role === 'user'} />

                  {/* Timestamp */}
                  <div className={`text-[11px] text-right font-medium ${msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-2xl bg-[#146C86] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-black shadow-md border border-white/20">
                    You
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isProcessing && (
            <div className="flex gap-3.5 items-center">
              <div className="w-10 h-10 rounded-2xl bg-[#0B3A53] flex items-center justify-center shrink-0 shadow-md border border-[#16A6A1]/30">
                <NOVAGuideIcon className="w-6 h-6" />
              </div>
              <div className="bg-white rounded-3xl rounded-tl-none border border-slate-200 px-5 py-3.5 flex items-center gap-3 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#16A6A1]" />
                <span className="text-xs sm:text-sm font-bold text-slate-600">NOVA is preparing your travel guide insights...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick prompts (only shown when no messages or only welcome) */}
        {messages.length <= 1 && !isProcessing && (
          <div className="px-5 sm:px-6 pb-3 flex flex-wrap gap-2 bg-white border-t border-slate-100 pt-3.5">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-[#0B3A53] hover:text-white text-slate-700 text-xs sm:text-[13px] font-semibold transition-all border border-slate-200/80 cursor-pointer shadow-2xs hover:scale-[1.02]"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mx-5 sm:mx-6 mb-2.5 px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs sm:text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="shrink-0 cursor-pointer p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3 shrink-0">
          {/* Image preview pill */}
          {filePreview && (
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-100 border border-slate-200 w-fit">
              <img src={filePreview} alt="Selected" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                  {selectedFile?.name || 'Image selected'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {selectedFile ? (selectedFile.size / 1024).toFixed(0) + ' KB' : ''}
                </span>
              </div>
              <button onClick={clearFile} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
          />

          {/* Input row */}
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-[#16A6A1] transition-all cursor-pointer shrink-0 flex items-center justify-center hover:scale-105"
              title="Upload image (JPG, PNG, WEBP · max 5MB)"
            >
              {filePreview ? (
                <ImageIcon className="w-5 h-5 text-[#16A6A1]" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your travel guide anything… (Press Enter to send, Shift+Enter for new line)"
              rows={1}
              disabled={isProcessing}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm sm:text-[15px] font-medium focus:outline-none focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20 transition-all text-slate-900 resize-none disabled:opacity-60 min-h-[50px]"
              style={{ maxHeight: '110px', overflowY: 'auto' }}
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={(!inputText.trim() && !selectedFile) || isProcessing}
              className="w-12 h-12 rounded-2xl bg-[#0B3A53] hover:bg-[#146C86] disabled:opacity-40 text-white transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center hover:scale-105"
              title="Send"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#16A6A1]" />
              ) : (
                <Send className="w-5 h-5 text-[#16A6A1]" />
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-medium">
            Powered by Google Gemini AI · Your conversations are private and secured
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Helper ──────────────────────────────────────────────────────────────────
function welcomeMessage(): UIMessage {
  return {
    id: 'welcome',
    role: 'bot',
    text: "Ayubowan! 🇱🇰 I'm **NOVA Guide**, your AI Travel Companion powered by Google Gemini.\n\nI can help you with:\n- Destinations, attractions & activities\n- Transportation (trains, buses, taxis)\n- Trip planning & itineraries\n- Image identification of landmarks & food\n- Cultural tips & travel advice\n\nWhat would you like to explore today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
