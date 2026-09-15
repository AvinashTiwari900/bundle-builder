import 'package:flutter/material.dart';
import 'router.dart';
import 'theme.dart';

class CandidateApp extends StatelessWidget {
  const CandidateApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'GetNextIn',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.lightTheme,
      themeMode: ThemeMode.light,
      routerConfig: appRouter,
    );
  }
}
