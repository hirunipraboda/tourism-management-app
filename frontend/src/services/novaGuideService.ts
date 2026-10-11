/**
 * NOVA Guide Service — Real backend API integration & AI Travel Assistant.
 *
 * Supports:
 * 1. Dedicated full-page AI Travel Guide bot (/ai-guide or NOVAGuideChat)
 *    with persistent sessions, Gemini multimodal AI, user isolation, trip context.
 * 2. Floating quick-widget (NOVAGuideFloatingWidget) with seamless API fallback.
 */

import { TRAVEL_PACKAGES, TravelPackage } from '../mock/tourAndGuideData';
import { aiBotGuideService, LANDMARK_KNOWLEDGE_BASE } from './aiBotGuideService';

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

// ─── Floating Widget Helper Class & Offline Intelligence Engine ────────────────

class NOVAGuideService {
  private floatingSessionId: string | null = null;

  async processUserQuery(text: string, imageOrFile?: File | string): Promise<NOVAGuideMessage> {
    const token = localStorage.getItem('nova_auth_token');

    // 1. If authenticated, try calling the real backend AI endpoint!
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
            'What can I do in Galle for two days?',
            'What are the best places in Ella?',
            'How can I travel from Colombo to Kandy?',
          ],
        };
      } catch (err: any) {
        console.warn('Backend chat API error in floating widget, activating client intelligence:', err);
        // Reset cached session if invalid
        this.floatingSessionId = null;
      }
    }

    // 2. Client-Side High-Speed Intelligence Engine
    // Handles Multimodal Visual Analysis & Detailed Sri Lanka Travel Intelligence
    const textLower = text.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Multimodal / Image Upload Query
    if (imageOrFile) {
      try {
        const analysis = await aiBotGuideService.analyzeImage(imageOrFile);
        const lm = analysis.landmark;

        const replyText =
          `📸 **Visual Landmark Identification: ${lm.name}**\n` +
          `*(Recognized with **${Math.round(lm.confidenceScore * 100)}% visual match** in ${lm.location}, ${lm.province})*\n\n` +
          `${lm.shortDesc}\n\n` +
          `### 🏛️ Historical Significance\n` +
          `${lm.history}\n\n` +
          `### 🌟 Key Highlights\n` +
          `${lm.highlights.map((h) => `- ${h}`).join('\n')}\n\n` +
          `### 🕒 Visitor Essentials\n` +
          `- **Best Time to Visit:** ${lm.visitorInfo.bestTimeToVisit}\n` +
          `- **Opening Hours:** ${lm.visitorInfo.openingHours}\n` +
          `- **Entry Fees:** Foreign Adult: ${lm.visitorInfo.entryFee.foreignAdult} | Local: ${lm.visitorInfo.entryFee.localAdult}\n` +
          `- **Dress Code & Etiquette:** ${lm.visitorInfo.dressCodeEtiquette}\n` +
          `- **Recommended Duration:** ${lm.visitorInfo.recommendedDuration}\n\n` +
          `💡 **Insider Tip:** ${lm.insiderSecrets[0]}`;

        return {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp,
          suggestions: lm.suggestedQuestions,
        };
      } catch {
        // Fallback if image analysis failed
      }
    }

    // Galle & Southern Coast Queries
    if (textLower.includes('galle')) {
      if (textLower.includes('two day') || textLower.includes('2 day') || textLower.includes('2-day') || textLower.includes('two days')) {
        return {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text:
            `🏰 **Complete 2-Day Galle & South Coast Itinerary:**\n\n` +
            `### Day 1: Historic Galle Dutch Fort & Ocean Ramparts\n` +
            `- **Morning (9:00 AM – 12:00 PM):** Stroll the 17th-century coral-and-granite ramparts starting from the Main Gate to the iconic **Galle Lighthouse** at Point Utrecht Bastion.\n` +
            `- **Lunch (12:30 PM):** Dine at the restored **Old Dutch Hospital** precinct overlooking Galle Harbor for fresh Ceylon crab and chilled passion fruit juice.\n` +
            `- **Afternoon (2:30 PM – 5:00 PM):** Wander down pedestrian cobblestone alleyways (Pedlar Street, Church Street). Visit the historic **Dutch Reformed Church (1755)** and National Maritime Museum.\n` +
            `- **Sunset (5:30 PM):** Gather at **Flag Rock Bastion** to watch local cliff divers plunge into crashing waves against a fiery Indian Ocean sunset.\n\n` +
            `### Day 2: Beaches, Secret Coves & Wildlife\n` +
            `- **Morning (8:30 AM):** Head 10 minutes south to **Unawatuna Beach** & hike through jungle canopy to secluded **Jungle Beach**.\n` +
            `- **Mid-day (12:00 PM):** Climb the hilltop to visit the serene **Japanese Peace Pagoda** for 360° panoramic ocean views.\n` +
            `- **Afternoon (2:30 PM):** Visit the **Koggala Sea Turtle Conservation Project** and photograph traditional stilt fishermen along the coastline.\n` +
            `- **Sunset (5:30 PM):** Golden hour drinks at **Dalawella Beach** by the famous palm rope swing.\n\n` +
            `💡 **Practical Tip:** Entry to Galle Fort streets, ramparts, and lighthouse grounds is completely **Free**!`,
          timestamp,
          suggestions: [
            'What are the best places to eat in Galle Fort?',
            'How can I travel from Colombo to Galle?',
            'What is the history of Galle Fort ramparts?',
          ],
        };
      }

      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `🏰 **Welcome to Galle (ගාල්ල) — Sri Lanka's Living Colonial Citadel!**\n\n` +
          `Galle is the crown jewel of Sri Lanka's southern coast, anchored by the UNESCO World Heritage **Galle Dutch Fort**.\n\n` +
          `### 🌟 Top Highlights & Must-See Sights:\n` +
          `- **Galle Lighthouse:** Built on Point Utrecht Bastion, this pristine white 1939 lighthouse is Sri Lanka's oldest light station.\n` +
          `- **Ramparts & Flag Rock:** Massive 17th-century coral walls built by Portuguese and Dutch settlers. Flag Rock is the premier sunset gathering spot where local cliff-jumpers leap into the ocean.\n` +
          `- **Dutch Reformed Church (Groote Kerk):** Built in 1755 with historic gravestones embedded into the floor and Dutch colonial architecture.\n` +
          `- **Old Dutch Hospital:** A 17th-century colonial medical complex transformed into lively seaside restaurants, spice shops, and craft gelaterias.\n\n` +
          `### 🏖️ Nearby South Coast Escapes:\n` +
          `- **Unawatuna & Jungle Beach:** Just 10–15 mins away by tuk-tuk for calm ocean swimming, diving, and reef snorkeling.\n` +
          `- **Japanese Peace Pagoda:** Nestled on the green headland of Rumassala hill overlooking Galle bay.\n` +
          `- **Sea Turtle Sanctuaries:** Conservation hatcheries in Habaraduwa and Kosgoda.\n\n` +
          `### 🚆 How to Get There:\n` +
          `- **Express Bus:** ~1.5 hours from Colombo via Southern Expressway (E01).\n` +
          `- **Coastal Train:** ~2 to 2.5 hours on the picturesque railway from Colombo Fort directly hugging the ocean shoreline.\n\n` +
          `### 🕒 Best Visiting Window:\n` +
          `November through April offers sunny dry skies and calm turquoise waters. Explore the fort ramparts between 4:00 PM – 6:30 PM for cooling ocean breezes!`,
        timestamp,
        suggestions: [
          'What can I do in Galle for two days?',
          'What are the best places to eat in Galle Fort?',
          'How can I travel from Colombo to Galle?',
        ],
      };
    }

    // Ella & Mountain Trails
    if (textLower.includes('ella') || textLower.includes('nine arch') || textLower.includes('adam\'s peak') || textLower.includes('ravana')) {
      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `⛰️ **Ella — The Hill Country Adventure Capital:**\n\n` +
          `Nestled in the central misty highlands at 1,041m elevation, Ella is surrounded by emerald tea plantations, waterfalls, and mountain gap vistas.\n\n` +
          `### 🌟 Must-Visit Highlights:\n` +
          `- **Nine Arch Bridge (Bridge in the Sky):** Built in 1921 purely of stone and brick without steel. Best train-crossing viewing times: **~9:30 AM, 11:30 AM, 3:30 PM, 5:30 PM**.\n` +
          `- **Little Adam's Peak:** A gentle, scenic 45-minute hike through lush tea bushes offering 360° panoramic views across Ella Gap.\n` +
          `- **Ella Rock:** A rewarding 4-hour morning mountain trek through pine forests to sheer cliff drops overlooking the valley.\n` +
          `- **Ravana Falls & Cave:** A dramatic 25-meter cascading highway waterfall steeped in Ramayana folklore.\n` +
          `- **Halpewatte Tea Factory:** Learn orthodox Ceylon tea grading and enjoy single-estate tastings.\n\n` +
          `💡 **Travel Tip:** Ella is the destination for the world-famous Kandy-to-Ella scenic blue train ride!`,
        timestamp,
        suggestions: [
          'What times does the train pass Nine Arch Bridge?',
          'How hard is the hike to Ella Rock?',
          'How to travel from Kandy to Ella by train?',
        ],
      };
    }

    // Kandy & Sacred Cultural Capital
    if (textLower.includes('kandy') || textLower.includes('tooth') || textLower.includes('dalada') || textLower.includes('peradeniya')) {
      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `🛕 **Kandy (මහනුවර) — Sri Lanka's Sacred Cultural Capital:**\n\n` +
          `Encircled by misty mountains and centering on picturesque Kandy Lake, Kandy was the last independent royal kingdom before British rule in 1815.\n\n` +
          `### 🌟 Top Highlights:\n` +
          `- **Temple of the Sacred Tooth Relic (Sri Dalada Maligawa):** Houses Gautama Buddha's left canine tooth relic within a golden stupa casket. Daily pooja drumming ceremonies at **5:30 AM, 9:30 AM, and 6:30 PM**.\n` +
          `- **Royal Botanical Gardens, Peradeniya:** 147 acres featuring 4,000 plant species, giant Javan fig trees, and royal palm avenues.\n` +
          `- **Bahirawakanda Giant Buddha:** An 88-foot seated white Buddha with sweeping sunset panoramas over Kandy Lake.\n` +
          `- **Traditional Kandyan Dance:** Acrobatic leaping, drum rhythms, and ceremonial fire-walking nightly at 5:30 PM.\n\n` +
          `⚠️ **Temple Etiquette:** Strict dress code requires white or modest attire covering both shoulders and knees. Remove shoes and hats before entering.`,
        timestamp,
        suggestions: [
          'How can I travel from Colombo to Kandy?',
          'What is the dress code for Temple of the Tooth?',
          'When is the Kandy Esala Perahera festival?',
        ],
      };
    }

    // Sigiriya & Ancient Triangle
    if (textLower.includes('sigiriya') || textLower.includes('lion rock') || textLower.includes('pidurangala') || textLower.includes('dambulla')) {
      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `🦁 **Sigiriya Rock Fortress (Lion Rock) — The Palace in the Sky:**\n\n` +
          `Built in the 5th century by King Kasyapa (477–495 AD) atop a 200m vertical granite monolith, Sigiriya is often hailed as the 8th Wonder of the World.\n\n` +
          `### 🌟 Key Highlights:\n` +
          `- **Sigiriya Frescoes:** 1,500-year-old heavenly maidens painted with natural earth pigments.\n` +
          `- **Mirror Wall:** Ancient polished brick wall inscribed with 8th-century visitor graffiti and poetry.\n` +
          `- **Lion Gate Paws:** Monumental carved stone lion paws guarding the final climb to the palace summit.\n` +
          `- **Royal Water Gardens:** Symmetrical hydraulic fountain gardens that still operate during the rainy season!\n\n` +
          `### 🕒 Visiting Info:\n` +
          `- **Climb Difficulty:** ~1,200 steps to the top. Recommended starting time: **7:00 AM** to avoid mid-day sun.\n` +
          `- **Entry Fee:** $36 USD (~11,700 LKR) for foreign adults.\n` +
          `- **Pidurangala Rock:** Located directly adjacent ($3 USD entry) — climb at sunrise for the iconic photography view of Sigiriya monolith!`,
        timestamp,
        suggestions: [
          'How many steps are there to climb Sigiriya?',
          'Should I climb Pidurangala Rock for sunrise?',
          'What should I wear when visiting Sigiriya?',
        ],
      };
    }

    // Nuwara Eliya & Horton Plains
    if (textLower.includes('nuwara eliya') || textLower.includes('horton') || textLower.includes('world\'s end') || textLower.includes('baker')) {
      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `🌲 **Horton Plains & Nuwara Eliya — 'Little England' & Highlands:**\n\n` +
          `- **World's End Precipice:** A sheer 880-meter vertical cliff drop overlooking tea valleys and Southern mountains. Must arrive between **6:30 AM – 9:00 AM** before cloud mist covers the gorge.\n` +
          `- **Baker's Falls:** A roaring 20m waterfall along the 9.5 km nature loop trail.\n` +
          `- **Pedro Tea Estate:** Walk through an 1885 colonial tea factory producing world-renowned single-estate high-grown Ceylon tea.\n` +
          `- **Lake Gregory & Victoria Park:** Paddle boating, horseback riding, and colonial red-brick architecture (including the 1894 Post Office).\n\n` +
          `🧥 **Packing Tip:** Temperatures drop to 10°C–14°C in the early mornings; bring a light warm fleece and rain jacket.`,
        timestamp,
        suggestions: [
          'How early should I arrive at World\'s End?',
          'What clothes should I wear for Horton Plains?',
          'How hard is the 9.5 km trekking loop?',
        ],
      };
    }

    // Colombo & Western Province
    if (textLower.includes('colombo') && !textLower.includes('to kandy') && !textLower.includes('to galle')) {
      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `🌆 **Colombo — Sri Lanka's Vibrant Oceanfront Metropolis:**\n\n` +
          `- **Colombo Lotus Tower:** South Asia's tallest self-supported structure (350m) with observation deck and revolving restaurant.\n` +
          `- **Gangaramaya Temple:** Beautiful eclectic Buddhist temple on Beira Lake with classic artifacts and floating Seema Malaka pavilion.\n` +
          `- **Galle Face Green:** Oceanfront promenade where locals gather for sunset kite-flying and street food (crispy spicy Isso Vadai prawn fritters).\n` +
          `- **Pettah Floating Market & Red Mosque (Jami Ul-Alfar):** Striking candy-striped red-and-white minarets and bustling open bazaar.\n` +
          `- **National Museum:** Italian architectural palace holding the throne and royal crown of the last King of Kandy.`,
        timestamp,
        suggestions: [
          'What is the best street food in Colombo?',
          'How can I travel from Colombo to Kandy?',
          'How can I travel from Colombo to Galle?',
        ],
      };
    }

    // Food & Dining
    if (textLower.includes('food') || textLower.includes('curry') || textLower.includes('kottu') || textLower.includes('hopper') || textLower.includes('eat') || textLower.includes('dish')) {
      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `🍛 **Authentic Sri Lankan Culinary Guide:**\n\n` +
          `Sri Lankan food is an explosion of roasted Ceylon spices, fresh coconut milk, and fiery tropical flavors.\n\n` +
          `### 🌟 Must-Try National Dishes:\n` +
          `- **Rice & Curry Feast:** Steamed rice accompanied by 4 to 6 fresh curries (creamy dhal lentil, spiced beetroot, tender young jackfruit/polos, fish or chicken ambul thiyal), pol sambol (fresh grated coconut with lime & chili), and crispy papadam.\n` +
          `- **Kottu Roti:** Chopped godamba flatbread flash-fried on heavy iron griddles with vegetables, eggs, spices, and melted cheese. Listen for the rhythmic clattering beat of the blades!\n` +
          `- **Egg Hoppers (Appa):** Crispy bowl-shaped fermented rice-flour pancakes with a soft steamed egg nestled in the center. Enjoy with sweet-and-spicy onion seeni sambol.\n` +
          `- **King Coconut (Thambili):** Sweet, electrolyte-rich golden coconuts served fresh at roadside stalls.\n` +
          `- **Fresh Southern Seafood:** Jumbo garlic butter prawns, Jaffna blue swimming crab curry, and grilled ocean snapper along Mirissa and Galle beaches.\n\n` +
          `💡 **Spice Level Tip:** If you have sensitive tastebuds, ask for *"Aduwen Miris"* (less chili please)!`,
        timestamp,
        suggestions: [
          'What is Kottu Roti and where can I try it?',
          'Is Sri Lankan food too spicy for tourists?',
          'What are the best places for seafood in Galle?',
        ],
      };
    }

    // Transportation, Trains & Route Queries
    if (
      textLower.includes('transport') ||
      textLower.includes('train') ||
      textLower.includes('bus') ||
      textLower.includes('travel from') ||
      textLower.includes('how can i travel') ||
      textLower.includes('how do i travel') ||
      textLower.includes('how to get') ||
      textLower.includes('how do i get')
    ) {
      if (textLower.includes('colombo to kandy')) {
        return {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text:
            `🚆 **Traveling from Colombo to Kandy:**\n\n` +
            `- **Intercity Express Train (Recommended):** Takes ~2.5 to 3 hours from Colombo Fort Station. 1st Class AC and 2nd Class reserved tickets cost ~$3 to $6 USD. Advance booking recommended.\n` +
            `- **Central Expressway Bus (Route 01 AC):** Takes ~2.5 hours departing from Makumbura Multimodal Transport Hub.\n` +
            `- **Private Taxi / Uber / PickMe:** ~3 to 3.5 hours depending on traffic. Costs ~$45 to $65 USD.`,
          timestamp,
          suggestions: [
            'What are the best places to visit in Kandy?',
            'How to travel from Kandy to Ella by train?',
            'What is the dress code for Temple of Tooth?',
          ],
        };
      }

      if (textLower.includes('kandy to ella') || textLower.includes('ella train')) {
        return {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text:
            `🚂 **The Iconic Kandy to Ella Scenic Train Ride:**\n\n` +
            `Ranked among the most picturesque rail journeys on Earth!\n\n` +
            `- **Duration:** ~6.5 to 7 hours of winding tracks through emerald tea mountains, cascading waterfalls, and misty tunnels.\n` +
            `- **Best Side to Sit:** Sit on the **Right side** from Kandy to Nanu Oya, then switch to the **Left side** from Nanu Oya to Ella for the best valley views.\n` +
            `- **Ticket Classes:** 1st Class Observation Car (air-conditioned, large windows) or 2nd Class Reserved (open windows for photos & breeze).\n` +
            `- **Booking Window:** Reserve 30 days in advance via Sri Lanka Railways online portal or licensed travel agents.`,
          timestamp,
          suggestions: [
            'What times does the train pass Nine Arch Bridge?',
            'What are the best places in Ella?',
            'Plan a 3-day itinerary for Sri Lanka',
          ],
        };
      }

      if (textLower.includes('colombo to galle')) {
        return {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text:
            `🚗 **Traveling from Colombo to Galle:**\n\n` +
            `- **Southern Expressway (E01) Bus:** Takes just **1.5 hours** on air-conditioned highway express buses from Maharagama or Makumbura. Runs every 20 minutes (~500 LKR / $1.60 USD).\n` +
            `- **Coastal Railway Train:** Takes ~2 to 2.5 hours from Colombo Fort directly hugging the Indian Ocean coastline with stunning sea spray views (~300–600 LKR).\n` +
            `- **Private Chauffeur / Taxi:** Takes ~1.5 to 2 hours door-to-door (~$40–$55 USD).`,
          timestamp,
          suggestions: [
            'What can I do in Galle for two days?',
            'What are the best places to eat in Galle Fort?',
            'Tell me about Galle Dutch Fort history',
          ],
        };
      }

      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `🚆 **Sri Lanka Transportation Guide:**\n\n` +
          `- **Scenic Railways:** The Main Line (Colombo → Kandy → Nuwara Eliya → Ella) offers world-famous mountain vistas. The Coastal Line (Colombo → Bentota → Galle → Matara) runs along the ocean surf.\n` +
          `- **Expressway Buses:** Modern air-conditioned highway coaches operate via Southern (E01) and Central expressways connecting major cities in 1–2 hours.\n` +
          `- **Tuk-Tuks (Three-Wheelers):** Ideal for short city hops. Use the **PickMe** app for metered transparent rates, or agree on the fare beforehand.\n` +
          `- **Private Chauffeurs:** The most convenient way to tour multiple regions with luggage, available through verified Nova guides.`,
        timestamp,
        suggestions: [
          'How can I travel from Colombo to Kandy?',
          'How can I travel from Colombo to Galle?',
          'How to book the Kandy to Ella train?',
        ],
      };
    }

    // Itineraries (1-day, 3-day, 5-day, etc.)
    if (textLower.includes('itinerary') || textLower.includes('plan my day') || textLower.includes('1-day') || textLower.includes('1 day') || textLower.includes('3 day') || textLower.includes('3-day')) {
      if (textLower.includes('1 day') || textLower.includes('1-day')) {
        return {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text:
            `🗺 **Perfect 1-Day Highlights Itinerary in Sri Lanka:**\n\n` +
            `Depending on your starting hub:\n\n` +
            `### Option A: The Cultural Wonder (Sigiriya & Dambulla)\n` +
            `- **06:30 AM – 09:30 AM:** Early climb of Sigiriya Lion Rock Citadel to beat the midday sun.\n` +
            `- **11:00 AM – 01:00 PM:** Explore Dambulla Royal Cave Golden Temple with 153 Buddha statues.\n` +
            `- **02:30 PM – 05:30 PM:** Minneriya National Park open-top 4x4 safari to witness wild elephant herds.\n\n` +
            `### Option B: The Colonial Coastal Day (Galle & South Coast)\n` +
            `- **09:00 AM – 12:30 PM:** Walking tour of UNESCO Galle Dutch Fort, lighthouse & Dutch Reformed Church.\n` +
            `- **01:00 PM – 03:30 PM:** Seafood lunch at Old Dutch Hospital & swimming at Jungle Beach.\n` +
            `- **05:00 PM – 06:30 PM:** Sunset cliff-jumpers at Flag Rock Bastion & cocktails on the ramparts.`,
          timestamp,
          suggestions: [
            'What can I do in Galle for two days?',
            'What are the best places in Ella?',
            'How can I travel from Colombo to Kandy?',
          ],
        };
      }

      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `🗺 **Recommended 3-Day Classic Sri Lanka Triangle Tour:**\n\n` +
          `- **Day 1: Ancient Wonders & Rock Fortress:** Colombo → Dambulla Cave Temples → Sigiriya Rock Fortress sunset climb.\n` +
          `- **Day 2: Sacred Kingdom & Hill Country:** Sigiriya → Spice Garden tour in Matale → Kandy Temple of the Tooth Relic & Royal Botanical Gardens.\n` +
          `- **Day 3: Scenic Tea Trails & Ocean Sunset:** Kandy → Scenic Train to Ella / Nuwara Eliya tea estates OR express transfer down to Galle Dutch Fort.\n\n` +
          `Would you like me to customize this itinerary with verified guides and private chauffeur transport?`,
        timestamp,
        suggestions: [
          'What are the best places in Ella?',
          'What can I do in Galle for two days?',
          'Recommend packages within budget',
        ],
      };
    }

    // Budget & Cost Breakdown
    if (textLower.includes('budget') || textLower.includes('cost') || textLower.includes('$') || textLower.includes('price')) {
      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `💰 **Sri Lanka Travel Budget Guidelines (Per Person / Day):**\n\n` +
          `- **🎒 Backpacker / Budget ($25 – $45 USD / day):** Cozy guesthouses & homestays, local Rice & Curry / Kottu meals, public scenic trains and expressway buses.\n` +
          `- **🌿 Mid-Range ($60 – $130 USD / day):** Boutique heritage villas & 3-4 star hotels, private guided day excursions, driver transfers, and a mix of casual & fine dining.\n` +
          `- **✨ Luxury ($160 – $350+ USD / day):** 5-star tea bungalow estates (Ceylon Tea Trails), beachfront private pool villas, chartered seaplane transfers, and personal naturalist guides.\n\n` +
          `We have curated, all-inclusive packages that cover licensed guides, hotel stays, and verified transport!`,
        timestamp,
        recommendedPackage: TRAVEL_PACKAGES[0],
        suggestions: [
          'Tell me more about this package',
          'What can I do in Galle for two days?',
          'What are the best places in Ella?',
        ],
      };
    }

    // Weather, Seasons & When to Visit
    if (textLower.includes('weather') || textLower.includes('rain') || textLower.includes('monsoon') || textLower.includes('season') || textLower.includes('when to visit')) {
      return {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text:
          `☀️ **Sri Lanka Climate & Best Times to Visit:**\n\n` +
          `Because Sri Lanka has two opposite monsoon systems, there is *always* perfect sunny weather on one side of the island!\n\n` +
          `- **South & West Coasts (Galle, Mirissa, Bentota, Colombo):** Best from **December to April**. Dry, sunny skies with calm ocean waters.\n` +
          `- **Central Hill Country (Kandy, Ella, Nuwara Eliya):** Pleasant year-round, with the clearest hiking days between **January and April**.\n` +
          `- **East Coast (Arugam Bay, Trincomalee, Pasikudah):** Best from **May to September**. Prime surf season in Arugam Bay!\n` +
          `- **Cultural Triangle (Sigiriya, Dambulla):** Good year-round; dry and sunny most months.`,
        timestamp,
        suggestions: [
          'What can I do in Galle for two days?',
          'What are the best places in Ella?',
          'How can I travel from Colombo to Kandy?',
        ],
      };
    }

    // General / Default Smart Travel Companion Response
    return {
      id: `msg-bot-${Date.now()}`,
      sender: 'bot',
      text:
        `Hello! I'm **NOVA Guide**, your AI Travel Companion across Sri Lanka. 🚊 🌴\n\n` +
        `I have comprehensive, factual knowledge of Sri Lanka's top destinations, historical landmarks, transport options, local cuisine, and itineraries.\n\n` +
        `### Where would you like to explore?\n` +
        `- **Galle & Southern Coast:** 17th-century Dutch Fort, lighthouse ramparts, and Unawatuna beaches.\n` +
        `- **Ella & Central Highlands:** Nine Arch Bridge, hiking Little Adam's Peak, and scenic tea estates.\n` +
        `- **Cultural Triangle & Kandy:** Sigiriya Lion Rock Fortress, Dambulla Cave Temples, and Temple of the Tooth.\n` +
        `- **Logistics & Food:** Iconic blue train schedules, expressway bus routes, and authentic Rice & Curry feasts.\n\n` +
        `Feel free to ask any specific travel question, or tap a suggestion below!`,
      timestamp,
      suggestions: [
        'tell me about Galle',
        'What are the best places in Ella?',
        'How can I travel from Colombo to Kandy?',
      ],
    };
  }
}

export const novaGuideService = new NOVAGuideService();
