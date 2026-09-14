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
      'period': '/ month',
      'billing': 'Billed monthly, cancel anytime',
      'isPopular': false,
    },
    {
      'id': 'annual',
      'title': 'Annual Pro',
      'price': '₹3,999',
      'period': '/ year',
      'billing': 'Equivalent to ₹333/month • Save 33%',
      'isPopular': true,
    },
  ];

  final List<Map<String, dynamic>> _features = [
    {
      'title': 'Unlimited Autonomous Auto-Apply',
      'desc': 'Daily quota boosted to 50 jobs with AI auto-matching',
      'icon': Icons.bolt,
    },
    {
      'title': 'Verified Pro Candidate Badge',
      'desc': 'Gold badge displayed on your profile and community posts',
      'icon': Icons.verified,
    },
    {
      'title': 'Top Recruiter Search Priority',
      'desc': 'Your profile appears in top 5% of candidate search results',
      'icon': Icons.trending_up,
    },
    {
      'title': 'Real-time Application Read Receipts',
      'desc': 'Know precisely when hiring managers review your resume',
      'icon': Icons.visibility,
    },
    {
      'title': 'Direct Recruiter InMail Messaging',
      'desc': 'Message hiring teams even before mutual connection',
      'icon': Icons.chat_bubble_outline,
    },
  ];

  Future<void> _handleUpgrade() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(milliseconds: 700));

    final selected = _plans[_selectedPlanIndex];
    ref.read(authNotifierProvider.notifier).updateSubscription(
          isSubscribed: true,
          plan: selected['title'],
          expiry: 'Sep 13, 2027',
        );

    if (mounted) {
      setState(() => _isProcessing = false);
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppColors.surfaceLight,
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
            'Your GetnextIn Pro Candidate subscription is now active. Your verified Pro badge is unlocked across your profile and drawer.',
            style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 14),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Awesome'),
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
        backgroundColor: AppColors.surfaceLight,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Subscription?'),
        content: const Text(
          'Are you sure you want to revert to the Free Candidate tier? You will lose Pro recruiter visibility and your verified badge.',
          style: TextStyle(fontSize: 14, color: AppColors.textSecondaryDark),
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
                const SnackBar(content: Text('Subscription downgraded to Free Candidate')),
              );
            },
            child: const Text('Confirm', style: TextStyle(color: AppColors.error)),
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
        title: const Text('GetnextIn Premium'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: isSubscribed
                      ? const LinearGradient(
                          colors: [Color(0xFFFEF3C7), Color(0xFFFDE68A)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        )
                      : AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: isSubscribed
                          ? const Color(0xFFD97706).withOpacity(0.2)
                          : AppColors.primary.withOpacity(0.25),
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
                                : Colors.white.withOpacity(0.2),
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
                                  fontSize: 11,
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
                          ? user?.subscriptionPlan ?? 'GetnextIn Pro'
                          : 'Accelerate Your Job Hunt with Pro',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: isSubscribed ? const Color(0xFF78350F) : Colors.white,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      isSubscribed
                          ? 'Renews on ${user?.subscriptionExpiry ?? "Sep 13, 2027"} • Full Recruiter Visibility'
                          : 'Get 4x more interview calls, autonomous auto-apply, and priority candidate indexing.',
                      style: TextStyle(
                        fontSize: 13,
                        color: isSubscribed ? const Color(0xFF92400E) : Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              if (isSubscribed) ...[
                // Active Subscription Status Details
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Membership Benefits Active',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimaryDark,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ..._features.map((f) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle, color: AppColors.success, size: 18),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    f['title'] as String,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.textPrimaryDark,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          )),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                CustomButton(
                  text: 'Cancel / Downgrade Plan',
                  variant: ButtonVariant.outline,
                  onPressed: _handleCancel,
                ),
              ] else ...[
                // Plan Selector
                const Text(
                  'Select a Membership Plan',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: List.generate(_plans.length, (idx) {
                    final plan = _plans[idx];
                    final isSelected = _selectedPlanIndex == idx;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedPlanIndex = idx),
                        child: Container(
                          margin: EdgeInsets.only(left: idx == 0 ? 0 : 8, right: idx == 1 ? 0 : 8),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFEFF6FF) : AppColors.surfaceLight,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : AppColors.borderLight,
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (plan['isPopular'] == true)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  margin: const EdgeInsets.only(bottom: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'BEST VALUE',
                                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                ),
                              Text(
                                plan['title'] as String,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimaryDark,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.baseline,
                                textBaseline: TextBaseline.alphabetic,
                                children: [
                                  Text(
                                    plan['price'] as String,
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.textPrimaryDark,
                                    ),
                                  ),
                                  Text(
                                    plan['period'] as String,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: AppColors.textSecondaryDark,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                plan['billing'] as String,
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: AppColors.textSecondaryDark,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 24),

                // Features List
                const Text(
                  'What You Get with Pro',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 12),
                ..._features.map((f) => Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
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
                                  f['title'] as String,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimaryDark,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  f['desc'] as String,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.textSecondaryDark,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )),
                const SizedBox(height: 20),

                // CTA Button
                CustomButton(
                  text: 'Upgrade to Pro Now',
                  icon: Icons.workspace_premium,
                  isLoading: _isProcessing,
                  onPressed: _handleUpgrade,
                ),
              ],
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
