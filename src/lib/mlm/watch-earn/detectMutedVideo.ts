interface DetectMutedVideoData {

  muted: boolean;

  volume: number;

  playbackRate: number;

}

export async function
detectMutedVideo({
  muted,
  volume,
  playbackRate
}: DetectMutedVideoData) {

  try {

    /* =========================
       MUTED CHECK
    ========================= */

    if (muted) {

      return {
        success: false,

        valid: false,

        reason:
          "Muted video detected"
      };
    }

    /* =========================
       LOW VOLUME CHECK
    ========================= */

    if (
      volume <= 0
    ) {

      return {
        success: false,

        valid: false,

        reason:
          "Zero volume detected"
      };
    }

    /* =========================
       PLAYBACK SPEED
    ========================= */

    if (
      playbackRate > 1.5
    ) {

      return {
        success: false,

        valid: false,

        reason:
          "Playback speed abnormal"
      };
    }

    /* =========================
       VALID VIDEO
    ========================= */

    return {
      success: true,

      valid: true,

      reason:
        "Video watch valid"
    };

  } catch (error) {

    console.error(
      "MUTED VIDEO ERROR:",
      error
    );

    return {
      success: false,

      valid: false,

      reason:
        "Detection failed"
    };
  }
}
