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
  final double hourlyRate;
  final double halfDayRate;
  final double fullDayRate;
  final bool acceptingBookings;
  final List<String> coveredDestinations;

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
    this.hourlyRate = 15.0,
    this.halfDayRate = 50.0,
    this.fullDayRate = 90.0,
    this.acceptingBookings = true,
    this.coveredDestinations = const [],
  });

  factory GuideModel.fromJson(Map<String, dynamic> json) {
    int parsedId = 0;
    if (json['id'] is int) {
      parsedId = json['id'];
    } else if (json['id'] != null) {
      parsedId = int.tryParse(json['id'].toString()) ?? 0;
    }

    List<String> destinations = [];
    if (json['coveredDestinations'] is List) {
      destinations = (json['coveredDestinations'] as List).map((d) {
        if (d is Map) return d['destinationName']?.toString() ?? '';
        return d.toString();
      }).where((s) => s.isNotEmpty).toList();
    }

    return GuideModel(
      id: parsedId,
      name: json['name']?.toString() ?? 'Licensed Guide',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      languages: (json['languages'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      specialties: (json['specialties'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      rating: (json['rating'] is num)
          ? (json['rating'] as num).toDouble()
          : (json['ratingAvg'] is num)
              ? (json['ratingAvg'] as num).toDouble()
              : (double.tryParse(json['rating']?.toString() ?? json['ratingAvg']?.toString() ?? '0') ?? 0.0),
      toursCompleted: (json['toursCompleted'] is num) ? (json['toursCompleted'] as num).toInt() : (int.tryParse(json['toursCompleted']?.toString() ?? '0') ?? 0),
      status: json['status']?.toString() ?? (json['isActive'] == false ? 'Inactive' : 'Available'),
      verificationStatus: json['verificationStatus']?.toString() ?? 'Verified',
      avatarUrl: json['avatarUrl']?.toString() ?? '',
      bio: json['bio']?.toString() ?? '',
      yearsExperience: (json['yearsExperience'] is num) ? (json['yearsExperience'] as num).toInt() : (int.tryParse(json['yearsExperience']?.toString() ?? '0') ?? 0),
      hourlyRate: (json['hourlyRate'] is num) ? (json['hourlyRate'] as num).toDouble() : (double.tryParse(json['hourlyRate']?.toString() ?? '15') ?? 15.0),
      halfDayRate: (json['halfDayRate'] is num) ? (json['halfDayRate'] as num).toDouble() : (double.tryParse(json['halfDayRate']?.toString() ?? '50') ?? 50.0),
      fullDayRate: (json['fullDayRate'] is num) ? (json['fullDayRate'] as num).toDouble() : (double.tryParse(json['fullDayRate']?.toString() ?? '90') ?? 90.0),
      acceptingBookings: json['acceptingBookings'] != false,
      coveredDestinations: destinations,
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
      'hourlyRate': hourlyRate,
      'halfDayRate': halfDayRate,
      'fullDayRate': fullDayRate,
      'acceptingBookings': acceptingBookings,
      'coveredDestinations': coveredDestinations,
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
    double? hourlyRate,
    double? halfDayRate,
    double? fullDayRate,
    bool? acceptingBookings,
    List<String>? coveredDestinations,
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
      hourlyRate: hourlyRate ?? this.hourlyRate,
      halfDayRate: halfDayRate ?? this.halfDayRate,
      fullDayRate: fullDayRate ?? this.fullDayRate,
      acceptingBookings: acceptingBookings ?? this.acceptingBookings,
      coveredDestinations: coveredDestinations ?? this.coveredDestinations,
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

class GuideBookingModel {
  final String id;
  final int guideId;
  final String guideName;
  final String guideEmail;
  final String guidePhone;
  final String guideAvatarUrl;
  final String customerId;
  final String customerName;
  final String customerEmail;
  final String customerPhone;
  final String startDate;
  final String endDate;
  final String startTime;
  final String endTime;
  final int travelers;
  final String? pickupLocation;
  final String? preferredLanguage;
  final String? specialRequests;
  final String status;
  final double subtotal;
  final double serviceFee;
  final double totalAmount;
  final double commissionAmount;
  final double guideNetAmount;
  final String currency;
  final int billableDays;
  final String paymentStatus;
  final String payoutStatus;
  final String? payoutReference;
  final List<String> destinations;

  GuideBookingModel({
    required this.id,
    required this.guideId,
    required this.guideName,
    required this.guideEmail,
    this.guidePhone = '',
    this.guideAvatarUrl = '',
    required this.customerId,
    required this.customerName,
    required this.customerEmail,
    this.customerPhone = '',
    required this.startDate,
    required this.endDate,
    required this.startTime,
    required this.endTime,
    required this.travelers,
    this.pickupLocation,
    this.preferredLanguage,
    this.specialRequests,
    required this.status,
    required this.subtotal,
    required this.serviceFee,
    required this.totalAmount,
    required this.commissionAmount,
    required this.guideNetAmount,
    this.currency = 'USD',
    this.billableDays = 1,
    this.paymentStatus = 'Pending',
    this.payoutStatus = 'Pending',
    this.payoutReference,
    this.destinations = const [],
  });

  factory GuideBookingModel.fromJson(Map<String, dynamic> json) {
    List<String> dests = [];
    if (json['destinations'] is List) {
      dests = (json['destinations'] as List).map((d) {
        if (d is Map) return d['destinationName']?.toString() ?? '';
        return d.toString();
      }).where((s) => s.isNotEmpty).toList();
    }

    String payStatus = 'Pending';
    if (json['payment'] is Map) {
      payStatus = json['payment']['status']?.toString() ?? 'Pending';
    }

    String outStatus = 'Pending';
    String? outRef;
    if (json['payout'] is Map) {
      outStatus = json['payout']['status']?.toString() ?? 'Pending';
      outRef = json['payout']['payoutReference']?.toString();
    }

    return GuideBookingModel(
      id: json['id']?.toString() ?? '',
      guideId: (json['guideId'] is num) ? (json['guideId'] as num).toInt() : (int.tryParse(json['guideId']?.toString() ?? '0') ?? 0),
      guideName: json['guideName']?.toString() ?? 'Guide',
      guideEmail: json['guideEmail']?.toString() ?? '',
      guidePhone: json['guidePhone']?.toString() ?? '',
      guideAvatarUrl: json['guideAvatarUrl']?.toString() ?? '',
      customerId: json['customerId']?.toString() ?? '',
      customerName: json['customerName']?.toString() ?? 'Guest',
      customerEmail: json['customerEmail']?.toString() ?? '',
      customerPhone: json['customerPhone']?.toString() ?? '',
      startDate: json['startDate']?.toString() ?? '',
      endDate: json['endDate']?.toString() ?? '',
      startTime: json['startTime']?.toString() ?? '',
      endTime: json['endTime']?.toString() ?? '',
      travelers: (json['travelers'] is num) ? (json['travelers'] as num).toInt() : 1,
      pickupLocation: json['pickupLocation']?.toString(),
      preferredLanguage: json['preferredLanguage']?.toString(),
      specialRequests: json['specialRequests']?.toString(),
      status: json['status']?.toString() ?? 'PendingPayment',
      subtotal: (json['subtotal'] is num) ? (json['subtotal'] as num).toDouble() : 0.0,
      serviceFee: (json['serviceFee'] is num) ? (json['serviceFee'] as num).toDouble() : 0.0,
      totalAmount: (json['totalAmount'] is num) ? (json['totalAmount'] as num).toDouble() : 0.0,
      commissionAmount: (json['commissionAmount'] is num) ? (json['commissionAmount'] as num).toDouble() : 0.0,
      guideNetAmount: (json['guideNetAmount'] is num) ? (json['guideNetAmount'] as num).toDouble() : 0.0,
      currency: json['currency']?.toString() ?? 'USD',
      billableDays: (json['billableDays'] is num) ? (json['billableDays'] as num).toInt() : 1,
      paymentStatus: payStatus,
      payoutStatus: outStatus,
      payoutReference: outRef,
      destinations: dests,
    );
  }
}

class GuideQuoteModel {
  final int guideId;
  final String guideName;
  final String rateTypeApplied;
  final double hourlyRate;
  final double halfDayRate;
  final double fullDayRate;
  final int billableDays;
  final double subtotal;
  final double serviceFee;
  final double totalAmount;
  final double commissionAmount;
  final double guideNetAmount;
  final String currency;
  final bool isAvailable;
  final String? unavailabilityReason;

  GuideQuoteModel({
    required this.guideId,
    required this.guideName,
    required this.rateTypeApplied,
    required this.hourlyRate,
    required this.halfDayRate,
    required this.fullDayRate,
    required this.billableDays,
    required this.subtotal,
    required this.serviceFee,
    required this.totalAmount,
    required this.commissionAmount,
    required this.guideNetAmount,
    this.currency = 'USD',
    required this.isAvailable,
    this.unavailabilityReason,
  });

  factory GuideQuoteModel.fromJson(Map<String, dynamic> json) {
    return GuideQuoteModel(
      guideId: (json['guideId'] is num) ? (json['guideId'] as num).toInt() : 0,
      guideName: json['guideName']?.toString() ?? 'Guide',
      rateTypeApplied: json['rateTypeApplied']?.toString() ?? 'FullDay',
      hourlyRate: (json['hourlyRate'] is num) ? (json['hourlyRate'] as num).toDouble() : 0.0,
      halfDayRate: (json['halfDayRate'] is num) ? (json['halfDayRate'] as num).toDouble() : 0.0,
      fullDayRate: (json['fullDayRate'] is num) ? (json['fullDayRate'] as num).toDouble() : 0.0,
      billableDays: (json['billableDays'] is num) ? (json['billableDays'] as num).toInt() : 1,
      subtotal: (json['subtotal'] is num) ? (json['subtotal'] as num).toDouble() : 0.0,
      serviceFee: (json['serviceFee'] is num) ? (json['serviceFee'] as num).toDouble() : 0.0,
      totalAmount: (json['totalAmount'] is num) ? (json['totalAmount'] as num).toDouble() : 0.0,
      commissionAmount: (json['commissionAmount'] is num) ? (json['commissionAmount'] as num).toDouble() : 0.0,
      guideNetAmount: (json['guideNetAmount'] is num) ? (json['guideNetAmount'] as num).toDouble() : 0.0,
      currency: json['currency']?.toString() ?? 'USD',
      isAvailable: json['isAvailable'] == true,
      unavailabilityReason: json['unavailabilityReason']?.toString(),
    );
  }
}

class GuideDashboardMetricsModel {
  final int upcomingBookings;
  final int pendingApprovalBookings;
  final int todayBookings;
  final int completedBookings;
  final double pendingEarnings;
  final double totalEarnings;
  final double completedPayouts;
  final double ratingAvg;
  final int ratingCount;

  GuideDashboardMetricsModel({
    required this.upcomingBookings,
    required this.pendingApprovalBookings,
    required this.todayBookings,
    required this.completedBookings,
    required this.pendingEarnings,
    required this.totalEarnings,
    required this.completedPayouts,
    required this.ratingAvg,
    required this.ratingCount,
  });

  factory GuideDashboardMetricsModel.fromJson(Map<String, dynamic> json) {
    return GuideDashboardMetricsModel(
      upcomingBookings: (json['upcomingBookings'] is num) ? (json['upcomingBookings'] as num).toInt() : 0,
      pendingApprovalBookings: (json['pendingApprovalBookings'] is num) ? (json['pendingApprovalBookings'] as num).toInt() : 0,
      todayBookings: (json['todayBookings'] is num) ? (json['todayBookings'] as num).toInt() : 0,
      completedBookings: (json['completedBookings'] is num) ? (json['completedBookings'] as num).toInt() : 0,
      pendingEarnings: (json['pendingEarnings'] is num) ? (json['pendingEarnings'] as num).toDouble() : 0.0,
      totalEarnings: (json['totalEarnings'] is num) ? (json['totalEarnings'] as num).toDouble() : 0.0,
      completedPayouts: (json['completedPayouts'] is num) ? (json['completedPayouts'] as num).toDouble() : 0.0,
      ratingAvg: (json['ratingAvg'] is num) ? (json['ratingAvg'] as num).toDouble() : 0.0,
      ratingCount: (json['ratingCount'] is num) ? (json['ratingCount'] as num).toInt() : 0,
    );
  }
}

class WorkingHourModel {
  final int dayOfWeek;
  final String startTime;
  final String endTime;

  WorkingHourModel({
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
  });

  factory WorkingHourModel.fromJson(Map<String, dynamic> json) {
    return WorkingHourModel(
      dayOfWeek: (json['dayOfWeek'] is num) ? (json['dayOfWeek'] as num).toInt() : 1,
      startTime: json['startTime']?.toString() ?? '08:00',
      endTime: json['endTime']?.toString() ?? '18:00',
    );
  }

  Map<String, dynamic> toJson() => {
    'dayOfWeek': dayOfWeek,
    'startTime': startTime,
    'endTime': endTime,
  };
}

class BlockedDateModel {
  final int id;
  final String startDate;
  final String endDate;
  final String? reason;

  BlockedDateModel({
    required this.id,
    required this.startDate,
    required this.endDate,
    this.reason,
  });

  factory BlockedDateModel.fromJson(Map<String, dynamic> json) {
    return BlockedDateModel(
      id: (json['id'] is num) ? (json['id'] as num).toInt() : 0,
      startDate: json['startDate']?.toString() ?? '',
      endDate: json['endDate']?.toString() ?? '',
      reason: json['reason']?.toString(),
    );
  }
}

final List<GuideModel> kInitialMockGuides = [
  GuideModel(
    id: 1,
    name: 'Samantha Perera',
    email: 'guide@tourlink.com',
    phone: '+94 77 123 4567',
    languages: ['English', 'Sinhala', 'Tamil'],
    specialties: ['Cultural Heritage', 'Ancient Cities', 'Temple History'],
    rating: 4.95,
    toursCompleted: 284,
    status: 'Available',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    bio: 'Licensed national tourist guide specializing in UNESCO World Heritage sites, Sigiriya, Polonnaruwa, and Kandy Sacred Tooth Relic Temple.',
    yearsExperience: 7,
    hourlyRate: 15.0,
    halfDayRate: 50.0,
    fullDayRate: 90.0,
    acceptingBookings: true,
    coveredDestinations: ['Sigiriya Ancient Rock Fortress', 'Temple of the Sacred Tooth Relic', 'Dambulla Cave Temple'],
  ),
  GuideModel(
    id: 2,
    name: 'Dinesh Jayawardena',
    email: 'dinesh.guide@tourlink.com',
    phone: '+94 71 890 1234',
    languages: ['English', 'Sinhala'],
    specialties: ['Mountain Hiking', 'Ella Rock', 'Tea Country'],
    rating: 4.88,
    toursCompleted: 196,
    status: 'Available',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Certified wilderness guide and birding specialist with profound knowledge of Ella Rock, Little Adams Peak, and Horton Plains.',
    yearsExperience: 5,
    hourlyRate: 14.0,
    halfDayRate: 45.0,
    fullDayRate: 80.0,
    acceptingBookings: true,
    coveredDestinations: ['Nine Arches Bridge', 'Ella Rock & Little Adams Peak', 'Horton Plains National Park'],
  ),
  GuideModel(
    id: 3,
    name: 'Ruwan Silva',
    email: 'ruwan.silva@tourlink.com',
    phone: '+94 76 456 7890',
    languages: ['English', 'German', 'Sinhala'],
    specialties: ['Wildlife Safari', 'Leopard Tracking', 'Bird Watching'],
    rating: 4.92,
    toursCompleted: 340,
    status: 'Available',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    bio: 'Veteran naturalist guide registered with Sri Lanka Department of Wildlife Conservation, active across Yala, Udawalawe, and Bundala.',
    yearsExperience: 9,
    hourlyRate: 18.0,
    halfDayRate: 60.0,
    fullDayRate: 110.0,
    acceptingBookings: true,
    coveredDestinations: ['Yala National Park', 'Udawalawe National Park', 'Mirissa Coast'],
  ),
];

final List<GuideAvailabilitySlot> kInitialMockAvailabilitySlots = [
  GuideAvailabilitySlot(
    availabilityId: 101,
    guideId: 1,
    guideName: 'Samantha Perera',
    availableDate: '2026-10-15',
    startTime: '08:30:00',
    endTime: '16:30:00',
    isBooked: false,
  ),
  GuideAvailabilitySlot(
    availabilityId: 102,
    guideId: 1,
    guideName: 'Samantha Perera',
    availableDate: '2026-10-16',
    startTime: '09:00:00',
    endTime: '17:00:00',
    isBooked: true,
  ),
  GuideAvailabilitySlot(
    availabilityId: 103,
    guideId: 2,
    guideName: 'Dinesh Jayawardena',
    availableDate: '2026-10-17',
    startTime: '07:00:00',
    endTime: '15:00:00',
    isBooked: false,
  ),
];
