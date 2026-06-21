export interface GovernanceScoreInput {
  architectureViolations: number;
  securityViolations: number;
  themeViolations: number;
  adminControlViolations: number;
  profitabilityViolations: number;
}

function calculateCategoryScore(
  violations: number,
  deductionPerIssue: number
): number {
  return Math.max(
    0,
    Math.min(
      100,
      100 - violations * deductionPerIssue
    )
  );
}

export function calculateScores(
  input: GovernanceScoreInput
) {
  const architectureScore =
    calculateCategoryScore(
      input.architectureViolations,
      2
    );

  const securityScore =
    calculateCategoryScore(
      input.securityViolations,
      3
    );

  const themeScore =
    calculateCategoryScore(
      input.themeViolations,
      1
    );

  const adminControlScore =
    calculateCategoryScore(
      input.adminControlViolations,
      2
    );

  const profitabilityScore =
    calculateCategoryScore(
      input.profitabilityViolations,
      4
    );

  const overallScore = Math.round(
    (
      architectureScore +
      securityScore +
      themeScore +
      adminControlScore +
      profitabilityScore
    ) / 5
  );

  return {
    architectureScore,
    securityScore,
    themeScore,
    adminControlScore,
    profitabilityScore,
    overallScore,
  };
}
