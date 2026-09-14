import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/status_badge.dart';

class DocumentItem {
  final String id;
  final String title;
  final String category;
  final String status; // 'Verified', 'Under Review', 'Action Needed', 'Uploaded'
  final String date;
  final bool isSensitive;

  const DocumentItem({
    required this.id,
    required this.title,
    required this.category,
    required this.status,
    required this.date,
    this.isSensitive = false,
  });
}

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  bool _isVaultUnlocked = false;

  final List<DocumentItem> _documents = [
    const DocumentItem(
      id: 'doc-1',
      title: 'Current Professional Resume (PDF)',
      category: 'Resume & CV',
      status: 'Verified',
      date: 'Aug 24, 2026',
    ),
    const DocumentItem(
      id: 'doc-2',
      title: 'B.Tech Degree Certificate & Transcripts',
      category: 'Education',
      status: 'Verified',
      date: 'Aug 24, 2026',
    ),
    const DocumentItem(
      id: 'doc-3',
      title: 'Government Identity (Aadhaar / PAN)',
      category: 'KYC & Identity',
      status: 'Verified',
      date: 'Aug 24, 2026',
      isSensitive: true,
    ),
    const DocumentItem(
      id: 'doc-4',
      title: 'Previous Employer Experience Letter',
      category: 'Work History',
      status: 'Under Review',
      date: 'Sep 02, 2026',
      isSensitive: true,
    ),
    const DocumentItem(
      id: 'doc-5',
      title: 'Recent Salary Slips (Last 3 Months)',
      category: 'Compensation Proof',
      status: 'Action Needed',
      date: 'Pending Upload',
      isSensitive: true,
    ),
  ];

  void _showUnlockVaultDialog() {
    final otpController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppColors.surfaceDark,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.lock_outline, color: AppColors.primaryLight, size: 20),
              SizedBox(width: 8),
              Text('Unlock Sensitive Vault', style: TextStyle(color: AppColors.textPrimaryDark, fontSize: 16)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enter OTP to unlock sensitive identity & salary documents (Sandbox: 123456)',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondaryDark),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: otpController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textPrimaryDark),
                decoration: const InputDecoration(hintText: 'Enter 6-digit OTP'),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondaryDark)),
            ),
            ElevatedButton(
              onPressed: () {
                if (otpController.text.trim() == '123456' || otpController.text.length == 6) {
                  setState(() => _isVaultUnlocked = true);
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('KYC Vault unlocked successfully!')),
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              child: const Text('Verify & Unlock'),
            ),
          ],
        );
      },
    );
  }

  void _showUploadDialog() {
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
              const Text(
                'Upload Verification Document',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimaryDark,
                ),
              ),
              const SizedBox(height: 14),
              ListTile(
                leading: const Icon(Icons.picture_as_pdf, color: AppColors.primaryLight),
                title: const Text('Select PDF / Image Document',
                    style: TextStyle(color: AppColors.textPrimaryDark, fontSize: 14)),
                subtitle: const Text('Supported formats: PDF, PNG, JPEG (Max 10 MB)',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondaryDark)),
                onTap: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Document uploaded & sent for automated KYC verification!')),
                  );
                },
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
        title: const Text('Encrypted KYC & Document Vault'),
        actions: [
          IconButton(
            icon: Icon(_isVaultUnlocked ? Icons.lock_open : Icons.lock_outline),
            color: _isVaultUnlocked ? AppColors.success : AppColors.warning,
            onPressed: _isVaultUnlocked
                ? () => setState(() => _isVaultUnlocked = false)
                : _showUnlockVaultDialog,
          ),
          IconButton(
            icon: const Icon(Icons.upload_file),
            onPressed: _showUploadDialog,
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Vault Security Status Banner
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: _isVaultUnlocked ? AppColors.success.withOpacity(0.3) : AppColors.borderDark,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: (_isVaultUnlocked ? AppColors.success : AppColors.primary).withOpacity(0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _isVaultUnlocked ? Icons.verified : Icons.security,
                        color: _isVaultUnlocked ? AppColors.success : AppColors.primaryLight,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isVaultUnlocked ? 'Vault Status: Unlocked (Active Session)' : 'Vault Status: Protected',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimaryDark,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _isVaultUnlocked
                                ? 'Sensitive compensation & identity docs are accessible'
                                : 'Tap the lock icon or document to authenticate with OTP',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Documents List
              const Text(
                'Candidate Documents',
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
                itemCount: _documents.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, idx) {
                  final doc = _documents[idx];
                  final isRestricted = doc.isSensitive && !_isVaultUnlocked;

                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceDark,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderDark),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.cardDark,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            isRestricted ? Icons.lock : Icons.description_outlined,
                            color: isRestricted ? AppColors.warning : AppColors.primaryLight,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                doc.title,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimaryDark,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${doc.category} • ${doc.date}',
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                              ),
                            ],
                          ),
                        ),
                        if (isRestricted)
                          TextButton(
                            onPressed: _showUnlockVaultDialog,
                            child: const Text('Unlock', style: TextStyle(fontSize: 12, color: AppColors.warning)),
                          )
                        else
                          StatusBadge(status: doc.status),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              CustomButton(
                text: 'Upload New Document',
                icon: Icons.upload_file,
                onPressed: _showUploadDialog,
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
