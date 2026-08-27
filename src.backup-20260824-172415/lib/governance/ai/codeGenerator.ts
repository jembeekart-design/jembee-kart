// src/lib/governance/ai/codeGenerator.ts

import { analyzeIssue } from "./analyzer";
import { buildPrompt } from "./promptBuilder";
import type { AIAnalysisRequest } from "./types";

export async function generateCodeFix(
  request: AIAnalysisRequest
) {
  const prompt = buildPrompt(request);

  console.log("AI Prompt");

  console.log(prompt);

  return analyzeIssue(request);
}
