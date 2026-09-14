import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';

class MeetingRoomScreen extends StatefulWidget {
  final String roomCode;

  const MeetingRoomScreen({super.key, required this.roomCode});

  @override
  State<MeetingRoomScreen> createState() => _MeetingRoomScreenState();
}

class _MeetingRoomScreenState extends State<MeetingRoomScreen> {
  bool _isMicMuted = false;
  bool _isCameraOff = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text('Room: ${widget.roomCode}', style: const TextStyle(fontSize: 16)),
        actions: [
          IconButton(
            icon: const Icon(Icons.copy, size: 20),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Room code copied to clipboard')),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Remote Video Placeholder
            Expanded(
              flex: 3,
              child: Container(
                margin: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderDark),
                ),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.person, size: 64, color: AppColors.textMutedDark),
                      SizedBox(height: 12),
                      Text(
                        'Interviewer Stream Connected',
                        style: TextStyle(color: AppColors.textPrimaryDark, fontSize: 14),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Encrypted WebRTC Session',
                        style: TextStyle(color: AppColors.success, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Local Candidate Video
            Expanded(
              flex: 2,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppColors.cardDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderDark),
                ),
                child: Center(
                  child: _isCameraOff
                      ? const Text('Your camera is off', style: TextStyle(color: AppColors.textMutedDark))
                      : const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.videocam, color: AppColors.primaryLight, size: 40),
                            SizedBox(height: 6),
                            Text('Your Video Stream',
                                style: TextStyle(color: AppColors.textPrimaryDark, fontSize: 13)),
                          ],
                        ),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // In-Call Controls
            Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  FloatingActionButton(
                    heroTag: 'mic',
                    backgroundColor: _isMicMuted ? AppColors.error : AppColors.surfaceDark,
                    onPressed: () => setState(() => _isMicMuted = !_isMicMuted),
                    child: Icon(_isMicMuted ? Icons.mic_off : Icons.mic, color: Colors.white),
                  ),
                  FloatingActionButton(
                    heroTag: 'leave',
                    backgroundColor: AppColors.error,
                    onPressed: () => context.pop(),
                    child: const Icon(Icons.call_end, color: Colors.white),
                  ),
                  FloatingActionButton(
                    heroTag: 'cam',
                    backgroundColor: _isCameraOff ? AppColors.error : AppColors.surfaceDark,
                    onPressed: () => setState(() => _isCameraOff = !_isCameraOff),
                    child: Icon(_isCameraOff ? Icons.videocam_off : Icons.videocam, color: Colors.white),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
