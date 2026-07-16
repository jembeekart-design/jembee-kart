// src/lib/governance/ai/promptBuilder.ts

import type { AIAnalysisRequest } from "./types";

export function buildPrompt(
  request: AIAnalysisRequest
): string {
  return `
You are JembeeKart Governance AI.

Your job is to generate safe TypeScript fixes.

Rules:

1. Never change business logic.
2. Never hardcode values.
3. Use Firestore settings whenever possible.
4. Keep Next.js compatible.
5. Keep TypeScript strict.
6. Do not remove existing functionality.
7. Follow JembeeKart Governance Architecture.

Scanner:
${request.scannerId}

File:
${request.file}

Line:
${request.line}

Problem:
${request.problem}

Current Code:
${request.currentCode ?? "Not Provided"}

Return:

Explanation

Suggested Code

Confidence
`;
}
