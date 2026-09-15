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
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: Text(_job.company, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17)),
        actions: [
          IconButton(
            icon: Icon(_isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded),
            color: _isSaved ? AppColors.primary : AppColors.textPrimaryLight,
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
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Job Summary Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.cardLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            _job.title,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimaryLight,
                              height: 1.3,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        MatchScoreChip(score: _job.matchScore),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _job.company,
                      style: const TextStyle(
                        fontSize: 15,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Metadata Pills Row
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _infoChip(Icons.location_on_outlined, _job.location),
                        _infoChip(Icons.work_outline, _job.workMode),
                        _infoChip(Icons.payments_outlined, _job.salary, isHighlight: true),
                        _infoChip(Icons.schedule_outlined, _job.experience),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // AI Match Breakdown Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFBFDBFE)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.auto_awesome, color: AppColors.primary, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'AI Match Score Explanation',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimaryLight,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _job.matchExplanation,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textPrimaryLight,
                        height: 1.45,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Required Skills Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.cardLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Required Skills',
                      style: TextStyle(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimaryLight,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _job.skills.map((skill) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppColors.elevatedLight,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.borderLight),
                          ),
                          child: Text(
                            skill,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimaryLight),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Job Description Card
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.cardLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Job Description',
                      style: TextStyle(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimaryLight,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _job.description,
                      style: const TextStyle(
                        fontSize: 13.5,
                        color: AppColors.textSecondaryLight,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Eligibility Criteria',
                      style: TextStyle(
                        fontSize: 15.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimaryLight,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _job.eligibility,
                      style: const TextStyle(
                        fontSize: 13.5,
                        color: AppColors.textSecondaryLight,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: AppColors.cardLight,
          border: Border(top: BorderSide(color: AppColors.borderLight)),
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

  Widget _infoChip(IconData icon, String text, {bool isHighlight = false, String? jobWorkMode}) {
    final displayText = jobWorkMode ?? text;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.elevatedLight,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isHighlight ? const Color(0xFF6EE7B7) : AppColors.borderLight,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: isHighlight ? AppColors.success : AppColors.textSecondaryLight,
          ),
          const SizedBox(width: 6),
          Text(
            displayText,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isHighlight ? FontWeight.w700 : FontWeight.w500,
              color: isHighlight ? AppColors.success : AppColors.textPrimaryLight,
            ),
          ),
        ],
      ),
    );
  }
}
