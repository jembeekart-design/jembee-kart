import { GovernanceViolation } from "../types/governance.types";

export function deduplicateViolations(
  violations: GovernanceViolation[]
): GovernanceViolation[] {
  const seen = new Set<string>();

  return violations.filter((violation) => {
    const key = [
      violation.filePath || "",
      violation.category || "",
      violation.title || "",
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
