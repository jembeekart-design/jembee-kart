export function generateReferralCode(
  name: string
) {
  try {

    /* ======================================================
       CLEAN NAME
    ====================================================== */

    const cleanName =
      (name || "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 6);

    /* ======================================================
       FALLBACK NAME
    ====================================================== */

    const prefix =
      cleanName || "USER";

    /* ======================================================
       RANDOM PART
    ====================================================== */

    const randomPart =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    /* ======================================================
       TIMESTAMP PART
    ====================================================== */

    const timePart =
      Date.now()
        .toString()
        .slice(-4);

    /* ======================================================
       FINAL CODE
    ====================================================== */

    return `${prefix}${randomPart}${timePart}`;

  } catch (error) {

    console.error(
      "REFERRAL CODE ERROR:",
      error
    );

    return `USER${Date.now()
      .toString()
      .slice(-8)}`;
  }
}
