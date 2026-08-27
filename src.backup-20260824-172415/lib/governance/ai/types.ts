export interface AIAnalysisRequest {
  scannerId: string;

  file: string;

  line: number;

  problem: string;

  currentCode?: string;
}

export interface AIAnalysisResponse {
  success: boolean;

  explanation: string;

  suggestedCode: string;

  confidence: number;
}

export interface AIProvider {
  analyze(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse>;
}
