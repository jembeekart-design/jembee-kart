export interface GovernanceScoreInput {
  architectureViolations: number;
  securityViolations: number;
  themeViolations: number;
  adminControlViolations: number;
  profitabilityViolations: number;
  deploymentViolations: number;
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
const deploymentScore =
  calculateCategoryScore(
    input.deploymentViolations,
    2
  );
  const overallScore = Math.round(
    (
  architectureScore +
  securityScore +
  themeScore +
  adminControlScore +
  profitabilityScore +
  deploymentScore
) / 6
  );

  return {
  overall: overallScore,
  architecture: architectureScore,
  security: securityScore,
  profitability: profitabilityScore,
  theme: themeScore,

  firestore: 100,
  adminControl: adminControlScore,
  duplicateCode: 100,
  hardcodedRule: 100,
  pageConnection: 100,
  deployment: deploymentScore,
  performance: 100,
  scalability: 100,
  compliance: 100,
};
}
