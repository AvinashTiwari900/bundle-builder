import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/match_score_chip.dart';
import '../../../../core/widgets/status_badge.dart';

class AutoApplyScreen extends StatefulWidget {
  const AutoApplyScreen({super.key});

  @override
  State<AutoApplyScreen> createState() => _AutoApplyScreenState();
}

class _AutoApplyScreenState extends State<AutoApplyScreen> {
  bool _isEnabled = true;
  bool _consentGiven = true;
  double _minMatchScore = 80;
  int _maxDailyLimit = 10;

  final List<Map<String, dynamic>> _dispatches = [
    {
      'company': 'Fintech Nexus Ltd',
      'job': 'Senior Mobile Engineer (Flutter)',
      'matchScore': 94,
      'date': 'Today, 11:20 AM',
      'reason': 'High score on Flutter, Riverpod, and Clean Architecture.',
      'status': 'Shortlisted',
    },
    {
      'company': 'PayScale AI Corp',
      'job': 'Cross-Platform App Specialist',
      'matchScore': 89,
      'date': 'Today, 09:15 AM',
      'reason': 'Direct match on Dart, Dio, and PostgreSQL state synchronization.',
      'status': 'Under Review',
    },
    {
      'company': 'Alpha Telehealth',
      'job': 'Mobile UI Developer',
      'matchScore': 83,
      'date': 'Yesterday, 04:30 PM',
      'reason': 'Matches target salary expectation (14 LPA) and hybrid preference.',
      'status': 'Pending',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('Auto-Apply Engine'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Master Activation Switch
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: _isEnabled ? AppColors.primary : AppColors.borderDark,
                    width: 1.5,
                  ),
                ),
                child: Column(
                  children: [
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      activeColor: AppColors.primary,
                      title: const Text(
                        'Autonomous Job Application',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      subtitle: const Text(
                        'AI applies to verified jobs matching your exact score & criteria',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                      ),
                      value: _isEnabled,
                      onChanged: (val) => setState(() => _isEnabled = val),
                    ),
                    if (_isEnabled) ...[
                      const Divider(color: AppColors.borderDark),
                      CheckboxListTile(
                        contentPadding: EdgeInsets.zero,
                        activeColor: AppColors.primary,
                        title: const Text(
                          'I authorize GetnextIn AI to submit applications on my behalf',
                          style: TextStyle(fontSize: 12, color: AppColors.textPrimaryDark),
                        ),
                        value: _consentGiven,
                        onChanged: (val) => setState(() => _consentGiven = val ?? false),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // KPI Counters
              Row(
                children: [
                  Expanded(child: _miniKpi('Today', '2 / 10', AppColors.primaryLight)),
                  const SizedBox(width: 8),
                  Expanded(child: _miniKpi('Pending', '1', AppColors.warning)),
                  const SizedBox(width: 8),
                  Expanded(child: _miniKpi('Shortlisted', '1', AppColors.success)),
                ],
              ),
              const SizedBox(height: 24),

              // Configuration Controls
              const Text(
                'Auto-Apply Filters & Rules',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 14),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderDark),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Min Match Score Slider
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Minimum AI Match Score',
                          style: TextStyle(fontSize: 13, color: AppColors.textSecondaryDark),
                        ),
                        Text(
                          '${_minMatchScore.toInt()}%',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryLight,
                          ),
                        ),
                      ],
                    ),
                    Slider(
                      value: _minMatchScore,
                      min: 60,
                      max: 95,
                      divisions: 7,
                      activeColor: AppColors.primary,
                      inactiveColor: AppColors.cardDark,
                      onChanged: _isEnabled
                          ? (val) => setState(() => _minMatchScore = val)
                          : null,
                    ),
                    const SizedBox(height: 12),

                    // Max Daily Applications
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Max Daily Applications Limit',
                          style: TextStyle(fontSize: 13, color: AppColors.textSecondaryDark),
                        ),
                        Text(
                          '$_maxDailyLimit jobs/day',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primaryLight,
                          ),
                        ),
                      ],
                    ),
                    Slider(
                      value: _maxDailyLimit.toDouble(),
                      min: 1,
                      max: 20,
                      divisions: 19,
                      activeColor: AppColors.primary,
                      inactiveColor: AppColors.cardDark,
                      onChanged: _isEnabled
                          ? (val) => setState(() => _maxDailyLimit = val.toInt())
                          : null,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Dispatched Applications History
              const Text(
                'Recent Auto-Applied Dispatches',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 12),

              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _dispatches.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, idx) {
                  final item = _dispatches[idx];
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
                                item['job'] as String,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimaryDark,
                                ),
                              ),
                            ),
                            MatchScoreChip(score: item['matchScore'] as int),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item['company'] as String,
                          style: const TextStyle(fontSize: 13, color: AppColors.primaryLight),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Reason: ${item['reason']}',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              item['date'] as String,
                              style: const TextStyle(fontSize: 11, color: AppColors.textMutedDark),
                            ),
                            StatusBadge(status: item['status'] as String),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _miniKpi(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryDark)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color),
          ),
        ],
      ),
    );
  }
}
