import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';

class CaseStudiesScreen extends StatefulWidget {
  const CaseStudiesScreen({super.key});

  @override
  State<CaseStudiesScreen> createState() => _CaseStudiesScreenState();
}

class _CaseStudiesScreenState extends State<CaseStudiesScreen> {
  final List<Map<String, String>> _caseStudies = [
    {
      'title': 'Scaling Microservices to 100K Concurrent Users',
      'problem':
          'Database contention and connection exhaustion under surge traffic spikes during flash sales.',
      'approach':
          'Decomposed monolithic payment service, introduced asynchronous message queue with RabbitMQ, and implemented read replicas.',
      'solution':
          'Optimized connection pooling via PgBouncer and cached 85% of repeated inventory checks via Redis clusters.',
      'results':
          '99.99% uptime achieved, latency reduced from 840ms to 42ms, and infrastructure costs decreased by 22%.',
      'technologies': 'Node.js, PostgreSQL, Redis, RabbitMQ, Docker',
    },
  ];

  void _showCreateCaseStudyDialog() {
    final titleController = TextEditingController();
    final problemController = TextEditingController();
    final approachController = TextEditingController();
    final solutionController = TextEditingController();
    final resultsController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 24,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Publish Architecture Case Study',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 16),
                CustomTextField(label: 'Case Study Title', controller: titleController),
                const SizedBox(height: 12),
                CustomTextField(label: 'Problem Statement', controller: problemController, maxLines: 2),
                const SizedBox(height: 12),
                CustomTextField(label: 'Your Technical Approach', controller: approachController, maxLines: 2),
                const SizedBox(height: 12),
                CustomTextField(label: 'Solution Architecture', controller: solutionController, maxLines: 2),
                const SizedBox(height: 12),
                CustomTextField(label: 'Measurable Results & Impact', controller: resultsController, maxLines: 2),
                const SizedBox(height: 20),
                CustomButton(
                  text: 'Publish Case Study',
                  onPressed: () {
                    if (titleController.text.isNotEmpty) {
                      setState(() {
                        _caseStudies.insert(0, {
                          'title': titleController.text,
                          'problem': problemController.text,
                          'approach': approachController.text,
                          'solution': solutionController.text,
                          'results': resultsController.text,
                          'technologies': 'Flutter, Node.js, PostgreSQL',
                        });
                      });
                      Navigator.pop(context);
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('Engineering Case Studies'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showCreateCaseStudyDialog,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _caseStudies.length,
          separatorBuilder: (_, __) => const SizedBox(height: 16),
          itemBuilder: (context, idx) {
            final cs = _caseStudies[idx];
            return Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.surfaceDark,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderDark),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    cs['title']!,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  const SizedBox(height: 14),
                  _section('The Problem', cs['problem']!),
                  const SizedBox(height: 10),
                  _section('The Solution', cs['solution']!),
                  const SizedBox(height: 10),
                  _section('Results & Impact', cs['results']!, isHighlight: true),
                ],
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        onPressed: _showCreateCaseStudyDialog,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Case Study', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _section(String heading, String body, {bool isHighlight = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          heading,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isHighlight ? AppColors.success : AppColors.primaryLight,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          body,
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textSecondaryDark,
            height: 1.35,
          ),
        ),
      ],
    );
  }
}
