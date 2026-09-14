import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../features/authentication/presentation/screens/forgot_password_screen.dart';
import '../features/authentication/presentation/screens/login_screen.dart';
import '../features/authentication/presentation/screens/otp_verification_screen.dart';
import '../features/authentication/presentation/screens/register_screen.dart';
import '../features/authentication/presentation/screens/splash_screen.dart';

import '../features/dashboard/presentation/screens/dashboard_screen.dart';
import '../features/posts/presentation/screens/posts_feed_screen.dart';
import '../features/posts/presentation/screens/create_post_screen.dart';
import '../features/connections/presentation/screens/connections_screen.dart';
import '../features/jobs/models/job_model.dart';
import '../features/jobs/presentation/screens/job_details_screen.dart';
import '../features/jobs/presentation/screens/jobs_screen.dart';
import '../features/profile/presentation/screens/profile_screen.dart';

import '../features/applications/presentation/screens/application_details_screen.dart';
import '../features/applications/presentation/screens/applications_screen.dart';
import '../features/auto_apply/presentation/screens/auto_apply_screen.dart';
import '../features/projects/presentation/screens/projects_screen.dart';
import '../features/case_studies/presentation/screens/case_studies_screen.dart';
import '../features/meetings/presentation/screens/meeting_room_screen.dart';
import '../features/meetings/presentation/screens/meetings_screen.dart';
import '../features/documents/presentation/screens/documents_screen.dart';
import '../features/notifications/presentation/screens/notifications_screen.dart';
import '../features/settings/presentation/screens/settings_screen.dart';
import '../features/search/presentation/screens/search_screen.dart';
import '../features/premium/presentation/screens/premium_subscription_screen.dart';

import 'main_navigation_shell.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();

final appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/otp-verification',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return OtpVerificationScreen(
          email: extra?['email'] ?? 'candidate@example.com',
          phone: extra?['phone'] ?? '+91 9876543210',
        );
      },
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),

    // Stateful Nested Shell Route with 5 Bottom Tabs
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return MainNavigationShell(navigationShell: navigationShell);
      },
      branches: [
        // Tab 0: Home (Platform-wide Community Feed)
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/home',
              builder: (context, state) => const PostsFeedScreen(
                key: ValueKey('home-feed'),
                isPersonalFeed: false,
              ),
            ),
          ],
        ),

        // Tab 1: My Connections
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/connections',
              builder: (context, state) => const ConnectionsScreen(),
            ),
          ],
        ),

        // Tab 2: Posts (Candidate's Own Profile Posts Management)
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/my-posts',
              builder: (context, state) => const PostsFeedScreen(
                key: ValueKey('personal-posts'),
                isPersonalFeed: true,
              ),
            ),
          ],
        ),

        // Tab 3: Jobs
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/jobs',
              builder: (context, state) => const JobsScreen(),
            ),
          ],
        ),

        // Tab 4: Profile
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/profile',
              builder: (context, state) => const ProfileScreen(),
            ),
          ],
        ),
      ],
    ),

    // Side Menu & Top Action Feature Routes
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/search',
      builder: (context, state) => const SearchScreen(),
    ),
    GoRoute(
      path: '/premium',
      builder: (context, state) => const PremiumSubscriptionScreen(),
    ),

    // Feature Detail & Push Routes
    GoRoute(
      path: '/jobs/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        final job = state.extra as JobModel?;
        return JobDetailsScreen(jobId: id, initialJob: job);
      },
    ),
    GoRoute(
      path: '/applications',
      builder: (context, state) => const ApplicationsScreen(),
    ),
    GoRoute(
      path: '/applications/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        final item = state.extra as ApplicationItem?;
        return ApplicationDetailsScreen(applicationId: id, item: item);
      },
    ),
    GoRoute(
      path: '/auto-apply',
      builder: (context, state) => const AutoApplyScreen(),
    ),
    GoRoute(
      path: '/projects',
      builder: (context, state) => const ProjectsScreen(),
    ),
    GoRoute(
      path: '/case-studies',
      builder: (context, state) => const CaseStudiesScreen(),
    ),
    GoRoute(
      path: '/create-post',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        final initialImages = extra?['initialImages'] as List<XFile>?;
        final initialVideo = extra?['initialVideo'] as XFile?;
        return CreatePostScreen(
          initialImages: initialImages,
          initialVideo: initialVideo,
        );
      },
    ),
    GoRoute(
      path: '/meetings',
      builder: (context, state) => const MeetingsScreen(),
    ),
    GoRoute(
      path: '/meeting-room',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return MeetingRoomScreen(roomCode: extra?['code'] ?? 'GENERAL-ROOM');
      },
    ),
    GoRoute(
      path: '/documents',
      builder: (context, state) => const DocumentsScreen(),
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) => const NotificationsScreen(),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
  ],
);
