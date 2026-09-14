import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  final List<Map<String, dynamic>> _projects = [
    {
      'title': 'Healthcare AI Diagnostics App',
      'role': 'Lead Mobile Architect',
      'duration': '4 Months',
      'technologies': ['Flutter', 'Dart', 'PyTorch Mobile', 'FHIR'],
      'description':
          'On-device diagnostic assistant predicting symptom triage with offline NLP models and HIPAA-compliant data store.',
      'github': 'https://github.com/avinash/health-ai',
      'demo': 'https://health-ai.demo.app',
      'aiScore': 92,
      'aiFeedback':
          'Strong production architecture. Suggest adding benchmark numbers for offline model inference time on budget Android devices.',
    },
    {
      'title': 'High-Frequency Trading Matching Engine',
      'role': 'Backend & Systems Engineer',
      'duration': '6 Months',
      'technologies': ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
      'description':
          'Order book matching engine handling 25,000 requests/sec with WebSockets and sub-millisecond execution loops.',
      'github': 'https://github.com/avinash/hft-engine',
      'demo': '',
      'aiScore': 88,
      'aiFeedback':
          'Impressive throughput metrics. Recommend publishing an open-source test suite to demonstrate correctness.',
    },
  ];

  void _showAddProjectDialog() {
    final titleController = TextEditingController();
    final roleController = TextEditingController();
    final techController = TextEditingController();
    final descController = TextEditingController();
    final githubController = TextEditingController();

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
                  'Add New Project',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 16),
                CustomTextField(label: 'Project Name', controller: titleController),
                const SizedBox(height: 12),
                CustomTextField(label: 'Your Role / Responsibilities', controller: roleController),
                const SizedBox(height: 12),
                CustomTextField(
                    label: 'Technologies (comma separated)',
                    controller: techController,
                    hint: 'Flutter, Riverpod, PostgreSQL'),
                const SizedBox(height: 12),
                CustomTextField(
                    label: 'Description & Outcomes',
                    controller: descController,
                    maxLines: 3),
                const SizedBox(height: 12),
                CustomTextField(
                    label: 'GitHub / Demo URL', controller: githubController),
                const SizedBox(height: 20),
                CustomButton(
                  text: 'Save Project & Run AI Review',
                  onPressed: () {
                    if (titleController.text.isNotEmpty) {
                      setState(() {
                        _projects.insert(0, {
                          'title': titleController.text,
                          'role': roleController.text.isEmpty ? 'Developer' : roleController.text,
                          'duration': '3 Months',
                          'technologies': techController.text
                              .split(',')
                              .map((s) => s.trim())
                              .where((s) => s.isNotEmpty)
                              .toList(),
                          'description': descController.text,
                          'github': githubController.text,
                          'demo': '',
                          'aiScore': 90,
                          'aiFeedback':
                              'Solid tech stack. Highlight your specific system architecture decisions.',
                        });
                      });
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Project saved with instant AI review!')),
                      );
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

  void _showAiDiagnosticModal(Map<String, dynamic> project) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.auto_awesome, color: AppColors.primaryLight, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'AI Project Diagnostics',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Score: ${project['aiScore']}/100',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.success,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                project['title'] as String,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                project['aiFeedback'] as String,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondaryDark,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'AI Technical Suggestions:',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryLight,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                '• Document memory profiling and battery drain tests.\n• Add CI/CD GitHub Actions badge.\n• Include architecture diagram in the README.',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark, height: 1.5),
              ),
              const SizedBox(height: 24),
              CustomButton(
                text: 'Got It',
                onPressed: () => Navigator.pop(context),
              ),
            ],
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
        title: const Text('My Projects & AI Diagnostics'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showAddProjectDialog,
          ),
        ],
      ),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _projects.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, idx) {
            final p = _projects[idx];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceDark,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.borderDark),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          p['title'] as String,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimaryDark,
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => _showAiDiagnosticModal(p),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.auto_awesome, size: 12, color: AppColors.primaryLight),
                              SizedBox(width: 4),
                              Text(
                                'AI Review',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primaryLight,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${p['role']} • ${p['duration']}',
                    style: const TextStyle(fontSize: 12, color: AppColors.textMutedDark),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    p['description'] as String,
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryDark, height: 1.3),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 6,
                    children: (p['technologies'] as List<dynamic>).map((tech) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.cardDark,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          tech.toString(),
                          style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        onPressed: _showAddProjectDialog,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Project', style: TextStyle(color: Colors.white)),
      ),
    );
  }
}
