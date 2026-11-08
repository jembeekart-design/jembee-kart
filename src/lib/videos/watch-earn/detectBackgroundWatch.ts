interface DetectBackgroundWatchData {

  hidden: boolean;

  focusLost: boolean;

  paused: boolean;

}

export async function
detectBackgroundWatch({
  hidden,
  focusLost,
  paused
}: DetectBackgroundWatchData) {

  try {

    /* =========================
       TAB HIDDEN
    ========================= */

    if (hidden) {

      return {
        success: false,

        background: true,

        reason:
          "Tab hidden detected"
      };
    }

    /* =========================
       WINDOW FOCUS LOST
    ========================= */

    if (focusLost) {

      return {
        success: false,

        background: true,

        reason:
          "Window focus lost"
      };
    }

    /* =========================
       VIDEO PAUSED
    ========================= */

    if (paused) {

      return {
        success: false,

        background: true,

        reason:
          "Video paused"
      };
    }

    /* =========================
       VALID WATCH
    ========================= */

    return {
      success: true,

      background: false,

      reason:
        "Active watching"
    };

  } catch (error) {

    console.error(
      "BACKGROUND WATCH ERROR:",
      error
    );

    return {
      success: false,

      background: true,

      reason:
        "Detection failed"
    };
  }
}
