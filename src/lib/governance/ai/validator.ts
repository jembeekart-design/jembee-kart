import type { AIAnalysisResponse } from "./types";

export function validateAIResponse(
  response: AIAnalysisResponse
) {
  return (
    response.success &&
    response.suggestedCode.length > 0 &&
    response.confidence >= 0.5
  );
}
