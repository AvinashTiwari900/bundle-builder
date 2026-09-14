class JobModel {
  final String id;
  final String title;
  final String company;
  final String location;
  final String workMode; // Remote, Hybrid, On-site
  final String salary;
  final String experience;
  final List<String> skills;
  final String description;
  final String eligibility;
  final int matchScore;
  final String matchExplanation;
  final bool isSaved;
  final bool hasApplied;

  const JobModel({
    required this.id,
    required this.title,
    required this.company,
    required this.location,
    required this.workMode,
    required this.salary,
    required this.experience,
    required this.skills,
    required this.description,
    required this.eligibility,
    required this.matchScore,
    required this.matchExplanation,
    this.isSaved = false,
    this.hasApplied = false,
  });

  factory JobModel.fromJson(Map<String, dynamic> json) {
    return JobModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Software Engineer',
      company: json['company']?.toString() ?? json['companyName']?.toString() ?? 'Tech Corp',
      location: json['location']?.toString() ?? 'Bengaluru, India',
      workMode: json['workMode']?.toString() ?? 'Hybrid',
      salary: json['salary']?.toString() ?? '₹12 - 18 LPA',
      experience: json['experience']?.toString() ?? '1-3 Years',
      skills: (json['skills'] as List<dynamic>?)?.map((e) => e.toString()).toList() ??
          ['Flutter', 'Dart', 'REST'],
      description: json['description']?.toString() ?? 'Exciting role for mobile engineers.',
      eligibility: json['eligibility']?.toString() ?? 'B.Tech / B.E in CS / IT or relevant field.',
      matchScore: json['matchScore'] is int ? json['matchScore'] : 85,
      matchExplanation: json['matchExplanation']?.toString() ??
          'Strong match with your Flutter, Dart, and state management skills.',
      isSaved: json['isSaved'] == true,
      hasApplied: json['hasApplied'] == true,
    );
  }
}
