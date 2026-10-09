class GuideModel {
  final int id;
  final String name;
  final String email;
  final String phone;
  final List<String> languages;
  final List<String> specialties;
  final double rating;
  final int toursCompleted;
  final String status;
  final String verificationStatus;
  final String avatarUrl;
  final String bio;
  final int yearsExperience;

  GuideModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone = '',
    this.languages = const [],
    this.specialties = const [],
    this.rating = 0.0,
    this.toursCompleted = 0,
    this.status = 'Available',
    this.verificationStatus = 'Pending',
    this.avatarUrl = '',
    this.bio = '',
    this.yearsExperience = 0,
  });

  factory GuideModel.fromJson(Map<String, dynamic> json) {
    int parsedId = 0;
    if (json['id'] is int) {
      parsedId = json['id'];
    } else if (json['id'] != null) {
      parsedId = int.tryParse(json['id'].toString()) ?? 0;
    }

    return GuideModel(
      id: parsedId,
      name: json['name']?.toString() ?? 'Licensed Guide',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      languages: (json['languages'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      specialties: (json['specialties'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : (double.tryParse(json['rating']?.toString() ?? '0') ?? 0.0),
      toursCompleted: (json['toursCompleted'] is num) ? (json['toursCompleted'] as num).toInt() : (int.tryParse(json['toursCompleted']?.toString() ?? '0') ?? 0),
      status: json['status']?.toString() ?? 'Available',
      verificationStatus: json['verificationStatus']?.toString() ?? 'Pending',
      avatarUrl: json['avatarUrl']?.toString() ?? '',
      bio: json['bio']?.toString() ?? '',
      yearsExperience: (json['yearsExperience'] is num) ? (json['yearsExperience'] as num).toInt() : (int.tryParse(json['yearsExperience']?.toString() ?? '0') ?? 0),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'languages': languages,
      'specialties': specialties,
      'rating': rating,
      'toursCompleted': toursCompleted,
      'status': status,
      'verificationStatus': verificationStatus,
      'avatarUrl': avatarUrl,
      'bio': bio,
      'yearsExperience': yearsExperience,
    };
  }

  GuideModel copyWith({
    int? id,
    String? name,
    String? email,
    String? phone,
    List<String>? languages,
    List<String>? specialties,
    double? rating,
    int? toursCompleted,
    String? status,
    String? verificationStatus,
    String? avatarUrl,
    String? bio,
    int? yearsExperience,
  }) {
    return GuideModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      languages: languages ?? this.languages,
      specialties: specialties ?? this.specialties,
      rating: rating ?? this.rating,
      toursCompleted: toursCompleted ?? this.toursCompleted,
      status: status ?? this.status,
      verificationStatus: verificationStatus ?? this.verificationStatus,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bio: bio ?? this.bio,
      yearsExperience: yearsExperience ?? this.yearsExperience,
    );
  }
}

class GuideAvailabilitySlot {
  final int availabilityId;
  final int guideId;
  final String guideName;
  final String availableDate;
  final String startTime;
  final String endTime;
  final bool isBooked;

  GuideAvailabilitySlot({
    required this.availabilityId,
    required this.guideId,
    this.guideName = '',
    required this.availableDate,
    required this.startTime,
    required this.endTime,
    this.isBooked = false,
  });

  factory GuideAvailabilitySlot.fromJson(Map<String, dynamic> json) {
    return GuideAvailabilitySlot(
      availabilityId: (json['availabilityId'] is num)
          ? (json['availabilityId'] as num).toInt()
          : (int.tryParse(json['availabilityId']?.toString() ?? '0') ?? 0),
      guideId: (json['guideId'] is num)
          ? (json['guideId'] as num).toInt()
          : (int.tryParse(json['guideId']?.toString() ?? '0') ?? 0),
      guideName: json['guideName']?.toString() ?? '',
      availableDate: json['availableDate']?.toString() ?? '',
      startTime: json['startTime']?.toString() ?? '',
      endTime: json['endTime']?.toString() ?? '',
      isBooked: json['isBooked'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'availabilityId': availabilityId,
      'guideId': guideId,
      'guideName': guideName,
      'availableDate': availableDate,
      'startTime': startTime,
      'endTime': endTime,
      'isBooked': isBooked,
    };
  }
}

final List<GuideModel> kInitialMockGuides = [
  GuideModel(
    id: 1,
    name: 'Kasun Perera',
    email: 'kasun.perera@novatourism.lk',
    phone: '+94 77 123 4567',
    languages: ['English', 'Sinhala', 'Tamil'],
    specialties: ['Cultural Heritage', 'Kandy Temples', 'Colonial History'],
    rating: 4.9,
    toursCompleted: 312,
    status: 'Available',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Native Kandyan cultural historian with Peradeniya University archaeology credentials.',
    yearsExperience: 8,
  ),
  GuideModel(
    id: 2,
    name: 'Suresh Kumar',
    email: 'suresh.kumar@novatourism.lk',
    phone: '+94 76 234 5678',
    languages: ['English', 'Sinhala'],
    specialties: ['Mountain Hiking', 'Ella Rock', 'Tea Country'],
    rating: 4.95,
    toursCompleted: 218,
    status: 'Available',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    bio: 'Certified wilderness mountain ranger specializing in Ella high country trails.',
    yearsExperience: 6,
  ),
  GuideModel(
    id: 3,
    name: 'Fatima Nazeer',
    email: 'fatima.nazeer@novatourism.lk',
    phone: '+94 71 345 6789',
    languages: ['English', 'Sinhala', 'Arabic'],
    specialties: ['Galle Fort', 'Dutch Ramparts', 'Coastal Gems'],
    rating: 4.88,
    toursCompleted: 176,
    status: 'Available',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Local Galle Fort resident with profound knowledge of Portuguese & Dutch maritime trade.',
    yearsExperience: 5,
  ),
  GuideModel(
    id: 4,
    name: 'Dr. Jayatilleke',
    email: 'jaya.tilleke@novatourism.lk',
    phone: '+94 72 456 7890',
    languages: ['English', 'Sinhala', 'French'],
    specialties: ['Ancient Kingdoms', 'Sigiriya Rock', 'Anuradhapura'],
    rating: 4.96,
    toursCompleted: 490,
    status: 'Assigned',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    bio: 'Archaeologist with 12 years of UNESCO Cultural Triangle field research.',
    yearsExperience: 12,
  ),
  GuideModel(
    id: 5,
    name: 'Bandara Herath',
    email: 'bandara.herath@novatourism.lk',
    phone: '+94 75 567 8901',
    languages: ['English', 'Sinhala'],
    specialties: ['Wildlife Safari', 'Leopard Tracking', 'Yala Park'],
    rating: 4.91,
    toursCompleted: 384,
    status: 'Available',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
    bio: 'Yala wildlife safari master tracker with deep expertise in leopard habits.',
    yearsExperience: 10,
  ),
];

final List<GuideAvailabilitySlot> kInitialMockAvailabilitySlots = [
  GuideAvailabilitySlot(
    availabilityId: 101,
    guideId: 1,
    guideName: 'Kasun Perera',
    availableDate: '2026-10-15',
    startTime: '08:30:00',
    endTime: '16:30:00',
    isBooked: false,
  ),
  GuideAvailabilitySlot(
    availabilityId: 102,
    guideId: 1,
    guideName: 'Kasun Perera',
    availableDate: '2026-10-16',
    startTime: '09:00:00',
    endTime: '17:00:00',
    isBooked: true,
  ),
  GuideAvailabilitySlot(
    availabilityId: 103,
    guideId: 2,
    guideName: 'Suresh Kumar',
    availableDate: '2026-10-17',
    startTime: '07:00:00',
    endTime: '15:00:00',
    isBooked: false,
  ),
  GuideAvailabilitySlot(
    availabilityId: 104,
    guideId: 3,
    guideName: 'Fatima Nazeer',
    availableDate: '2026-10-18',
    startTime: '10:00:00',
    endTime: '18:00:00',
    isBooked: false,
  ),
  GuideAvailabilitySlot(
    availabilityId: 105,
    guideId: 4,
    guideName: 'Dr. Jayatilleke',
    availableDate: '2026-10-19',
    startTime: '08:00:00',
    endTime: '14:00:00',
    isBooked: true,
  ),
];
