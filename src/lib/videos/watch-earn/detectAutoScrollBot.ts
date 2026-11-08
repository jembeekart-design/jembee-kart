interface DetectAutoScrollBotData {

  scrollSpeed: number;

  scrollCount: number;

  watchDuration: number;

  interactionCount: number;

}

export async function
detectAutoScrollBot({
  scrollSpeed,
  scrollCount,
  watchDuration,
  interactionCount
}: DetectAutoScrollBotData) {

  try {

    /* =========================
       FAST SCROLL CHECK
    ========================= */

    if (
      scrollSpeed > 3000
    ) {

      return {
        success: false,

        bot: true,

        reason:
          "Abnormally fast scrolling"
      };
    }

    /* =========================
       EXCESSIVE SCROLLING
    ========================= */

    if (
      scrollCount > 100
    ) {

      return {
        success: false,

        bot: true,

        reason:
          "Excessive scrolling detected"
      };
    }

    /* =========================
       LOW WATCH TIME
    ========================= */

    if (
      watchDuration < 3
    ) {

      return {
        success: false,

        bot: true,

        reason:
          "Very low watch duration"
      };
    }

    /* =========================
       NO INTERACTION
    ========================= */

    if (
      interactionCount <= 0
    ) {

      return {
        success: false,

        bot: true,

        reason:
          "No user interaction"
      };
    }

    /* =========================
       VALID USER
    ========================= */

    return {
      success: true,

      bot: false,

      reason:
        "Valid user activity"
    };

  } catch (error) {

    console.error(
      "AUTO SCROLL BOT ERROR:",
      error
    );

    return {
      success: false,

      bot: true,

      reason:
        "Detection failed"
    };
  }
}
