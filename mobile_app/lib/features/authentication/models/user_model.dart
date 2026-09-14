class UserModel {
  final String id;
  final String email;
  final String name;
  final String? role;
  final String? phone;
  final String? token;
  final bool isVerified;
  final String? professionalStatus; // 'Student' or 'Working Professional'
  final String? currentRole;
  final String? companyName;
  final String? collegeName;
  final String? avatarUrl;
  final bool isSubscribed;
  final String? subscriptionPlan;
  final String? subscriptionExpiry;

  const UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.role,
    this.phone,
    this.token,
    this.isVerified = false,
    this.professionalStatus,
    this.currentRole,
    this.companyName,
    this.collegeName,
    this.avatarUrl,
    this.isSubscribed = false,
    this.subscriptionPlan,
    this.subscriptionExpiry,
  });

  String? get profilePhoto => avatarUrl;

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    final settings = json['candidateProfile']?['settings'] as Map<String, dynamic>?;
    final subData = settings?['subscription'] as Map<String, dynamic>?;

    return UserModel(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      name: json['name']?.toString() ?? json['candidateProfile']?['name'] ?? 'Candidate',
      role: json['role']?.toString() ?? 'CANDIDATE',
      phone: json['phone']?.toString() ?? json['candidateProfile']?['phone'],
      token: token ?? json['token']?.toString(),
      isVerified: json['isVerified'] == true,
      professionalStatus: json['candidateProfile']?['professionalStatus'],
      currentRole: json['candidateProfile']?['currentRole'],
      companyName: json['candidateProfile']?['companyName'],
      collegeName: json['candidateProfile']?['collegeName'],
      avatarUrl: json['candidateProfile']?['profilePhoto'] ?? json['avatarUrl'],
      isSubscribed: json['isSubscribed'] == true || subData?['active'] == true || subData?['status'] == 'active',
      subscriptionPlan: json['subscriptionPlan'] ?? subData?['plan'] ?? (json['isSubscribed'] == true ? 'Pro Candidate' : null),
      subscriptionExpiry: json['subscriptionExpiry'] ?? subData?['expiresAt'],
    );
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? role,
    String? phone,
    String? token,
    bool? isVerified,
    String? professionalStatus,
    String? currentRole,
    String? companyName,
    String? collegeName,
    String? avatarUrl,
    bool? isSubscribed,
    String? subscriptionPlan,
    String? subscriptionExpiry,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      phone: phone ?? this.phone,
      token: token ?? this.token,
      isVerified: isVerified ?? this.isVerified,
      professionalStatus: professionalStatus ?? this.professionalStatus,
      currentRole: currentRole ?? this.currentRole,
      companyName: companyName ?? this.companyName,
      collegeName: collegeName ?? this.collegeName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isSubscribed: isSubscribed ?? this.isSubscribed,
      subscriptionPlan: subscriptionPlan ?? this.subscriptionPlan,
      subscriptionExpiry: subscriptionExpiry ?? this.subscriptionExpiry,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'phone': phone,
      'token': token,
      'isVerified': isVerified,
      'professionalStatus': professionalStatus,
      'currentRole': currentRole,
      'companyName': companyName,
      'collegeName': collegeName,
      'avatarUrl': avatarUrl,
      'isSubscribed': isSubscribed,
      'subscriptionPlan': subscriptionPlan,
      'subscriptionExpiry': subscriptionExpiry,
    };
  }
}
