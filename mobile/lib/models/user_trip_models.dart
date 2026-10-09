
class TripStepProgress {
  final bool destination;
  final bool preferences;
  final bool aiPlanning;
  final bool itinerary;
  final bool bookings;

  const TripStepProgress({
    this.destination = true,
    this.preferences = true,
    this.aiPlanning = true,
    this.itinerary = true,
    this.bookings = false,
  });

  factory TripStepProgress.fromJson(Map<String, dynamic> json) {
    return TripStepProgress(
      destination: json['destination'] ?? true,
      preferences: json['preferences'] ?? true,
      aiPlanning: json['aiPlanning'] ?? true,
      itinerary: json['itinerary'] ?? true,
      bookings: json['bookings'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'destination': destination,
    'preferences': preferences,
    'aiPlanning': aiPlanning,
    'itinerary': itinerary,
    'bookings': bookings,
  };
}

class TripActivityDetail {
  final String time;
  final String title;
  final String location;
  final String description;
  final String status;
  final String type;
  final String? activityStatus;

  TripActivityDetail({
    required this.time,
    required this.title,
    required this.location,
    required this.description,
    this.status = 'Confirmed',
    this.type = 'Sightseeing',
    this.activityStatus,
  });

  factory TripActivityDetail.fromJson(Map<String, dynamic> json) {
    return TripActivityDetail(
      time: json['time'] ?? '09:00 AM',
      title: json['title'] ?? 'Scenic Activity',
      location: json['location'] ?? 'Sri Lanka',
      description: json['description'] ?? '',
      status: json['status'] ?? 'Confirmed',
      type: json['type'] ?? 'Sightseeing',
      activityStatus: json['activityStatus'],
    );
  }

  Map<String, dynamic> toJson() => {
    'time': time,
    'title': title,
    'location': location,
    'description': description,
    'status': status,
    'type': type,
    'activityStatus': activityStatus,
  };
}

class TripDayItinerary {
  final int day;
  final String date;
  final String title;
  final String? status;
  final List<TripActivityDetail> activities;

  TripDayItinerary({
    required this.day,
    required this.date,
    required this.title,
    this.status,
    required this.activities,
  });

  factory TripDayItinerary.fromJson(Map<String, dynamic> json) {
    var rawActs = json['activities'] as List<dynamic>? ?? [];
    return TripDayItinerary(
      day: (json['day'] as num?)?.toInt() ?? 1,
      date: json['date'] ?? 'Day 1',
      title: json['title'] ?? 'Exploration',
      status: json['status'],
      activities: rawActs.map((a) => TripActivityDetail.fromJson(a as Map<String, dynamic>)).toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'day': day,
    'date': date,
    'title': title,
    'status': status,
    'activities': activities.map((a) => a.toJson()).toList(),
  };
}

class TripBookingDetail {
  final String id;
  final String type;
  final String provider;
  final String details;
  final String dates;
  final String confirmationCode;
  final String amount;
  final String status;
  final String? destination;
  final String? packageName;
  final String? guestName;
  final String? guestEmail;
  final String? guestPhone;
  final int? nights;
  final int? rooms;
  final String? checkInDate;
  final String? checkOutDate;
  final String? bookedAt;
  final String? paymentMethod;
  final String? taxesAndService;
  final String? subtotal;
  final List<String> includedFacilities;
  final String? specialRequests;

  TripBookingDetail({
    required this.id,
    required this.type,
    required this.provider,
    required this.details,
    required this.dates,
    required this.confirmationCode,
    required this.amount,
    this.status = 'Confirmed',
    this.destination,
    this.packageName,
    this.guestName,
    this.guestEmail,
    this.guestPhone,
    this.nights,
    this.rooms,
    this.checkInDate,
    this.checkOutDate,
    this.bookedAt,
    this.paymentMethod,
    this.taxesAndService,
    this.subtotal,
    this.includedFacilities = const [],
    this.specialRequests,
  });

  factory TripBookingDetail.fromJson(Map<String, dynamic> json) {
    return TripBookingDetail(
      id: json['id'] ?? 'bk-${DateTime.now().millisecondsSinceEpoch}',
      type: json['type'] ?? 'Hotel',
      provider: json['provider'] ?? 'Staycation Provider',
      details: json['details'] ?? '',
      dates: json['dates'] ?? '',
      confirmationCode: json['confirmationCode'] ?? 'SRI-RES-1001',
      amount: json['amount'] ?? '\$150',
      status: json['status'] ?? 'Confirmed',
      destination: json['destination'],
      packageName: json['packageName'],
      guestName: json['guestName'],
      guestEmail: json['guestEmail'],
      guestPhone: json['guestPhone'],
      nights: (json['nights'] as num?)?.toInt(),
      rooms: (json['rooms'] as num?)?.toInt(),
      checkInDate: json['checkInDate'],
      checkOutDate: json['checkOutDate'],
      bookedAt: json['bookedAt'],
      paymentMethod: json['paymentMethod'],
      taxesAndService: json['taxesAndService'],
      subtotal: json['subtotal'],
      includedFacilities: (json['includedFacilities'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const [],
      specialRequests: json['specialRequests'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type,
    'provider': provider,
    'details': details,
    'dates': dates,
    'confirmationCode': confirmationCode,
    'amount': amount,
    'status': status,
    'destination': destination,
    'packageName': packageName,
    'guestName': guestName,
    'guestEmail': guestEmail,
    'guestPhone': guestPhone,
    'nights': nights,
    'rooms': rooms,
    'checkInDate': checkInDate,
    'checkOutDate': checkOutDate,
    'bookedAt': bookedAt,
    'paymentMethod': paymentMethod,
    'taxesAndService': taxesAndService,
    'subtotal': subtotal,
    'includedFacilities': includedFacilities,
    'specialRequests': specialRequests,
  };
}

class UserTripDetail {
  final String id;
  String name;
  String destination;
  String destinationId;
  String? startDate;
  String? endDate;
  String dates;
  String duration;
  int travelers;
  List<String> travelerNames;
  String status; // 'Upcoming' | 'Planning' | 'Ongoing' | 'Completed' | 'Cancelled'
  String? timelineLabel;
  String imageUrl;
  String budget;
  String spentBudget;
  bool isFeatured;
  TripStepProgress progress;
  List<String> interests;
  String notes;
  String weatherForecast;
  String? aiNotes;
  List<TripDayItinerary> dailyItinerary;
  List<TripBookingDetail> bookingsList;

  UserTripDetail({
    required this.id,
    required this.name,
    required this.destination,
    required this.destinationId,
    this.startDate,
    this.endDate,
    required this.dates,
    required this.duration,
    required this.travelers,
    this.travelerNames = const ['Sanath Wickramasinghe', 'Anula Wickramasinghe'],
    required this.status,
    this.timelineLabel,
    required this.imageUrl,
    this.budget = '\$600',
    this.spentBudget = '\$0',
    this.isFeatured = false,
    this.progress = const TripStepProgress(),
    this.interests = const ['Culture', 'Nature'],
    this.notes = '',
    this.weatherForecast = '26°C · Pleasant & Sunny',
    this.aiNotes,
    this.dailyItinerary = const [],
    this.bookingsList = const [],
  });

  factory UserTripDetail.fromJson(Map<String, dynamic> json) {
    return UserTripDetail(
      id: json['id'] ?? '',
      name: json['name'] ?? json['title'] ?? 'Sri Lanka Journey',
      destination: json['destination'] ?? 'Sri Lanka',
      destinationId: json['destinationId'] ?? 'sri_lanka',
      startDate: json['startDate'],
      endDate: json['endDate'],
      dates: json['dates'] ?? 'Oct 2026',
      duration: json['duration'] ?? '5 Days',
      travelers: (json['travelers'] as num?)?.toInt() ?? 2,
      travelerNames: (json['travelerNames'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const ['Sanath Wickramasinghe'],
      status: json['status'] ?? 'Upcoming',
      timelineLabel: json['timelineLabel'],
      imageUrl: json['imageUrl'] ?? 'assets/images/destinations/Mirissa.jpg',
      budget: json['budget'] ?? '\$600',
      spentBudget: json['spentBudget'] ?? '\$0',
      isFeatured: json['isFeatured'] ?? false,
      progress: json['progress'] != null ? TripStepProgress.fromJson(json['progress']) : const TripStepProgress(),
      interests: (json['interests'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const ['Culture', 'Nature'],
      notes: json['notes'] ?? '',
      weatherForecast: json['weatherForecast'] ?? '25°C · Pleasant',
      aiNotes: json['aiNotes'],
      dailyItinerary: (json['dailyItinerary'] as List<dynamic>?)?.map((d) => TripDayItinerary.fromJson(d as Map<String, dynamic>)).toList() ?? const [],
      bookingsList: (json['bookingsList'] as List<dynamic>?)?.map((b) => TripBookingDetail.fromJson(b as Map<String, dynamic>)).toList() ?? const [],
    );
  }
}

/// Rich Mock Trips corresponding to the website dataset
final List<UserTripDetail> kMockTripsData = [
  // 1. Featured Primary Ongoing Journey in Mirissa (Matches user screenshot!)
  UserTripDetail(
    id: 'trip-mirissa-safari',
    name: 'Southern Coast Safari & Surf',
    destination: 'MIRISSA',
    destinationId: 'mirissa',
    startDate: '2026-11-10',
    endDate: '2026-11-15',
    dates: 'Nov 10 - Nov 15, 2026',
    duration: '5 Days',
    travelers: 2,
    travelerNames: ['Sanath Wickramasinghe', 'Anula Wickramasinghe'],
    status: 'Ongoing',
    timelineLabel: 'Ongoing - Day 1 of 5 (4 days remaining)',
    imageUrl: 'assets/images/destinations/Mirissa.jpg',
    budget: '\$1200',
    spentBudget: '\$450',
    isFeatured: true,
    progress: const TripStepProgress(
      destination: true,
      preferences: true,
      aiPlanning: true,
      itinerary: true,
      bookings: true,
    ),
    interests: ['Beaches', 'Whale Safari', 'Surfing', 'Coastal Seafood'],
    notes: 'Transport: Private Air-Conditioned Van. Guide: Certified Southern Coast Marine Naturalist.',
    weatherForecast: '28°C · Tropical Sunshine & Warm Ocean Breezes',
    aiNotes: 'Pro tip: Early morning 6:00 AM whale watching tours have the calmest seas and highest blue whale spotting success rate.',
    dailyItinerary: [
      TripDayItinerary(
        day: 1,
        date: 'Day 1 · Today',
        title: 'Arrival, Coconut Tree Hill & Sunset Surf',
        status: 'Today',
        activities: [
          TripActivityDetail(
            time: '10:30 AM',
            title: 'Check-in at Mandara Resort Mirissa',
            location: 'Mirissa Bay Beachfront',
            description: 'Unpack in ocean-view cabana and enjoy fresh king coconut welcome drink.',
            status: 'Confirmed',
            type: 'Stay',
            activityStatus: 'In Progress',
          ),
          TripActivityDetail(
            time: '04:00 PM',
            title: 'Coconut Tree Hill Panoramic Viewpoint',
            location: 'Mirissa Headland',
            description: 'Stroll along the palm-fringed cliff overlooking the turquoise Indian Ocean.',
            status: 'Planned',
            type: 'Sightseeing',
            activityStatus: 'Upcoming',
          ),
          TripActivityDetail(
            time: '07:30 PM',
            title: 'Fresh Catch Seafood BBQ Dinner',
            location: 'Mirissa Beach Strip',
            description: 'Candlelight dining on the sand with grilled jumbo prawns and spiced calamari.',
            status: 'Planned',
            type: 'Dining',
            activityStatus: 'Upcoming',
          ),
        ],
      ),
      TripDayItinerary(
        day: 2,
        date: 'Day 2 · Tomorrow',
        title: 'Blue Whale & Dolphin Safari',
        status: 'Upcoming',
        activities: [
          TripActivityDetail(
            time: '06:00 AM',
            title: 'Mirissa Harbor Deep Sea Whale Watching',
            location: 'Mirissa Fishery Harbor',
            description: 'Catamaran boat voyage to spot blue whales, sperm whales, and spinner dolphins.',
            status: 'Confirmed',
            type: 'Activity',
            activityStatus: 'Upcoming',
          ),
          TripActivityDetail(
            time: '02:00 PM',
            title: 'Secret Beach Relax & Snorkeling',
            location: 'Mirissa Secret Beach',
            description: 'Tucked away rocky bay ideal for snorkeling amongst green sea turtles.',
            status: 'Planned',
            type: 'Activity',
            activityStatus: 'Upcoming',
          ),
        ],
      ),
      TripDayItinerary(
        day: 3,
        date: 'Day 3',
        title: 'Weligama Surf Clinic & Sunset Catamaran',
        status: 'Upcoming',
        activities: [
          TripActivityDetail(
            time: '09:00 AM',
            title: 'Beginner & Intermediate Surf Lesson',
            location: 'Weligama Bay',
            description: 'Gentle sand-break waves coached by ISA certified surf instructors.',
            status: 'Planned',
            type: 'Activity',
            activityStatus: 'Upcoming',
          ),
        ],
      ),
    ],
    bookingsList: [
      TripBookingDetail(
        id: 'bk-mir-1',
        type: 'Hotel',
        provider: 'Mandara Resort Mirissa',
        details: '4 Nights · Luxury Ocean View Villa with Breakfast',
        dates: '10 Nov – 15 Nov 2026',
        confirmationCode: 'SRI-MIR-92014',
        amount: '\$480',
        status: 'Confirmed',
        destination: 'Mirissa',
        packageName: 'Signature Coastal Luxury Retreat',
        guestName: 'Sanath Wickramasinghe',
        guestEmail: 'sanath.w@novatours.lk',
        guestPhone: '+94 77 987 6543',
        nights: 4,
        rooms: 1,
        checkInDate: '2026-11-10',
        checkOutDate: '2026-11-15',
        bookedAt: 'Nov 02, 2026 · 11:20',
        paymentMethod: 'MasterCard Verified · Visa Direct',
        taxesAndService: '\$24',
        subtotal: '\$456',
        includedFacilities: ['Private Beach Access', 'Infinity Pool', 'Daily Breakfast Buffet', 'Snorkeling Gear Included'],
        specialRequests: 'Upper-floor quiet villa with clear sunset ocean panorama',
      ),
      TripBookingDetail(
        id: 'bk-mir-2',
        type: 'Activity',
        provider: 'Mirissa Marine Catamaran Expeditions',
        details: '2 Fast-Vessel Whale Watching Tickets with Breakfast Box',
        dates: '11 Nov 2026 (06:00 AM)',
        confirmationCode: 'WHALE-8812',
        amount: '\$90',
        status: 'Confirmed',
      ),
    ],
  ),

  // 2. Kandy Escape (Ongoing)
  UserTripDetail(
    id: 'trip-kandy-escape',
    name: 'Kandy Escape',
    destination: 'KANDY',
    destinationId: 'kandy',
    startDate: '2026-09-28',
    endDate: '2026-10-02',
    dates: '28 Sep – 02 Oct 2026',
    duration: '5 Days',
    travelers: 2,
    travelerNames: ['Sanath Wickramasinghe', 'Anula Wickramasinghe'],
    status: 'Ongoing',
    timelineLabel: 'Ongoing - Day 2 of 5',
    imageUrl: 'assets/images/destinations/Kandy.jpg',
    budget: '\$250',
    spentBudget: '\$110',
    isFeatured: false,
    progress: const TripStepProgress(
      destination: true,
      preferences: true,
      aiPlanning: true,
      itinerary: true,
      bookings: true,
    ),
    interests: ['Culture', 'Temple Relics', 'Highland Gardens', 'Tea Tasting'],
    notes: 'Stay at Earl’s Regency Hotel. Scenic train tickets reserved for morning departure from Fort Station.',
    weatherForecast: '24°C · Mostly Sunny with mild evening highland breeze',
    aiNotes: 'Pro tip: Dress modestly covering shoulders and knees for the Temple of the Tooth Relic visit.',
    dailyItinerary: [
      TripDayItinerary(
        day: 1,
        date: 'Day 1',
        title: 'Scenic Train Ride & Sacred Temple Exploration',
        status: 'Completed',
        activities: [
          TripActivityDetail(
            time: '07:00 AM',
            title: 'Colombo Fort to Kandy Observation Car Train',
            location: 'Colombo Fort Railway Station',
            description: 'Board the historic main-line train winding through misty mountain tunnels and tea plantations.',
            status: 'Confirmed',
            type: 'Transit',
            activityStatus: 'Completed',
          ),
          TripActivityDetail(
            time: '04:30 PM',
            title: 'Temple of the Sacred Tooth Relic Evening Puja',
            location: 'Kandy Royal Palace Complex',
            description: 'Attend the sacred evening drum ritual and view the golden relic casket.',
            status: 'Confirmed',
            type: 'Sightseeing',
            activityStatus: 'Completed',
          ),
        ],
      ),
      TripDayItinerary(
        day: 2,
        date: 'Day 2 · Today',
        title: 'Royal Botanical Gardens & Ceylon Tea Estate',
        status: 'Today',
        activities: [
          TripActivityDetail(
            time: '08:30 AM',
            title: 'Peradeniya Royal Botanical Gardens Tour',
            location: 'Peradeniya, Kandy',
            description: 'Stroll through the 147-acre gardens, Giant Javan Fig tree lawn, and Orchid House.',
            status: 'Confirmed',
            type: 'Activity',
            activityStatus: 'In Progress',
          ),
        ],
      ),
    ],
    bookingsList: [
      TripBookingDetail(
        id: 'bk-knd-1',
        type: 'Hotel',
        provider: "Earl's Regency Hotel Kandy",
        details: '4 Nights · Deluxe River View Room with Breakfast',
        dates: '28 Sep – 02 Oct 2026',
        confirmationCode: 'KND-88219',
        amount: '\$280',
        status: 'Confirmed',
        destination: 'Kandy',
        packageName: 'Deluxe River View Retreat',
        guestName: 'Hiruni Praboda',
        nights: 4,
        rooms: 1,
        checkInDate: '2026-09-28',
        checkOutDate: '2026-10-02',
        bookedAt: 'Sep 10, 2026 · 14:32',
        paymentMethod: 'Credit / Debit Card',
        taxesAndService: '\$14',
        subtotal: '\$266',
        includedFacilities: ['Swimming Pool', 'Daily Breakfast', 'Free Wi-Fi', 'Balcony River View'],
      ),
    ],
  ),

  // 3. Ella Misty Heights (Upcoming)
  UserTripDetail(
    id: 'trip-hill-country',
    name: 'Hill Country Escape',
    destination: 'ELLA',
    destinationId: 'ella',
    startDate: '2026-10-24',
    endDate: '2026-10-28',
    dates: '24 – 28 October 2026',
    duration: '4 Days',
    travelers: 2,
    status: 'Upcoming',
    timelineLabel: 'In 20 days',
    imageUrl: 'assets/images/destinations/Ella.jpg',
    budget: '\$320',
    spentBudget: '\$190',
    progress: const TripStepProgress(
      destination: true,
      preferences: true,
      aiPlanning: true,
      itinerary: true,
      bookings: true,
    ),
    interests: ['Mountains', 'Tea Estates', 'Hiking', 'Railway Engineering'],
    weatherForecast: '21°C · Crisp Highland Mist & Cool Evenings',
    aiNotes: 'Sunrise at Nine Arches Bridge occurs around 05:45 AM. Arrive early for crowd-free photography.',
    dailyItinerary: [
      TripDayItinerary(
        day: 1,
        date: 'Day 1',
        title: 'Nine Arches Sunrise & Mountain Check-in',
        activities: [
          TripActivityDetail(
            time: '06:00 AM',
            title: 'Nine Arches Bridge Morning Train Spotting',
            location: 'Gotuwala, Ella',
            description: 'Watch the morning express train emerge through misty jungle hills across the 9 arches.',
            status: 'Confirmed',
            type: 'Sightseeing',
          ),
        ],
      ),
    ],
    bookingsList: [
      TripBookingDetail(
        id: 'bk-ella-1',
        type: 'Hotel',
        provider: '98 Acres Resort & Spa',
        details: '3 Nights · Premium Chalet with Breakfast & Tea Plantation Tour',
        dates: '24 Oct – 27 Oct 2026',
        confirmationCode: 'ELA-77182',
        amount: '\$240',
        status: 'Confirmed',
        destination: 'Ella',
        packageName: 'Eco-Luxury Mountain Chalet',
        guestName: 'Sanath Wickramasinghe',
        nights: 3,
        rooms: 1,
        checkInDate: '2026-10-24',
        checkOutDate: '2026-10-27',
        bookedAt: 'Oct 01, 2026 · 10:15',
        paymentMethod: 'Visa Card (Online)',
        taxesAndService: '\$20',
        subtotal: '\$220',
        includedFacilities: ['Private Mountain View Balcony', 'Helipad Access', 'Free Plantation Tour', 'Pool Access'],
      ),
    ],
  ),

  // 4. Sigiriya Sky Fortress Expedition (Planning)
  UserTripDetail(
    id: 'trip-cultural-journey-planning',
    name: 'Sigiriya Sky Fortress Expedition',
    destination: 'SIGIRIYA',
    destinationId: 'sigiriya',
    startDate: '2026-11-20',
    endDate: '2026-11-24',
    dates: '20 – 24 November 2026',
    duration: '4 Days',
    travelers: 2,
    status: 'Planning',
    timelineLabel: 'In Planning',
    imageUrl: 'assets/images/destinations/sigiriya.jpg',
    budget: '\$550',
    spentBudget: '\$0',
    progress: const TripStepProgress(
      destination: true,
      preferences: true,
      aiPlanning: true,
      itinerary: false,
      bookings: false,
    ),
    interests: ['Ancient Ruins', 'Royal Palaces', 'Rock Climbing'],
    weatherForecast: '27°C · Sunny & Warm',
    notes: 'Transport: Private SUV. Guide: Licensed Archaeological Tour Guide.',
  ),

  // 5. Galle Dutch Heritage (Completed)
  UserTripDetail(
    id: 'trip-galle-heritage',
    name: 'Galle Dutch Heritage & Sunset Fort',
    destination: 'GALLE',
    destinationId: 'galle',
    startDate: '2026-08-10',
    endDate: '2026-08-13',
    dates: '10 – 13 August 2026',
    duration: '3 Days',
    travelers: 2,
    status: 'Completed',
    timelineLabel: 'Completed last month',
    imageUrl: 'assets/images/destinations/Galle.jpg',
    budget: '\$350',
    spentBudget: '\$340',
    progress: const TripStepProgress(
      destination: true,
      preferences: true,
      aiPlanning: true,
      itinerary: true,
      bookings: true,
    ),
    interests: ['Dutch Fort', 'Colonial Architecture', 'Lighthouse', 'Gems'],
    notes: 'Stay at Amangalla. Evening walking tour along the ramparts.',
    weatherForecast: '29°C · Tropical Sunshine',
  ),

  // 6. Wild Yala Wildlife Safari (Completed)
  UserTripDetail(
    id: 'trip-yala-safari',
    name: 'Wild Yala Wildlife Safari',
    destination: 'YALA',
    destinationId: 'yala',
    startDate: '2026-02-10',
    endDate: '2026-02-12',
    dates: '10 – 12 February 2026',
    duration: '2 Days',
    travelers: 4,
    status: 'Completed',
    timelineLabel: 'Completed',
    imageUrl: 'assets/images/destinations/Yala.jpg',
    budget: '\$370',
    spentBudget: '\$370',
    interests: ['Leopard Safari', 'Elephants', 'Birdwatching'],
    weatherForecast: '31°C · Dry Zone Sunshine',
  ),

  // 7. Horton Plains Trek (Completed)
  UserTripDetail(
    id: 'trip-horton-plains',
    name: 'Highland Mist Retreat & World’s End',
    destination: 'HORTON PLAINS',
    destinationId: 'horton_plains',
    startDate: '2026-03-01',
    endDate: '2026-03-03',
    dates: '01 – 03 March 2026',
    duration: '3 Days',
    travelers: 2,
    status: 'Completed',
    timelineLabel: 'Completed',
    imageUrl: 'assets/images/destinations/horton_plains.jpg',
    budget: '\$220',
    spentBudget: '\$215',
    interests: ['Trekking', 'Cloud Forest', 'Waterfalls'],
    weatherForecast: '16°C · Misty & Cool',
  ),

  // 8. Colombo City & Food Safari (Ongoing)
  UserTripDetail(
    id: 'trip-colombo-food',
    name: 'Colombo Culinary & Heritage Trail',
    destination: 'COLOMBO',
    destinationId: 'colombo',
    startDate: '2026-10-01',
    endDate: '2026-10-04',
    dates: '01 – 04 October 2026',
    duration: '3 Days',
    travelers: 2,
    status: 'Ongoing',
    timelineLabel: 'Ongoing - Day 3 of 3',
    imageUrl: 'assets/images/destinations/Sri_lanka_beauty.jpg',
    budget: '\$180',
    spentBudget: '\$140',
    isFeatured: false,
    interests: ['Street Food', 'Kottu Roti', 'Dutch Hospital', 'Galle Face Green'],
    weatherForecast: '30°C · Warm & Humid',
  ),

  // 9. Anuradhapura Sacred Cities (Upcoming)
  UserTripDetail(
    id: 'trip-anuradhapura',
    name: 'Sacred Ancient Capital Pilgrimage',
    destination: 'ANURADHAPURA',
    destinationId: 'anuradhapura',
    startDate: '2026-12-15',
    endDate: '2026-12-18',
    dates: '15 – 18 December 2026',
    duration: '4 Days',
    travelers: 3,
    status: 'Upcoming',
    timelineLabel: 'In 2 months',
    imageUrl: 'assets/images/destinations/Anuradhapura.jpg',
    budget: '\$290',
    spentBudget: '\$40',
    interests: ['Ruwanwelisaya', 'Sri Maha Bodhi', 'Historical Stupas'],
    weatherForecast: '26°C · Sunny & Breezy',
  ),

  // 10. Nilaveli Beach Escape (Ongoing)
  UserTripDetail(
    id: 'trip-nilaveli-beach',
    name: 'Nilaveli Turquoise Coast & Pigeon Island',
    destination: 'TRINCOMALEE',
    destinationId: 'trincomalee',
    startDate: '2026-10-03',
    endDate: '2026-10-07',
    dates: '03 – 07 October 2026',
    duration: '5 Days',
    travelers: 2,
    status: 'Ongoing',
    timelineLabel: 'Ongoing - Day 2 of 5',
    imageUrl: 'assets/images/destinations/Nilaweli.png',
    budget: '\$450',
    spentBudget: '\$180',
    interests: ['Coral Reefs', 'Shark Snorkeling', 'White Sand Beaches'],
    weatherForecast: '29°C · Tropical Sunshine',
  ),

  // 11. Riverston Misty Peak Adventure (Ongoing)
  UserTripDetail(
    id: 'trip-riverston',
    name: 'Knuckles Mountain & Riverston Trek',
    destination: 'MATALE',
    destinationId: 'riverston',
    startDate: '2026-10-02',
    endDate: '2026-10-05',
    dates: '02 – 05 October 2026',
    duration: '4 Days',
    travelers: 4,
    status: 'Ongoing',
    timelineLabel: 'Ongoing - Day 3 of 4',
    imageUrl: 'assets/images/destinations/riverston.jpg',
    budget: '\$310',
    spentBudget: '\$200',
    interests: ['Highland Trekking', 'Mini World’s End', 'Waterfalls'],
    weatherForecast: '19°C · Highland Breezes',
  ),

  // 12. Bentota Water Sports (Ongoing)
  UserTripDetail(
    id: 'trip-bentota-watersports',
    name: 'Bentota Lagoon & Golden Sands',
    destination: 'BENTOTA',
    destinationId: 'bentota',
    startDate: '2026-10-01',
    endDate: '2026-10-06',
    dates: '01 – 06 October 2026',
    duration: '6 Days',
    travelers: 2,
    status: 'Ongoing',
    timelineLabel: 'Ongoing - Day 4 of 6',
    imageUrl: 'assets/images/destinations/sri_lanka_hero.jpg',
    budget: '\$580',
    spentBudget: '\$320',
    interests: ['Jet Ski', 'River Safari', 'Turtle Hatchery'],
    weatherForecast: '28°C · Sunny & Warm',
  ),
];
