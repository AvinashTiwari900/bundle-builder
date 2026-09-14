import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/otp_input_view.dart';
import '../auth_notifier.dart';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  final String email;
  final String phone;

  const OtpVerificationScreen({
    super.key,
    required this.email,
    required this.phone,
  });

  @override
  ConsumerState<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen> {
  String _emailOtp = '';
  String _phoneOtp = '';
  bool _isLoading = false;
  String? _errorMessage;

  // Countdown timer
  int _countdown = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    _countdown = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        setState(() => _countdown--);
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _handleResend() async {
    if (_countdown > 0) return;

    setState(() {
      _errorMessage = null;
    });

    try {
      await ref.read(authRepositoryProvider).sendOtp(
            email: widget.email,
            phone: widget.phone,
          );
      _startCountdown();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Verification codes resent successfully')),
        );
      }
    } catch (e) {
      setState(() => _errorMessage = 'Failed to resend code');
    }
  }

  Future<void> _handleVerify() async {
    if (_emailOtp.length < 6 || _phoneOtp.length < 6) {
      setState(() => _errorMessage = 'Please enter both 6-digit codes');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final verified = await ref.read(authRepositoryProvider).verifyOtp(
            email: widget.email,
            emailOtp: _emailOtp,
            phone: widget.phone,
            phoneOtp: _phoneOtp,
          );

      if (verified && mounted) {
        context.go('/home');
      } else {
        setState(() => _errorMessage = 'Invalid or expired OTP code');
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      appBar: AppBar(
        title: const Text('Verify Identity'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enter Verification Codes',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'To secure your account, please enter the dual verification codes sent to your email and phone.',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondaryDark,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),

              // Sandbox tip
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: AppColors.primaryLight, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Development Sandbox OTP: Enter 123456 for instant bypass.',
                        style: TextStyle(color: AppColors.textPrimaryDark, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.error.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: AppColors.error, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Section 1: Email OTP
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Email Code',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  Text(
                    widget.email,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              OtpInputView(
                onCompleted: (val) => setState(() => _emailOtp = val),
                onChanged: (val) => _emailOtp = val,
              ),
              const SizedBox(height: 24),

              // Section 2: Mobile SMS OTP
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'SMS Code',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                  Text(
                    widget.phone,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              OtpInputView(
                onCompleted: (val) => setState(() => _phoneOtp = val),
                onChanged: (val) => _phoneOtp = val,
              ),
              const SizedBox(height: 24),

              // Resend cooldown & timer
              Center(
                child: _countdown > 0
                    ? Text(
                        'Resend code in ${_countdown}s',
                        style: const TextStyle(
                          color: AppColors.textMutedDark,
                          fontSize: 13,
                        ),
                      )
                    : TextButton(
                        onPressed: _handleResend,
                        child: const Text(
                          'Resend Verification Codes',
                          style: TextStyle(
                            color: AppColors.primaryLight,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
              ),
              const SizedBox(height: 24),

              // Verify button
              CustomButton(
                text: 'Verify & Continue',
                isLoading: _isLoading,
                onPressed: _handleVerify,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
