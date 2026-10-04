/**
 * NOVA Guide Service — Real backend API integration & AI Travel Assistant.
 *
 * Supports:
 * 1. Dedicated full-page AI Travel Guide bot (/ai-guide or NOVAGuideChat)
 *    with persistent sessions, Gemini multimodal AI, user isolation, trip context.
 * 2. Floating quick-widget (NOVAGuideFloatingWidget) with seamless API fallback.
 */

import { TRAVEL_PACKAGES, TravelPackage } from '../mock/tourAndGuideData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('nova_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatSessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{ content: string; role: string; createdAt: string }>;
}

export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  imageBase64?: string;
  imageMime?: string;
  createdAt: string;
  /** Local-only field for UI rendering */
  imagePreview?: string;
}

export interface SendMessageResult {
  reply: string;
  messageId: string;
  sessionId: string;
  timestamp: string;
  remainingQueries?: number;
}

export interface UserPackageStatus {
  hasActivePackage: boolean;
  packageName: string;
  remainingQueries: number;
  totalQueries: number;
  expiresAt?: string;
  includesPhotoQueries: boolean;
  stats: {
    totalQueriesUsed: number;
    photoQueriesUsed: number;
  };
}

export interface NOVAGuideMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  imagePreview?: string;
  suggestions?: string[];
  recommendedPackage?: TravelPackage;
}

// ─── Session Management ───────────────────────────────────────────────────────

export async function createChatSession(title?: string): Promise<ChatSessionSummary> {
  const res = await fetch(`${BASE_URL}/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ title: title || 'New Conversation' }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create chat session.');
  }
  return json.data;
}

export async function listChatSessions(): Promise<ChatSessionSummary[]> {
  const res = await fetch(`${BASE_URL}/chat/sessions`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load chat sessions.');
  }
  return json.data;
}

export async function getChatSession(sessionId: string): Promise<{ id: string; title: string; messages: ChatMessage[] }> {
  const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Session not found.');
  }
  return json.data;
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete session.');
  }
}

export async function fetchUserPackageStatus(): Promise<UserPackageStatus> {
  const res = await fetch(`${BASE_URL}/chat/package-status`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to fetch package status.');
  }
  return json.data;
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  sessionId: string,
  message: string,
  imageFile?: File | null
): Promise<SendMessageResult> {
  const formData = new FormData();

  if (message.trim()) {
    formData.append('message', message.trim());
  }

  if (imageFile) {
    formData.append('image', imageFile);
  }

  const res = await fetch(`${BASE_URL}/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(), // No Content-Type — let browser set multipart boundary
    body: formData,
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to send message.');
  }

  return json.data;
}

// ─── Floating Widget Helper Class ─────────────────────────────────────────────

class NOVAGuideService {
  private floatingSessionId: string | null = null;

  async processUserQuery(text: string, imageOrFile?: File | string): Promise<NOVAGuideMessage> {
    const token = localStorage.getItem('nova_auth_token');

    // If authenticated, try calling the real backend AI endpoint!
    if (token) {
      try {
        if (!this.floatingSessionId) {
          const session = await createChatSession(text.slice(0, 30) || 'Quick Guide Chat');
          this.floatingSessionId = session.id;
        }

        let file: File | null = null;
        if (imageOrFile instanceof File) {
          file = imageOrFile;
        }

        const result = await sendChatMessage(this.floatingSessionId, text, file);

        return {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text: result.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: [
            'How to get there by train or bus?',
            'What should I pack for this trip?',
            'Recommend nearby activities and food',
          ],
        };
      } catch (err: any) {
        console.warn('Backend chat API error in floating widget, falling back:', err);
        // Reset cached session if invalid
        this.floatingSessionId = null;
      }
    }

    // Fallback/offline/unauthenticated smart guide response
    const textLower = text.toLowerCase();
    let replyText = '';
    let suggestions: string[] = [];
    let recommendedPackage: TravelPackage | undefined;

    if (imageOrFile) {
      replyText = `📸 **Image Analyzed!**\n\nThis appears to be a notable Sri Lankan destination. For live multimodal identification powered by our Gemini Travel AI, please ensure you are signed in.`;
      suggestions = ['How to visit Sigiriya', 'Train to Kandy and Ella', 'Plan a 3-day itinerary'];
    } else if (textLower.includes('budget') || textLower.includes('days') || textLower.includes('$') || textLower.includes('cost')) {
      replyText = `🎒 **Budget Recommendations:**\n\nBased on your travel preferences, we recommend exploring our curated packages that include boutique stays and licensed guides across Colombo, Kandy, Ella, and Galle.`;
      recommendedPackage = TRAVEL_PACKAGES[0];
      suggestions = ['Tell me more about this package', 'Can I customize this itinerary?'];
    } else if (textLower.includes('transport') || textLower.includes('train') || textLower.includes('bus')) {
      replyText = `🚆 **Sri Lanka Transportation:**\n\nThe iconic Main Line train runs from Colombo Fort to Kandy, Nanu Oya (Nuwara Eliya), and Ella with daily scenic observation carriages. Express AC buses operate via Southern and Central expressways.`;
      suggestions = ['Book Kandy to Ella train', 'Private chauffeur tours', 'Plan my day'];
    } else {
      replyText = `Hello! I'm **NOVA Guide**, your AI Travel Companion. 🤖🌴\n\nI can help you explore Sri Lanka's top attractions, historical landmarks, transport options, and itineraries. Sign in to chat directly with our full multimodal AI travel guide!`;
      suggestions = [
        'What are the best places in Ella?',
        'How can I travel from Colombo to Kandy?',
        'What can I do in Galle for two days?',
      ];
    }

    return {
      id: `msg-bot-${Date.now()}`,
      sender: 'bot',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions,
      recommendedPackage,
    };
  }
}

export const novaGuideService = new NOVAGuideService();
