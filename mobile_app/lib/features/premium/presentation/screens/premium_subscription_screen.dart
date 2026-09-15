import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../authentication/presentation/auth_notifier.dart';

class PremiumSubscriptionScreen extends ConsumerStatefulWidget {
  const PremiumSubscriptionScreen({super.key});

  @override
  ConsumerState<PremiumSubscriptionScreen> createState() => _PremiumSubscriptionScreenState();
}

class _PremiumSubscriptionScreenState extends ConsumerState<PremiumSubscriptionScreen> {
  int _selectedPlanIndex = 1; // 0: Monthly, 1: Annual (Recommended)
  bool _isProcessing = false;

  final List<Map<String, dynamic>> _plans = [
    {
      'id': 'monthly',
      'title': 'Monthly Pro',
      'price': '₹499',
      'period': '/month',
      'billing': 'Billed monthly, cancel anytime',
      'isPopular': false,
    },
    {
      'id': 'annual',
      'title': 'Annual Pro',
      'price': '₹3,999',
      'period': '/year',
      'billing': '₹333/month • Save 33% annually',
      'isPopular': true,
    },
  ];

  final List<Map<String, dynamic>> _features = [
    {
      'title': 'Autonomous Auto-Apply Quota',
      'desc': 'Daily quota boosted to 50 jobs with AI auto-matching & screening',
      'icon': Icons.bolt_rounded,
    },
    {
      'title': 'Verified Pro Candidate Badge',
      'desc': 'Blue & Gold badge displayed on your profile and community posts',
      'icon': Icons.verified_rounded,
    },
    {
      'title': 'Top Recruiter Search Priority',
      'desc': 'Your profile appears in top 5% of candidate search results for tech leads',
      'icon': Icons.trending_up_rounded,
    },
    {
      'title': 'Real-time Application Read Receipts',
      'desc': 'Know precisely when hiring managers review your resume and portfolio',
      'icon': Icons.visibility_rounded,
    },
    {
      'title': 'Direct Recruiter InMail Messaging',
      'desc': 'Directly message hiring teams even before mutual connection',
      'icon': Icons.chat_bubble_outline_rounded,
    },
  ];

  Future<void> _handleUpgrade() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(milliseconds: 600));

    final selected = _plans[_selectedPlanIndex];
    ref.read(authNotifierProvider.notifier).updateSubscription(
          isSubscribed: true,
          plan: selected['title'],
          expiry: 'Sep 15, 2027',
        );

    if (mounted) {
      setState(() => _isProcessing = false);
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppColors.cardLight,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.workspace_premium, color: Color(0xFFD97706), size: 28),
              SizedBox(width: 8),
              Text(
                'Welcome to Pro!',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ],
          ),
          content: const Text(
            'Your GetNextIn Pro subscription is now active. Your verified Pro badge is unlocked across your profile and drawer.',
            style: TextStyle(color: AppColors.textSecondaryLight, fontSize: 14),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Awesome', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
    }
  }

  void _handleCancel() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardLight,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Subscription?'),
        content: const Text(
          'Are you sure you want to revert to the Free tier? You will lose Pro recruiter visibility and your verified badge.',
          style: TextStyle(fontSize: 14, color: AppColors.textSecondaryLight),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Keep Pro'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ref.read(authNotifierProvider.notifier).updateSubscription(
                    isSubscribed: false,
                    plan: null,
                    expiry: null,
                  );
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Subscription downgraded to Free tier')),
              );
            },
            child: const Text('Confirm', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final user = authState.asData?.value;
    final isSubscribed = user?.isSubscribed ?? false;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        title: const Text('GetNextIn Pro', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Banner with blue-to-purple gradient
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: isSubscribed
                      ? const LinearGradient(
                          colors: [Color(0xFFFEF3C7), Color(0xFFFDE68A)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        )
                      : AppColors.proHeroGradient,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: isSubscribed
                          ? const Color(0xFFD97706).withValues(alpha: 0.15)
                          : const Color(0xFF4338CA).withValues(alpha: 0.25),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isSubscribed
                                ? const Color(0xFFD97706)
                                : Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isSubscribed ? Icons.verified : Icons.workspace_premium,
                                size: 14,
                                color: Colors.white,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                isSubscribed ? 'ACTIVE SUBSCRIPTION' : 'PRO CANDIDATE',
                                style: const TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (isSubscribed)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.success,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text(
                              'VERIFIED',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      isSubscribed
                          ? user?.subscriptionPlan ?? 'GetNextIn Pro'
                          : 'Accelerate Your Job Hunt with Pro',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: isSubscribed ? const Color(0xFF78350F) : Colors.white,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      isSubscribed
                          ? 'Renews on ${user?.subscriptionExpiry ?? "Sep 15, 2027"} • Full Recruiter Visibility'
                          : 'Get 4x more interview calls, autonomous auto-apply, and priority candidate indexing.',
                      style: TextStyle(
                        fontSize: 13,
                        color: isSubscribed ? const Color(0xFF92400E) : Colors.white.withValues(alpha: 0.8),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              if (!isSubscribed) ...[
                // Clear Monthly / Annual Selection
                const Text(
                  'Choose Your Plan',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimaryLight,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: List.generate(_plans.length, (idx) {
                    final plan = _plans[idx];
                    final isSelected = _selectedPlanIndex == idx;

                    return Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedPlanIndex = idx),
                        child: Container(
                          margin: EdgeInsets.only(left: idx == 0 ? 0 : 5, right: idx == 1 ? 0 : 5),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.cardLight,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : AppColors.borderLight,
                              width: isSelected ? 2 : 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: isSelected
                                    ? AppColors.primary.withValues(alpha: 0.08)
                                    : Colors.black.withValues(alpha: 0.01),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (plan['isPopular'] == true)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  margin: const EdgeInsets.only(bottom: 6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEFF6FF),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Text(
                                    'SAVE 33%',
                                    style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppColors.primary),
                                  ),
                                ),
                              Text(
                                plan['title'],
                                style: TextStyle(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w700,
                                  color: isSelected ? AppColors.primary : AppColors.textPrimaryLight,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.baseline,
                                textBaseline: TextBaseline.alphabetic,
                                children: [
                                  Text(
                                    plan['price'],
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.textPrimaryLight,
                                    ),
                                  ),
                                  Text(
                                    plan['period'],
                                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                plan['billing'],
                                style: const TextStyle(fontSize: 10.5, color: AppColors.textMutedDark),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 24),
              ],

              // Features List
              const Text(
                'Pro Benefits',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimaryLight,
                ),
              ),
              const SizedBox(height: 10),
              ..._features.map((f) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.cardLight,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF6FF),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(f['icon'] as IconData, color: AppColors.primary, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              f['title'],
                              style: const TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimaryLight,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              f['desc'],
                              style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondaryLight),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 24),

              // CTA Action
              if (isSubscribed) ...[
                CustomButton(
                  text: 'Cancel Subscription',
                  variant: ButtonVariant.outline,
                  onPressed: _handleCancel,
                ),
              ] else ...[
                CustomButton(
                  text: 'Upgrade to Pro',
                  variant: ButtonVariant.primary,
                  isLoading: _isProcessing,
                  onPressed: _handleUpgrade,
                ),
              ],
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
