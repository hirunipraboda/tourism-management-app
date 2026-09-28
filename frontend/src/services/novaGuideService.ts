import { TRAVEL_PACKAGES, TravelPackage } from '../mock/tourAndGuideData';
import { fetchApi } from './api';

interface ApiTourPackage {
  tourPackageId: number;
  guideId: number;
  guideName: string;
  packageName: string;
  description: string;
  destination: string;
  durationDays: number;
  price: number;
  maxGroupSize: number;
  isActive: boolean;
  createdAt: string;
}

export interface NOVAGuideMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  imagePreview?: string;
  imageCaption?: string;
  suggestions?: string[];
  recommendedPackage?: TravelPackage;
  showPickMePartnerCard?: boolean;
}

export class NOVAGuideService {
  private livePackages: TravelPackage[] = [];

  constructor() {
    this.loadBackendPackages();
  }

  /**
   * Fetch active tour packages from live ASP.NET Core backend
   */
  public async loadBackendPackages(): Promise<TravelPackage[]> {
    try {
      const res = await fetchApi<ApiTourPackage[]>('/tour-packages?isActive=true');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        this.livePackages = res.data.map((tp) => {
          // Map backend response onto TravelPackage structure with safe fallbacks
          const matchingMock = TRAVEL_PACKAGES.find(
            (m) => m.name.toLowerCase() === tp.packageName.toLowerCase()
          );

          return {
            id: String(tp.tourPackageId),
            name: tp.packageName,
            destination: tp.destination,
            destinationsList: matchingMock?.destinationsList || [tp.destination],
            duration: `${tp.durationDays} Days`,
            nights: `${Math.max(1, tp.durationDays - 1)} Nights`,
            priceFrom: `$${tp.price}`,
            imageUrl: matchingMock?.imageUrl || '/assets/destinations/sigiriya.jpg',
            inclusions: matchingMock?.inclusions || ['Accommodation', 'Transport', 'Guide'],
            exclusions: matchingMock?.exclusions || ['Personal Expenses'],
            about: tp.description || matchingMock?.about || 'Live package experience.',
            groupSize: `Up to ${tp.maxGroupSize} travelers`,
            travelStyle: matchingMock?.travelStyle || 'Culture · Nature',
            bestFor: matchingMock?.bestFor || 'Couples · Small Groups',
            dailyItinerary: matchingMock?.dailyItinerary || [],
            guide: {
              name: tp.guideName || matchingMock?.guide.name || 'Certified Local Guide',
              title: 'Tour Guide',
              languages: 'English · Sinhala',
              rating: 4.9,
              experience: '5+ years experience',
            },
            transport: matchingMock?.transport || {
              type: 'Private SUV / Van',
              capacity: `1–${tp.maxGroupSize} travelers`,
              features: 'Air conditioning · Certified Driver',
            },
          };
        });
        return this.livePackages;
      }
    } catch (e) {
      console.info('[NOVA Guide Service] Using fallback travel packages.');
    }
    return TRAVEL_PACKAGES;
  }

  /**
   * Process a message sent by the user (with optional image file/URL)
   */
  public async processUserQuery(
    text: string,
    imageFileOrUrl?: File | string
  ): Promise<NOVAGuideMessage> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const textLower = text.toLowerCase();
    let replyText = '';
    let suggestions: string[] = [];
    let recommendedPackage: TravelPackage | undefined = undefined;

    let showPickMePartnerCard = false;

    // Try calling the standalone Python AI Agent microservice (http://localhost:8000/agent/chat)
    if (!imageFileOrUrl && text.trim()) {
      try {
        const agentResponse = await fetch('http://localhost:8000/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });
        if (agentResponse.ok) {
          const data = await agentResponse.json();
          if (data && data.reply) {
            const replyTextLower = data.reply.toLowerCase();
            const queryLower = text.toLowerCase();

            const isPickMe = replyTextLower.includes('pickme') || queryLower.includes('pickme') || queryLower.includes('transport') || queryLower.includes('ride') || queryLower.includes('cab');
            const isPackage = (replyTextLower.includes('package') || queryLower.includes('budget') || queryLower.includes('cost')) && !replyTextLower.includes('no available');

            const packagePool = this.livePackages.length > 0 ? this.livePackages : TRAVEL_PACKAGES;

            return {
              id: `msg-bot-${Date.now()}`,
              sender: 'bot',
              text: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestions: [
                '🗺 Check tour availability',
                '👤 Find available guides',
                '💰 Calculate tour estimate'
              ],
              showPickMePartnerCard: isPickMe,
              recommendedPackage: isPackage ? packagePool[0] : undefined
            };
          }
        }
      } catch (err) {
        // Python microservice offline or unreachable; fall through to built-in rules handler
      }
    }

    // Ensure packages are populated
    const packagePool = this.livePackages.length > 0 ? this.livePackages : TRAVEL_PACKAGES;

    // 1. IMAGE-BASED ANALYSIS
    if (imageFileOrUrl) {
      let fileName = '';
      if (typeof imageFileOrUrl === 'string') {
        fileName = imageFileOrUrl.toLowerCase();
      } else {
        fileName = imageFileOrUrl.name.toLowerCase();
      }

      if (fileName.includes('sigiriya') || fileName.includes('rock') || textLower.includes('sigiriya')) {
        replyText = `**This looks like Sigiriya Rock Fortress in Sri Lanka.** 🇱🇰\n\nIt is an ancient 5th-century palace complex carved into a 200-meter sheer granite monolith surrounded by royal water gardens, world-famous frescoes, and the giant Lion Paws gate.`;
        suggestions = [
          'Learn about the history',
          'Things to see',
          'Entry information',
          'Best time to visit',
          'Nearby attractions',
          'Plan my day'
        ];
      } else if (fileName.includes('food') || fileName.includes('curry') || fileName.includes('rice') || fileName.includes('kottu') || textLower.includes('food')) {
        replyText = `**This is an authentic Sri Lankan Rice & Curry Feast!** 🍛\n\nIt features aromatic red/white rice surrounded by dhal curry in coconut milk, spiced pol sambol, gotukola salad, beet curry, and crispy papadam.`;
        suggestions = [
          'Is Sri Lankan food spicy?',
          'What are the best curries to try?',
          'How is Kottu Roti made?',
          'Where to find authentic local food?'
        ];
      } else if (fileName.includes('galle') || fileName.includes('fort') || fileName.includes('lighthouse')) {
        replyText = `**This is the Galle Dutch Fort & Lighthouse.** 🏛️\n\nA 130-acre UNESCO World Heritage coastal citadel built by Portuguese and Dutch colonizers in 1588, featuring ocean ramparts and cobblestone alleyways.`;
        suggestions = [
          'Best spot for sunset',
          'Top things to do in Galle Fort',
          'Cafes & restaurants inside fort'
        ];
      } else if (fileName.includes('ella') || fileName.includes('nine') || fileName.includes('bridge')) {
        replyText = `**This is the Nine Arch Bridge (Bridge in the Sky) in Demodara/Ella.** 🌉\n\nA 91-meter colonial railway viaduct built completely out of solid stone blocks and cement mortar without a single piece of steel.`;
        suggestions = [
          'Train passing schedule',
          'How to hike from Ella town',
          'Best photography spots'
        ];
      } else {
        replyText = `**I have analyzed your image!** 📸\n\nThis looks like a prominent attraction in Sri Lanka. It features rich cultural heritage and scenic surroundings. Would you like me to identify its location, entry ticket costs, or nearby travel packages?`;
        suggestions = [
          'Learn about the history',
          'Entry & ticket info',
          'Best time to visit',
          'Show matching travel packages'
        ];
      }
    } 
    // 2. TRANSPORT & PICKME PARTNER QUERIES
    else if (
      textLower.includes('pickme') ||
      textLower.includes('ride') ||
      textLower.includes('transport') ||
      textLower.includes('taxi') ||
      textLower.includes('cab') ||
      textLower.includes('colombo to galle') ||
      textLower.includes('get to sigiriya') ||
      textLower.includes('around kandy') ||
      textLower.includes('airport') ||
      textLower.includes('easiest way to get') ||
      textLower.includes('best transport option') ||
      textLower.includes('get around')
    ) {
      replyText = `For a convenient private journey, you can arrange transportation through our partner PickMe.`;
      showPickMePartnerCard = true;
      suggestions = [
        'Get 10% Off with PickMe',
        'How to book train tickets?',
        '🗺 Plan a 1-day itinerary',
        '📍 Recommended places to visit'
      ];
    }
    // 3. BUDGET & DURATION QUERIES
    else if (textLower.includes('budget') || textLower.includes('days') || textLower.includes('$') || textLower.includes('cost')) {
      replyText = `**I found a travel package that matches your trip criteria!** 🎒\n\nBased on your budget and duration preference, our **${packagePool[0].name}** package covers ${packagePool[0].destination} with full transport and boutique stays.`;
      recommendedPackage = packagePool[0];
      suggestions = [
        'Tell me more about this package',
        'Can I customize this itinerary?',
        'How to book this package?'
      ];
    } else if (textLower.includes('history') || textLower.includes('culture') || textLower.includes('tell me about')) {
      replyText = `Sri Lanka boasts over **2,500 years of recorded royal history**, home to 8 UNESCO World Heritage Sites including ancient kingdom capitals Anuradhapura, Polonnaruwa, and Sigiriya, as well as the sacred Temple of the Tooth Relic in Kandy.`;
      suggestions = [
        'What are the top UNESCO sites?',
        'What should I wear at sacred temples?',
        'Tell me about Kandyan culture'
      ];
    } else if (textLower.includes('plan my day') || textLower.includes('itinerary') || textLower.includes('day')) {
      replyText = `🌅 **Here is a recommended 1-Day Cultural Itinerary:**\n\n- **07:30 AM:** Early morning climb of Sigiriya Lion Rock Fortress before peak heat.\n- **12:30 PM:** Authentic Sri Lankan Rice & Curry lunch at a local village farm.\n- **03:30 PM:** Afternoon Jeep Safari at Minneriya National Park to observe wild elephants.\n- **07:00 PM:** Evening relaxation & herbal tea session.`;
      suggestions = [
        'How to travel between locations?',
        'What is the best month to visit?',
        'Show travel packages'
      ];
    } else if (textLower.includes('visit') || textLower.includes('recommend') || textLower.includes('attractions')) {
      replyText = `📍 **Top Recommended Destinations in Sri Lanka:**\n\n1. **Sigiriya & Cultural Triangle** — Ancient monoliths & rock temples.\n2. **Ella & Hill Country** — Misty tea fields, Nine Arch Bridge, and mountain treks.\n3. **Galle & Southern Coast** — Colonial ocean fort, palm beaches, and whale watching.\n4. **Yala National Park** — Highest density of leopards in Asia.`;
      suggestions = [
        'Show packages in Ella',
        'Show packages in Galle',
        'How do I travel around?'
      ];
    } else {
      replyText = `Hello! I'm **NOVA Guide**, your AI travel companion. 🤖✨\n\nI can answer questions about Sri Lanka's destinations, identify uploaded photos of landmarks or food, generate day itineraries, suggest travel packages within your budget, recommend PickMe transport discounts, and help you navigate local culture. What would you like to discover today?`;
      suggestions = [
        '📸 Identify an uploaded image',
        '🚗 What\'s the easiest way to get from Colombo to Galle?',
        '🗺 Plan a 1-day itinerary',
        '📍 Recommended places to visit'
      ];
    }

    return {
      id: `msg-bot-${Date.now()}`,
      sender: 'bot',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions,
      recommendedPackage,
      showPickMePartnerCard
    };
  }
}

export const novaGuideService = new NOVAGuideService();

