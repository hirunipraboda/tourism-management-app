import React, { useState, useRef, useEffect } from 'react';
import {
  AgentMessage,
  AgentRecommendation,
  RecommendationFilterState,
} from '../../types/reviewsAndRecommendations';
import { recommendationService } from '../../services/recommendationService';

interface AiChatPanelProps {
  filters?: Partial<RecommendationFilterState>;
  onRecommendationSelect?: (rec: AgentRecommendation) => void;
}

const EXAMPLE_PROMPTS = [
  'Quiet beach with kids under $60/day',
  'Ancient history sites near Colombo',
  'Wildlife safari under $80 budget',
  'Romantic spots for a couple trip',
  'Best adventure activities in the hills',
];

const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    <span className="text-sm text-gray-500 mr-1">AI is thinking</span>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="text-yellow-500 text-xs">
    {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    <span className="text-gray-500 ml-1">{rating.toFixed(1)}</span>
  </span>
);

const AgentRecCard: React.FC<{
  rec: AgentRecommendation;
  onClick?: () => void;
}> = ({ rec, onClick }) => (
  <button
    onClick={onClick}
    className="flex gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-teal-200 transition-all text-left w-full group"
  >
    {rec.imageUrl && (
      <img
        src={rec.imageUrl}
        alt={rec.name}
        className="w-14 h-14 rounded-lg object-cover flex-none group-hover:scale-105 transition-transform"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-gray-800 text-sm truncate">{rec.name}</p>
        <span className="flex-none bg-teal-50 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">
          {Math.round(rec.matchScore)}%
        </span>
      </div>
      <StarRating rating={rec.avgRating} />
      <p className="text-xs text-gray-500 truncate mt-0.5">{rec.reason}</p>
      {rec.estimatedCost > 0 && (
        <p className="text-xs text-teal-600 font-medium mt-0.5">~Rs. {(rec.estimatedCost * 300).toLocaleString()} (~${rec.estimatedCost})</p>
      )}
    </div>
  </button>
);

/**
 * AiChatPanel — collapsible AI travel advisor chat panel.
 * Sends natural-language queries to POST /api/Recommendations/agent.
 * Shows typing animation, example prompts, and renders agent recommendation cards.
 */
export const AiChatPanel: React.FC<AiChatPanelProps> = ({ filters, onRecommendationSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setError(null);

    const userMsg: AgentMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await recommendationService.askAgent(trimmed, filters);
      const assistantMsg: AgentMessage = {
        role: 'assistant',
        content: response.summary,
        recommendations: response.recommendations,
        followUpQuestion: response.followUpQuestion ?? undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    recommendationService.resetConversation();
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-3xl overflow-hidden shadow-md">
      {/* Header — always visible */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-teal-50/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-lg shadow-md">
            🤖
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-800">AI Travel Advisor</p>
            <p className="text-xs text-gray-500">Ask me anything about Sri Lanka</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); clearChat(); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
          <span className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Collapsible body */}
      {isOpen && (
        <div className="border-t border-teal-100">
          {/* Messages */}
          <div className="h-72 overflow-y-auto px-4 py-3 space-y-3">
            {/* Welcome / example prompts (only before first message) */}
            {messages.length === 0 && !isLoading && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center py-2">
                  Describe your ideal Sri Lanka experience and I'll find the best matches for you.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs bg-white border border-teal-200 text-teal-700 px-3 py-1.5 rounded-full hover:bg-teal-50 hover:border-teal-300 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message history */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] space-y-2`}>
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Agent recommendation cards */}
                  {msg.role === 'assistant' && msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="space-y-2">
                      {msg.recommendations.slice(0, 6).map((rec) => (
                        <AgentRecCard
                          key={rec.attractionId}
                          rec={rec}
                          onClick={() => onRecommendationSelect?.(rec)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Follow-up question */}
                  {msg.role === 'assistant' && msg.followUpQuestion && (
                    <div className="text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2 italic">
                      💬 {msg.followUpQuestion}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-2 text-center">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-2 underline text-red-500 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-teal-100 px-4 py-3 bg-white/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Peaceful nature spot under $40 budget..."
                disabled={isLoading}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? '...' : 'Ask'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              AI responses are based on real attraction data from our database.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatPanel;
