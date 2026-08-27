// Global Media Stream Registry & Hardware Watchdog
// Ensures zero leaked camera/mic tracks across the entire application lifecycle

const activeStreams = new Set<MediaStream>()

export const mediaStreamManager = {
  /**
   * Registers a stream so it can be tracked and forcefully cleaned up when leaving
   */
  register(stream: MediaStream | null | undefined): MediaStream | null {
    if (!stream) return null
    activeStreams.add(stream)

    // Listen for track ending naturally
    stream.getTracks().forEach((track) => {
      track.addEventListener('ended', () => {
        const anyActive = stream.getTracks().some((t) => t.readyState === 'live')
        if (!anyActive) {
          activeStreams.delete(stream)
        }
      })
    })

    return stream
  },

  /**
   * Immediately and unconditionally stops all tracks on a given stream
   */
  stopStream(stream: MediaStream | null | undefined) {
    if (!stream) return
    try {
      stream.getTracks().forEach((track) => {
        try {
          track.stop()
          track.enabled = false
        } catch (e) {}
      })
    } catch (e) {}
    activeStreams.delete(stream)
  },

  /**
   * Nuclear cleanup: stops EVERY registered MediaStream track across the entire app
   */
  stopAll() {
    activeStreams.forEach((stream) => {
      try {
        stream.getTracks().forEach((track) => {
          try {
            track.stop()
            track.enabled = false
          } catch (e) {}
        })
      } catch (e) {}
    })
    activeStreams.clear()
  },

  /**
   * Safe wrapper for getUserMedia that guarantees tracks are destroyed if caller unmounted
   */
  async requestMedia(
    constraints: MediaStreamConstraints,
    isMountedCheck: () => boolean
  ): Promise<MediaStream | null> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia is not supported on this device/browser.')
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // CRITICAL: If the user navigated away or closed the meeting while getUserMedia was resolving
      if (!isMountedCheck()) {
        console.info('[mediaStreamManager] Component unmounted during requestMedia. Terminating tracks immediately.')
        this.stopStream(stream)
        return null
      }

      this.register(stream)
      return stream
    } catch (err) {
      throw err
    }
  }
}

// Global window event listeners for guaranteed camera turn-off
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => mediaStreamManager.stopAll())
  window.addEventListener('pagehide', () => mediaStreamManager.stopAll())
}
