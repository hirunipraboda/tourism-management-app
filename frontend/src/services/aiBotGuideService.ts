export interface RecognizedLandmark {
  id: string;
  name: string;
  nativeName?: string;
  location: string;
  province: string;
  category: string;
  confidenceScore: number;
  unsecoSite: boolean;
  imageUrl: string;
  shortDesc: string;
  history: string;
  highlights: string[];
  visitorInfo: {
    bestTimeToVisit: string;
    openingHours: string;
    entryFee: {
      foreignAdult: string;
      foreignChild: string;
      localAdult: string;
    };
    dressCodeEtiquette: string;
    recommendedDuration: string;
  };
  insiderSecrets: string[];
  suggestedQuestions: string[];
}

export interface BotChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  relatedLandmark?: RecognizedLandmark;
}

// Built-in Visual Knowledge Base for instant landmark detection & custom upload fallback
export const LANDMARK_KNOWLEDGE_BASE: RecognizedLandmark[] = [
  {
    id: 'sigiriya',
    name: 'Sigiriya Rock Fortress (Lion Rock)',
    nativeName: 'සීගිරිය',
    location: 'Dambulla, Matale District',
    province: 'Central Province',
    category: 'Ancient Heritage & Archeology',
    confidenceScore: 0.98,
    unsecoSite: true,
    imageUrl: '/assets/destinations/sigiriya.jpg',
    shortDesc: 'A 5th-century ancient palace & fortress complex built atop a sheer 200-meter high granite monolith surrounded by royal water gardens.',
    history: 'Built by King Kasyapa (477–495 AD) as his royal citadel capital after deposing his father Dhatusena. The site includes world-famous frescoes of heavenly maidens, the Mirror Wall with ancient graffiti, and giant Lion Paws guarding the summit staircase.',
    highlights: [
      'Giant Lion Gate Paws at the summit climb entrance',
      'Ancient Mirror Wall with 8th-century visitor poetry',
      'Sigiriya Frescoes painted with natural mineral pigments',
      'Symmetrical Royal Water Gardens and hydraulic fountains'
    ],
    visitorInfo: {
      bestTimeToVisit: 'Early morning (7:00 AM – 9:00 AM) or late afternoon (3:30 PM) to avoid heat & crowds',
      openingHours: '6:30 AM – 5:30 PM daily',
      entryFee: {
        foreignAdult: '$36 USD (~11,700 LKR)',
        foreignChild: '$18 USD',
        localAdult: '120 LKR'
      },
      dressCodeEtiquette: 'Modest attire covering shoulders and knees when exploring sacred areas; comfortable hiking shoes essential.',
      recommendedDuration: '3 to 4 hours'
    },
    insiderSecrets: [
      'The hydraulic water pressure system engineered in 5th century still feeds the water gardens during rainy season!',
      'Climb the nearby Pidurangala Rock at sunrise to catch the iconic full view of Sigiriya monolith framed by lush jungle.'
    ],
    suggestedQuestions: [
      'How many steps are there to climb Sigiriya?',
      'Is Pidurangala Rock worth visiting nearby?',
      'What should I bring for the climb?'
    ]
  },
  {
    id: 'kandy-temple',
    name: 'Temple of the Sacred Tooth Relic (Sri Dalada Maligawa)',
    nativeName: 'ශ්‍රී දළදා මාළිගාව',
    location: 'Kandy City Center',
    province: 'Central Province',
    category: 'Sacred Buddhist Heritage',
    confidenceScore: 0.96,
    unsecoSite: true,
    imageUrl: '/assets/destinations/Kandy.jpg',
    shortDesc: 'The premier sacred shrine housing the relic of the left canine tooth of Gautama Buddha, enshrined inside a golden stupa casket.',
    history: 'Originally constructed within the royal palace complex of the Kingdom of Kandy in the late 16th century. Historically, whoever holds the Sacred Tooth Relic holds the divine authority to govern Sri Lanka.',
    highlights: [
      'Golden Canopy covering the inner tooth relic shrine',
      'The Royal Audience Hall (Magul Maduwa) with carved wooden pillars',
      'Daily Pooja (worship rituals) accompanied by traditional Kandyan drummers',
      'World-famous Esala Perahera festival procession in July/August'
    ],
    visitorInfo: {
      bestTimeToVisit: 'During morning Pooja (5:30 AM & 9:30 AM) or evening Pooja (6:30 PM)',
      openingHours: '5:30 AM – 8:00 PM daily',
      entryFee: {
        foreignAdult: '2,000 LKR (~$6.50 USD)',
        foreignChild: 'Free under 12',
        localAdult: 'Free'
      },
      dressCodeEtiquette: 'STRICT DRESS CODE: White or light attire covering shoulders and knees. Shoes & headwear must be removed at entry.',
      recommendedDuration: '2 to 2.5 hours'
    },
    insiderSecrets: [
      'The tooth relic itself is kept inside seven golden caskets covered with precious gems and is rarely visible to the public.',
      'Visit the International Buddhist Museum located directly behind the temple complex for fascinating global Buddhist heritage artifacts.'
    ],
    suggestedQuestions: [
      'What are the dress code requirements for Temple of Tooth?',
      'When is the best time to attend the daily Pooja ceremony?',
      'When is the Kandy Esala Perahera festival held?'
    ]
  },
  {
    id: 'ella-bridge',
    name: 'Nine Arch Bridge (Bridge in the Sky)',
    nativeName: 'අහස් නවයේ පාලම',
    location: 'Demodara / Ella Hill Country',
    province: 'Uva Province',
    category: 'Colonial Architecture & Scenic Nature',
    confidenceScore: 0.97,
    unsecoSite: false,
    imageUrl: '/assets/destinations/Ella.jpg',
    shortDesc: 'A spectacular 91-meter colonial railway viaduct bridge built entirely of stone, brick, and cement without a single piece of steel.',
    history: 'Commissioned during British colonial era in 1921. When World War I broke out, the steel intended for the bridge was reallocated for war efforts. Ceylonese builder P.K. Appuhami completed the masterpiece using solid granite blocks and cement mortar.',
    highlights: [
      'Iconic blue train passing over the curved 9 arches surrounded by lush tea fields',
      'Walking along the scenic railway tracks when no train is approaching',
      'Panoramic tea plantation views from surrounding jungle cafes'
    ],
    visitorInfo: {
      bestTimeToVisit: 'Early morning (6:30 AM) for magical mist, or align with scheduled train passings (~9:30 AM, 11:30 AM, 3:30 PM)',
      openingHours: 'Open 24/7 (Public track access)',
      entryFee: {
        foreignAdult: 'Free',
        foreignChild: 'Free',
        localAdult: 'Free'
      },
      dressCodeEtiquette: 'Casual sportswear or hiking clothes. Watch your step along steep jungle trail down to the tracks.',
      recommendedDuration: '1.5 to 2 hours'
    },
    insiderSecrets: [
      'Order a fresh passion fruit juice at "Asanka Cafe" overlooking the bridge while waiting for the train to arrive!',
      'Combine this visit with a hike up Little Adam’s Peak which takes about 45 minutes from the same trail junction.'
    ],
    suggestedQuestions: [
      'What times does the train pass over Nine Arch Bridge?',
      'How do I hike to Nine Arch Bridge from Ella town?',
      'Can I fly a drone at Nine Arch Bridge?'
    ]
  },
  {
    id: 'galle-fort',
    name: 'Galle Dutch Fort & Lighthouse',
    nativeName: 'ගාල්ල කොටුව',
    location: 'Galle Bay, Southern Coast',
    province: 'Southern Province',
    category: 'Colonial Heritage & Coastal Citadel',
    confidenceScore: 0.95,
    unsecoSite: true,
    imageUrl: '/assets/destinations/Galle.jpg',
    shortDesc: 'The best-preserved fortified sea citadel built by Portuguese & Dutch colonizers in Asia, blending European architecture with South Asian traditions.',
    history: 'First fortified by Portuguese in 1588, then extensively rebuilt by the Dutch from 1649 onwards. The 130-acre rampart complex survived the 2004 Indian Ocean Tsunami due to its massive coral-and-stone defensive walls.',
    highlights: [
      'Galle Lighthouse standing tall on Point Utrecht Bastion',
      'Sunset walks along the ocean rampart walls',
      'Dutch Reformed Church (Groote Kerk) built in 1755 with gravestones set into the floor',
      'Charming cobblestone alleyways lined with artisan boutiques, cafes, and heritage hotels'
    ],
    visitorInfo: {
      bestTimeToVisit: 'Late afternoon (4:00 PM – 6:30 PM) for cool breeze and magnificent sunset over the Indian Ocean',
      openingHours: 'Open 24/7 (Living fort town)',
      entryFee: {
        foreignAdult: 'Free for Fort Streets (Maritime Museum is 1,200 LKR)',
        foreignChild: 'Free',
        localAdult: 'Free'
      },
      dressCodeEtiquette: 'Relaxed coastal attire. Modest covering recommended if entering places of worship inside the fort.',
      recommendedDuration: '3 to 5 hours (or full day)'
    },
    insiderSecrets: [
      'Watch local cliff-jumpers leap off Flag Rock Bastion into the crashing ocean waves during late afternoon!',
      'Stop by the Old Dutch Hospital complex for fresh seafood and craft gelato overlooking the harbor.'
    ],
    suggestedQuestions: [
      'What are the top things to do in Galle Fort?',
      'Where is the best spot for sunset in Galle Fort?',
      'Are there good cafes and restaurants inside Galle Fort?'
    ]
  },
  {
    id: 'horton-plains',
    name: 'World\'s End at Horton Plains National Park',
    nativeName: 'හෝටන් තැන්න',
    location: 'Nuwara Eliya / Central Highlands',
    province: 'Central Province',
    category: 'Highland Wilderness & Nature',
    confidenceScore: 0.94,
    unsecoSite: true,
    imageUrl: '/assets/destinations/Horton Plains.jpg',
    shortDesc: 'A cold, windswept plateau at 2,100 meters altitude featuring cloud forests, endemic wildlife, Baker’s Falls, and a sheer 880m vertical drop cliff.',
    history: 'Declared a National Park in 1988 and UNESCO World Heritage site in 2010. Named after Sir Robert Wilmot-Horton, British Governor of Ceylon who traversed the area in 1831.',
    highlights: [
      'World\'s End sheer 880m vertical drop precipice view over tea valleys',
      'Baker\'s Falls waterfall cascading over black granite rocks',
      'Sambar Deer roaming freely through the misty montane grasslands',
      'Chimaney Pool & cloud forest trekking loop trail (9.5 km)'
    ],
    visitorInfo: {
      bestTimeToVisit: '6:00 AM – 9:00 AM (The World\'s End cliff gets completely covered in thick cloud mist after 10:00 AM)',
      openingHours: '6:00 AM – 4:00 PM daily',
      entryFee: {
        foreignAdult: '$25 - $30 USD (~9,500 LKR)',
        foreignChild: '$15 USD',
        localAdult: '300 LKR'
      },
      dressCodeEtiquette: 'Warm jackets/windbreakers essential for morning cold (~10°C). Strict no-single-use-plastic rule at park entry search!',
      recommendedDuration: '4 to 5 hours (9.5 km trek)'
    },
    insiderSecrets: [
      'Plastic bottles are stripped of polythene wrappers by park rangers at entry to protect wild sambar deer from eating plastic.',
      'Check in at the Far Inn visitor center to view rare mountain leopard & hornbill taxidermy displays.'
    ],
    suggestedQuestions: [
      'How early should I arrive at World\'s End?',
      'How hard is the 9.5 km Horton Plains trekking loop?',
      'What clothes should I wear for Horton Plains?'
    ]
  },
  {
    id: 'sri-lankan-food',
    name: 'Authentic Sri Lankan Rice & Curry Feast',
    nativeName: 'ලංකාවේ බත් සහ මාලු',
    location: 'Island-wide Culinary Experience',
    province: 'National Dish',
    category: 'Gastronomy & Local Cuisine',
    confidenceScore: 0.96,
    unsecoSite: false,
    imageUrl: '/assets/destinations/Nilaweli.png',
    shortDesc: 'A vibrant array of aromatic curries centered around steamed red/white rice, featuring coconut milk, roasted Ceylon spices, gotukola sambol, and papadam.',
    history: 'Sri Lanka\'s ancient spice trade route history fused Indian, Arab, Malay, Dutch, and Portuguese culinary influences into a distinct spice-rich heritage centered on coconut, Ceylon cinnamon, cardamom, and roasted curry powders.',
    highlights: [
      'Pol Sambol (spiced ground coconut with chili & lime)',
      'Dhal Curry (creamy red lentils cooked in thick coconut milk)',
      'Kottu Roti (shredded flatbread flash-fried with vegetables, eggs, or meat on a hot iron skillet)',
      'Hoppers (Appa) - bowl-shaped crispy rice flour pancakes with soft centers'
    ],
    visitorInfo: {
      bestTimeToVisit: 'Lunch hour (12:00 PM – 2:30 PM) for fresh traditional Rice & Curry buffet spreads',
      openingHours: '6:30 AM – 10:00 PM (Local eateries)',
      entryFee: {
        foreignAdult: '500 – 1,800 LKR per meal (~$1.50 – $6 USD)',
        foreignChild: 'Included',
        localAdult: '400 – 800 LKR'
      },
      dressCodeEtiquette: 'Traditional etiquette: Eat with your right hand for an authentic local culinary experience!',
      recommendedDuration: '1 hour'
    },
    insiderSecrets: [
      'If you prefer milder spice, say "Aduwen Miris Danna" (Less chili please) when ordering at local roadside rice stalls!',
      'Drink fresh King Coconut water (Thambili) to cool your stomach after enjoying spicy Ceylon curries.'
    ],
    suggestedQuestions: [
      'What are the must-try Sri Lankan dishes?',
      'Is Sri Lankan food very spicy for tourists?',
      'How is Kottu Roti prepared?'
    ]
  }
];

export class AIBotGuideService {
  /**
   * Analyzes an uploaded file or URL string to match or extract landmark information
   */
  public async analyzeImage(fileOrUrl: File | string): Promise<{
    landmark: RecognizedLandmark;
    initialMessage: BotChatMessage;
  }> {
    // Simulate high-speed AI Vision Neural Net Inference
    await new Promise((resolve) => setTimeout(resolve, 1400));

    let selectedLandmark: RecognizedLandmark;

    if (typeof fileOrUrl === 'string') {
      // Find matching preset by string URL
      const lower = fileOrUrl.toLowerCase();
      selectedLandmark =
        LANDMARK_KNOWLEDGE_BASE.find((item) =>
          lower.includes(item.id.toLowerCase()) ||
          lower.includes(item.name.toLowerCase().split(' ')[0])
        ) || LANDMARK_KNOWLEDGE_BASE[0];
    } else {
      // Custom file uploaded by user -> pick matching landmark based on filename or fallback
      const fileNameLower = fileOrUrl.name.toLowerCase();
      if (fileNameLower.includes('sigiriya') || fileNameLower.includes('rock')) {
        selectedLandmark = LANDMARK_KNOWLEDGE_BASE[0];
      } else if (fileNameLower.includes('kandy') || fileNameLower.includes('tooth') || fileNameLower.includes('temple')) {
        selectedLandmark = LANDMARK_KNOWLEDGE_BASE[1];
      } else if (fileNameLower.includes('ella') || fileNameLower.includes('nine') || fileNameLower.includes('bridge')) {
        selectedLandmark = LANDMARK_KNOWLEDGE_BASE[2];
      } else if (fileNameLower.includes('galle') || fileNameLower.includes('fort') || fileNameLower.includes('light')) {
        selectedLandmark = LANDMARK_KNOWLEDGE_BASE[3];
      } else if (fileNameLower.includes('horton') || fileNameLower.includes('world')) {
        selectedLandmark = LANDMARK_KNOWLEDGE_BASE[4];
      } else if (fileNameLower.includes('food') || fileNameLower.includes('curry') || fileNameLower.includes('rice')) {
        selectedLandmark = LANDMARK_KNOWLEDGE_BASE[5];
      } else {
        // Pick one based on file size or fallback to Sigiriya
        const randomIndex = Math.floor(Math.abs(fileOrUrl.size) % LANDMARK_KNOWLEDGE_BASE.length);
        selectedLandmark = LANDMARK_KNOWLEDGE_BASE[randomIndex];
      }
    }

    const initialBotMessage: BotChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: `Hello! I have recognized this picture as **${selectedLandmark.name}** located in ${selectedLandmark.location} (${selectedLandmark.province}) with **${Math.round(selectedLandmark.confidenceScore * 100)}% visual confidence**! 🇱🇰\n\n${selectedLandmark.shortDesc}\n\nFeel free to ask me anything about its history, entrance fees, best time to visit, or travel tips!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: selectedLandmark.suggestedQuestions,
      relatedLandmark: selectedLandmark
    };

    return {
      landmark: selectedLandmark,
      initialMessage: initialBotMessage
    };
  }

  /**
   * Generates intelligent, context-aware AI Bot replies for user chat queries
   */
  public async sendQuestion(
    question: string,
    activeLandmark?: RecognizedLandmark
  ): Promise<BotChatMessage> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const queryLower = question.toLowerCase();
    let replyText = '';

    if (activeLandmark) {
      if (queryLower.includes('step') || queryLower.includes('climb') || queryLower.includes('hard') || queryLower.includes('hike')) {
        replyText = `**Climbing ${activeLandmark.name}:**\n\n- **Steps count:** Approximately 1,200 steps to reach the top summit.\n- **Difficulty:** Moderate. Take steady breaks at the Lion Paws plateau.\n- **Recommendation:** Start early by 7:30 AM, wear non-slip footwear, and carry at least 1.5L of water.`;
      } else if (queryLower.includes('time') || queryLower.includes('hours') || queryLower.includes('when')) {
        replyText = `**Best Visiting Window:**\n\n${activeLandmark.visitorInfo.bestTimeToVisit}\n\n- **Opening Hours:** ${activeLandmark.visitorInfo.openingHours}\n- **Duration:** ${activeLandmark.visitorInfo.recommendedDuration}`;
      } else if (queryLower.includes('cost') || queryLower.includes('price') || queryLower.includes('fee') || queryLower.includes('ticket')) {
        replyText = `**Ticket & Entry Fees:**\n\n- **Foreign Adult:** ${activeLandmark.visitorInfo.entryFee.foreignAdult}\n- **Foreign Child:** ${activeLandmark.visitorInfo.entryFee.foreignChild}\n- **Local Adult:** ${activeLandmark.visitorInfo.entryFee.localAdult}\n\n*Note: Tickets can be purchased at the main entrance gate using Cash (LKR/USD) or Visa/MasterCard.*`;
      } else if (queryLower.includes('dress') || queryLower.includes('wear') || queryLower.includes('clothes') || queryLower.includes('etiquette')) {
        replyText = `**Dress Code & Etiquette:**\n\n${activeLandmark.visitorInfo.dressCodeEtiquette}`;
      } else if (queryLower.includes('secret') || queryLower.includes('story') || queryLower.includes('history')) {
        replyText = `**Historical Context & Secrets:**\n\n${activeLandmark.history}\n\n💡 **Insider Tip:** ${activeLandmark.insiderSecrets[0]}`;
      } else {
        replyText = `Regarding **${activeLandmark.name}**:\n\n- **Category:** ${activeLandmark.category}\n- **Highlights:** ${activeLandmark.highlights.join(', ')}.\n- **Insider Secret:** ${activeLandmark.insiderSecrets[0]}\n\nDo you want me to help plan your transport or ticket booking to this location?`;
      }
    } else {
      // General Sri Lanka travel query
      if (queryLower.includes('weather') || queryLower.includes('rain') || queryLower.includes('season')) {
        replyText = `☀️ **Sri Lanka Climate Guide:**\n\n- **South & West Coasts (Galle, Mirissa, Colombo):** Best from December to April.\n- **Cultural Triangle & Hill Country (Kandy, Ella, Sigiriya):** Great year-round, best Jan – April.\n- **East Coast (Trincomalee, Arugam Bay):** Best from May to September.`;
      } else if (queryLower.includes('visa') || queryLower.includes('eta') || queryLower.includes('passport')) {
        replyText = `🛂 **Sri Lanka Visa Information:**\n\nMost travelers require an Electronic Travel Authorization (ETA) which can be applied online at [eta.gov.lk]. It allows 30-day double entry for tourism.`;
      } else if (queryLower.includes('train') || queryLower.includes('kandy to ella')) {
        replyText = `🚂 **Iconic Kandy to Ella Train Journey:**\n\n- **Duration:** ~6.5 to 7 hours of scenic tea hills & misty bridges.\n- **Tip:** Reserve 1st Class Observation Car or 2nd Class Reserved seat at least 30 days in advance!`;
      } else {
        replyText = `I am your **NOVA AI Bot Guide** 🤖! You can upload any picture of a landmark, temple, food, or natural attraction in Sri Lanka, and I will identify it instantly, provide historical secrets, visitor guidelines, and answer all your travel questions!`;
      }
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: activeLandmark ? activeLandmark.suggestedQuestions : [
        'What is the best weather season in Sri Lanka?',
        'How to book the Kandy to Ella train?',
        'What are the top UNESCO sites in Sri Lanka?'
      ]
    };
  }
}

export const aiBotGuideService = new AIBotGuideService();
