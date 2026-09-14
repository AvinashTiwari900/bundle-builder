import 'package:flutter/foundation.dart';

class ApiEndpoints {
  // Base default URL: localhost for web, 192.168.1.29 for physical device
  static String get defaultBaseUrl =>
      kIsWeb ? 'http://localhost:4000/api' : 'http://192.168.1.29:4000/api';

  static String get mediaBaseUrl {
    final base = defaultBaseUrl;
    if (base.endsWith('/api')) {
      return base.substring(0, base.length - 4);
    }
    return base;
  }

  static String resolveMediaUrl(String url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/')) {
      return '$mediaBaseUrl$url';
    }
    return '$mediaBaseUrl/$url';
  }

  // Authentication & Session
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  static const String logout = '/auth/logout';
  static const String sendOtp = '/auth/otp/send';
  static const String verifyOtp = '/auth/otp/verify';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // Candidate Profile & Portfolio
  static const String candidateProfile = '/candidates/profile';
  static const String candidatePortfolio = '/candidates/portfolio';
  static const String candidateProjects = '/candidates/projects';
  static const String candidateEducation = '/candidates/education';
  static const String candidateExperience = '/candidates/experience';
  static const String candidateSkills = '/candidates/skills';

  // Jobs & Applications
  static const String jobs = '/jobs';
  static const String recommendedJobs = '/jobs/recommended';
  static const String savedJobs = '/jobs/saved';
  static const String applications = '/applications';
  static const String autoApply = '/auto-apply';

  // Community, Posts & Connections
  static const String posts = '/posts';
  static const String postUpload = '/posts/upload';
  static const String connections = '/connections';
  static const String connectionRequests = '/connections/requests';
  static const String candidatesDirectory = '/candidates';

  // AI Career Copilot & Studio
  static const String copilotChat = '/copilot/chat';
  static const String copilotSuggestions = '/copilot/suggestions';
  static const String interviewSessions = '/interviews/sessions';
  static const String interviewQuestions = '/interviews/questions';
  static const String interviewIntegrity = '/interviews/integrity';
  static const String interviewEvaluation = '/interviews/evaluate';

  // Meetings, KYC Documents & Notifications
  static const String meetings = '/meetings';
  static const String documents = '/documents';
  static const String verifyDocument = '/documents/verify';
  static const String notifications = '/notifications';
  static const String markNotificationsRead = '/notifications/read-all';
}
