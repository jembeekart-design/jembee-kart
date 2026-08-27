import { aiProvider } from "./provider";
import type { AIAnalysisRequest } from "./types";

export async function analyzeIssue(
  request: AIAnalysisRequest
) {
  return aiProvider.analyze(request);
}
