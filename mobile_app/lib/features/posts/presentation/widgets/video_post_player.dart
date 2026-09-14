import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class VideoPostPlayer extends StatefulWidget {
  final String videoUrl;
  final String? title;

  const VideoPostPlayer({
    super.key,
    required this.videoUrl,
    this.title,
  });

  @override
  State<VideoPostPlayer> createState() => _VideoPostPlayerState();
}

class _VideoPostPlayerState extends State<VideoPostPlayer> {
  bool _isPlaying = false;
  bool _isMuted = true;
  double _progress = 0.0; // 0.0 to 1.0

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(12),
      ),
      clipBehavior: Clip.antiAlias,
      child: AspectRatio(
        aspectRatio: 16 / 9,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Video placeholder / animated frame
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.movie_filter_outlined,
                      size: 48,
                      color: Colors.white.withOpacity(0.3),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.title ?? 'Technical Demo Video',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.7),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Play/Pause Overlay Button
            GestureDetector(
              onTap: () {
                setState(() {
                  _isPlaying = !_isPlaying;
                  if (_isPlaying && _progress == 0.0) {
                    _progress = 0.25;
                  }
                });
              },
              child: Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.6),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.3), width: 1.5),
                ),
                child: Icon(
                  _isPlaying ? Icons.pause : Icons.play_arrow,
                  size: 32,
                  color: Colors.white,
                ),
              ),
            ),

            // Bottom Player Controls (Progress, Time, Mute, Full-screen)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Slider / Progress bar
                    SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        trackHeight: 2,
                        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 5),
                        overlayShape: const RoundSliderOverlayShape(overlayRadius: 10),
                        activeTrackColor: AppColors.primary,
                        inactiveTrackColor: Colors.white30,
                        thumbColor: Colors.white,
                      ),
                      child: Slider(
                        value: _progress,
                        onChanged: (val) {
                          setState(() => _progress = val);
                        },
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          _isPlaying ? '0:24 / 1:30' : '0:00 / 1:30',
                          style: const TextStyle(fontSize: 11, color: Colors.white70),
                        ),
                        const Spacer(),
                        // Mute / Unmute
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: Icon(
                            _isMuted ? Icons.volume_off : Icons.volume_up,
                            size: 18,
                            color: Colors.white,
                          ),
                          onPressed: () {
                            setState(() => _isMuted = !_isMuted);
                          },
                        ),
                        const SizedBox(width: 14),
                        // Fullscreen
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: const Icon(
                            Icons.fullscreen,
                            size: 20,
                            color: Colors.white,
                          ),
                          onPressed: () {
                            _openFullscreen(context);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openFullscreen(BuildContext context) {
    showDialog(
      context: context,
      useSafeArea: false,
      barrierColor: Colors.black,
      builder: (ctx) => Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          iconTheme: const IconThemeData(color: Colors.white),
          title: Text(
            widget.title ?? 'Video Player',
            style: const TextStyle(color: Colors.white, fontSize: 16),
          ),
        ),
        body: Center(
          child: AspectRatio(
            aspectRatio: 16 / 9,
            child: VideoPostPlayer(
              videoUrl: widget.videoUrl,
              title: widget.title,
            ),
          ),
        ),
      ),
    );
  }
}
