import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/directory_data.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../auth_notifier.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _collegeController = TextEditingController();
  final _companyController = TextEditingController();
  final _roleController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String _professionalStatus = 'Student'; // 'Student' or 'Working Professional'
  bool _isLoading = false;
  String? _errorMessage;

  // Searchable college dropdown state
  List<String> _filteredColleges = [];
  bool _showCollegeSuggestions = false;

  @override
  void initState() {
    super.initState();
    _filteredColleges = DirectoryData.colleges;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _collegeController.dispose();
    _companyController.dispose();
    _roleController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _onCollegeChanged(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredColleges = DirectoryData.colleges;
      } else {
        _filteredColleges = DirectoryData.colleges
            .where((c) => c.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
      _showCollegeSuggestions = true;
    });
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorMessage = 'Passwords do not match');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final user = await ref.read(authNotifierProvider.notifier).register(
            name: _nameController.text.trim(),
            email: _emailController.text.trim(),
            password: _passwordController.text,
            phone: _phoneController.text.trim(),
            professionalStatus: _professionalStatus,
            collegeName: _collegeController.text.trim(),
            companyName: _professionalStatus == 'Working Professional'
                ? _companyController.text.trim()
                : null,
            currentRole: _professionalStatus == 'Working Professional'
                ? _roleController.text.trim()
                : null,
          );

      // Trigger OTP sending
      await ref.read(authRepositoryProvider).sendOtp(
            email: user.email,
            phone: user.phone ?? _phoneController.text.trim(),
          );

      if (mounted) {
        context.push('/otp-verification', extra: {
          'email': user.email,
          'phone': user.phone ?? _phoneController.text.trim(),
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = e.toString());
      }
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
        title: const Text('Candidate Registration'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Create Your Profile',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimaryDark,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Join GetnextIn to unlock AI-assisted recruitment & job matching',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondaryDark,
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

                // Full Name
                CustomTextField(
                  label: 'Full Name',
                  hint: 'e.g. Rahul Sharma',
                  controller: _nameController,
                  prefixIcon: Icons.person_outline,
                  validator: (val) =>
                      val == null || val.trim().isEmpty ? 'Name is required' : null,
                ),
                const SizedBox(height: 16),

                // Email
                CustomTextField(
                  label: 'Email Address',
                  hint: 'rahul@example.com',
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: Icons.email_outlined,
                  validator: (val) =>
                      val != null && val.contains('@') ? null : 'Valid email is required',
                ),
                const SizedBox(height: 16),

                // Mobile
                CustomTextField(
                  label: 'Mobile Number',
                  hint: '+91 9876543210',
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  prefixIcon: Icons.phone_outlined,
                  validator: (val) =>
                      val != null && val.length >= 10 ? null : 'Valid phone number is required',
                ),
                const SizedBox(height: 20),

                // Professional Status Selection
                const Text(
                  'Professional Status',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondaryDark,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _professionalStatus = 'Student'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _professionalStatus == 'Student'
                                ? AppColors.primary.withOpacity(0.15)
                                : AppColors.surfaceDark,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _professionalStatus == 'Student'
                                  ? AppColors.primary
                                  : AppColors.borderDark,
                            ),
                          ),
                          child: Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.school_outlined,
                                  size: 18,
                                  color: _professionalStatus == 'Student'
                                      ? AppColors.primaryLight
                                      : AppColors.textSecondaryDark,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Student',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: _professionalStatus == 'Student'
                                        ? AppColors.primaryLight
                                        : AppColors.textSecondaryDark,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () =>
                            setState(() => _professionalStatus = 'Working Professional'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _professionalStatus == 'Working Professional'
                                ? AppColors.primary.withOpacity(0.15)
                                : AppColors.surfaceDark,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _professionalStatus == 'Working Professional'
                                  ? AppColors.primary
                                  : AppColors.borderDark,
                            ),
                          ),
                          child: Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.work_outline,
                                  size: 18,
                                  color: _professionalStatus == 'Working Professional'
                                      ? AppColors.primaryLight
                                      : AppColors.textSecondaryDark,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Working Pro',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: _professionalStatus == 'Working Professional'
                                        ? AppColors.primaryLight
                                        : AppColors.textSecondaryDark,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Searchable College Selection with manual entry fallback
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CustomTextField(
                      label: 'College / University Name',
                      hint: 'Type to search or enter manually',
                      controller: _collegeController,
                      prefixIcon: Icons.account_balance_outlined,
                      onChanged: _onCollegeChanged,
                      validator: (val) => val == null || val.trim().isEmpty
                          ? 'College name is required'
                          : null,
                    ),
                    if (_showCollegeSuggestions && _filteredColleges.isNotEmpty) ...[
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        constraints: const BoxConstraints(maxHeight: 180),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceDark,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.borderDark),
                        ),
                        child: ListView.separated(
                          shrinkWrap: true,
                          padding: EdgeInsets.zero,
                          itemCount: _filteredColleges.take(6).length,
                          separatorBuilder: (_, __) =>
                              const Divider(height: 1, color: AppColors.borderDark),
                          itemBuilder: (context, idx) {
                            final college = _filteredColleges[idx];
                            return ListTile(
                              dense: true,
                              title: Text(
                                college,
                                style: const TextStyle(
                                  color: AppColors.textPrimaryDark,
                                  fontSize: 13,
                                ),
                              ),
                              onTap: () {
                                setState(() {
                                  _collegeController.text = college;
                                  _showCollegeSuggestions = false;
                                });
                              },
                            );
                          },
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 16),

                // Working Professional Fields
                if (_professionalStatus == 'Working Professional') ...[
                  CustomTextField(
                    label: 'Current Company Name',
                    hint: 'e.g. Infosys, TCS, Startup',
                    controller: _companyController,
                    prefixIcon: Icons.business_outlined,
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    label: 'Current Role / Designation',
                    hint: 'e.g. SDE-1, Product Designer',
                    controller: _roleController,
                    prefixIcon: Icons.badge_outlined,
                  ),
                  const SizedBox(height: 16),
                ],

                // Password
                CustomTextField(
                  label: 'Password',
                  hint: '••••••••',
                  controller: _passwordController,
                  isPassword: true,
                  prefixIcon: Icons.lock_outline,
                  validator: (val) =>
                      val != null && val.length >= 6 ? null : 'At least 6 characters required',
                ),
                const SizedBox(height: 16),

                // Confirm Password
                CustomTextField(
                  label: 'Confirm Password',
                  hint: '••••••••',
                  controller: _confirmPasswordController,
                  isPassword: true,
                  prefixIcon: Icons.lock_outline,
                  validator: (val) =>
                      val != null && val.isNotEmpty ? null : 'Confirm your password',
                ),
                const SizedBox(height: 28),

                // Register Action
                CustomButton(
                  text: 'Create Account & Continue',
                  isLoading: _isLoading,
                  onPressed: _handleRegister,
                ),
                const SizedBox(height: 20),

                // Already have account
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Already registered? ',
                      style: TextStyle(color: AppColors.textSecondaryDark, fontSize: 14),
                    ),
                    GestureDetector(
                      onTap: () => context.pop(),
                      child: const Text(
                        'Sign In',
                        style: TextStyle(
                          color: AppColors.primaryLight,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
