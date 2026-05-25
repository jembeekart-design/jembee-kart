export function generateReferralCode(
  name: string
) {

  try {

    /* ======================================================
    CLEAN NAME
    ====================================================== */

    const cleanName =
      name
        .replace(
          /\s/g,
          ""
        )
        .toUpperCase()
        .slice(0, 6);

    /* ======================================================
    RANDOM NUMBER
    ====================================================== */

    const randomNumber =
      Math.floor(
        1000 +
        Math.random() * 9000
      );

    /* ======================================================
    FINAL CODE
    ====================================================== */

    const referralCode =
      `${cleanName}${randomNumber}`;

    return referralCode;

  } catch (error) {

    console.error(
      "REFERRAL CODE ERROR:",
      error
    );

    return (
      "USER" +
      Math.floor(
        1000 +
        Math.random() * 9000
      )
    );

  }

}
