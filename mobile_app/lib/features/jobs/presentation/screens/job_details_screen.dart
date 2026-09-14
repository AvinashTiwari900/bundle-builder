import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/match_score_chip.dart';
import '../../models/job_model.dart';

class JobDetailsScreen extends StatefulWidget {
  final String jobId;
  final JobModel? initialJob;

  const JobDetailsScreen({
    super.key,
    required this.jobId,
    this.initialJob,
  });

  @override
  State<JobDetailsScreen> createState() => _JobDetailsScreenState();
}

class _JobDetailsScreenState extends State<JobDetailsScreen> {
  late JobModel _job;
  bool _isSaved = false;
  bool _hasApplied = false;
  bool _isApplying = false;

  final List<String> _availableResumes = [
    'Avinash_Tiwari_Senior_Flutter_Resume.pdf (Primary)',
    'Avinash_FullStack_Node_Resume_2026.pdf',
    'General_Software_Engineer_CV.pdf',
  ];
  late String _selectedResume;

  @override
  void initState() {
    super.initState();
    _selectedResume = _availableResumes.first;
    _job = widget.initialJob ??
        JobModel(
          id: widget.jobId,
          title: 'Senior Mobile Engineer (Flutter)',
          company: 'Fintech Nexus Ltd',
          location: 'Bengaluru, Karnataka',
          workMode: 'Hybrid',
          salary: '₹18 - 24 LPA',
          experience: '3-5 Years',
          skills: const ['Flutter', 'Dart', 'Riverpod', 'Dio', 'CI/CD'],
          description:
              'Join our core mobile platform team scaling fintech solutions to over 5 million daily active users.',
          eligibility: 'B.Tech / MCA with 3+ years in Flutter mobile production.',
          matchScore: 94,
          matchExplanation:
              'Your profile has 94% alignment: Flutter, Riverpod, Dart, and financial architecture.',
        );
    _isSaved = _job.isSaved;
    _hasApplied = _job.hasApplied;
  }

  void _handleApply() {
    final noteController = TextEditingController();
    String activeResume = _selectedResume;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceLight,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Apply to ${_job.title}',
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimaryDark,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'At ${_job.company}',
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, size: 20, color: AppColors.textSecondaryDark),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Resume Selection Section
                  const Text(
                    'Select Application Resume',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  const SizedBox(height: 8),

                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.elevatedLight,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: activeResume,
                        isExpanded: true,
                        icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.textSecondaryDark),
                        items: _availableResumes.map((res) {
                          return DropdownMenuItem(
                            value: res,
                            child: Row(
                              children: [
                                const Icon(Icons.picture_as_pdf_outlined, size: 18, color: AppColors.primary),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    res,
                                    style: const TextStyle(fontSize: 12.5, color: AppColors.textPrimaryDark),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setSheetState(() => activeResume = val);
                          }
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Or Upload New Resume button
                  OutlinedButton.icon(
                    onPressed: () async {
                      try {
                        final result = await FilePicker.platform.pickFiles(
                          type: FileType.custom,
                          allowedExtensions: ['pdf', 'doc', 'docx'],
                        );
                        if (result != null && result.files.isNotEmpty) {
                          final file = result.files.first;
                          final newResumeName = '${file.name} (Uploaded)';
                          setState(() {
                            _availableResumes.insert(0, newResumeName);
                            _selectedResume = newResumeName;
                          });
                          setSheetState(() {
                            activeResume = newResumeName;
                          });
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Selected new resume: ${file.name}')),
                            );
                          }
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error selecting resume: $e')),
                          );
                        }
                      }
                    },
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.borderLight),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      minimumSize: const Size.fromHeight(40),
                    ),
                    icon: const Icon(Icons.upload_file_outlined, size: 16, color: AppColors.primary),
                    label: const Text(
                      'Upload New Resume from Device',
                      style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Note for Hiring Team
                  const Text(
                    'Note for the Hiring Team (Optional)',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondaryDark,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextFormField(
                    controller: noteController,
                    maxLines: 2,
                    style: const TextStyle(color: AppColors.textPrimaryDark, fontSize: 13),
                    decoration: const InputDecoration(
                      hintText: 'Highlight your relevant skills, projects, or notice period...',
                    ),
                  ),
                  const SizedBox(height: 20),

                  CustomButton(
                    text: 'Confirm & Submit Application',
                    onPressed: () {
                      Navigator.pop(context);
                      setState(() {
                        _selectedResume = activeResume;
                        _hasApplied = true;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Application submitted with $activeResume! Track it under Applications.'),
                          backgroundColor: AppColors.success,
                        ),
                      );
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: Text(_job.company),
        actions: [
          IconButton(
            icon: Icon(_isSaved ? Icons.bookmark : Icons.bookmark_border),
            color: _isSaved ? AppColors.primaryLight : AppColors.textPrimaryDark,
            onPressed: () {
              setState(() => _isSaved = !_isSaved);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(_isSaved ? 'Job saved' : 'Job removed from saved'),
                  duration: const Duration(seconds: 1),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Job link copied to clipboard')),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title & Score
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      _job.title,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimaryDark,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  MatchScoreChip(score: _job.matchScore),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                _job.company,
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.primaryLight,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),

              // Metadata Pills Row
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _infoChip(Icons.location_on_outlined, _job.location),
                  _infoChip(Icons.work_outline, _job.workMode),
                  _infoChip(Icons.currency_rupee, _job.salary, isHighlight: true),
                  _infoChip(Icons.timelapse_outlined, _job.experience),
                ],
              ),
              const SizedBox(height: 20),

              // AI Match Breakdown Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.auto_awesome, color: AppColors.primaryLight, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'AI Match Score Explanation',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimaryDark,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _job.matchExplanation,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondaryDark,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Required Skills
              const Text(
                'Required Skills',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _job.skills.map((skill) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceDark,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.borderDark),
                    ),
                    child: Text(
                      skill,
                      style: const TextStyle(fontSize: 12, color: AppColors.textPrimaryDark),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // Job Description
              const Text(
                'Job Description',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                _job.description,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondaryDark,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 24),

              // Eligibility
              const Text(
                'Eligibility Criteria',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                _job.eligibility,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondaryDark,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: AppColors.surfaceDark,
          border: Border(top: BorderSide(color: AppColors.borderDark)),
        ),
        child: CustomButton(
          text: _hasApplied ? 'Applied ✓' : 'Apply for this Role',
          variant: _hasApplied ? ButtonVariant.secondary : ButtonVariant.primary,
          isLoading: _isApplying,
          onPressed: _hasApplied ? null : _handleApply,
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String text, {bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isHighlight ? AppColors.success.withOpacity(0.3) : AppColors.borderDark,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: isHighlight ? AppColors.success : AppColors.textMutedDark,
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isHighlight ? FontWeight.w600 : FontWeight.normal,
              color: isHighlight ? AppColors.success : AppColors.textPrimaryDark,
            ),
          ),
        ],
      ),
    );
  }
}
