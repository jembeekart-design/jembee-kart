interface DetectFakeWatchData {

  watchedSeconds: number;

  requiredSeconds: number;

  tabActive: boolean;

  videoMuted: boolean;

  playbackRate: number;

}

export async function
detectFakeWatch({
  watchedSeconds,
  requiredSeconds,
  tabActive,
  videoMuted,
  playbackRate
}: DetectFakeWatchData) {

  try {

    /* =========================
       TAB CHECK
    ========================= */

    if (!tabActive) {

      return {
        success: false,

        fake: true,

        reason:
          "Background watching detected"
      };
    }

    /* =========================
       WATCH TIME CHECK
    ========================= */

    if (
      watchedSeconds <
      requiredSeconds
    ) {

      return {
        success: false,

        fake: true,

        reason:
          "Insufficient watch time"
      };
    }

    /* =========================
       MUTE CHECK
    ========================= */

    if (videoMuted) {

      return {
        success: false,

        fake: true,

        reason:
          "Muted video detected"
      };
    }

    /* =========================
       PLAYBACK SPEED CHECK
    ========================= */

    if (
      playbackRate > 1.5
    ) {

      return {
        success: false,

        fake: true,

        reason:
          "Abnormal playback speed"
      };
    }

    /* =========================
       REAL WATCH
    ========================= */

    return {
      success: true,

      fake: false,

      reason:
        "Valid watch"
    };

  } catch (error) {

    console.error(
      "FAKE WATCH ERROR:",
      error
    );

    return {
      success: false,

      fake: true,

      reason:
        "Detection failed"
    };
  }
}
