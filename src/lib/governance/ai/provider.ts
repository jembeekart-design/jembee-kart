import type {
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIProvider,
} from "./types";

class LocalAIProvider implements AIProvider {
  async analyze(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    return {
      success: true,

      explanation:
        "Local AI placeholder. External AI provider not connected yet.",

      suggestedCode:
        request.currentCode ??
        "// AI will generate replacement here.",

      confidence: 0.5,
    };
  }
}

export const aiProvider =
  new LocalAIProvider();
