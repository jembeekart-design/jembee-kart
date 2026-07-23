export interface AstFixResult {
  success: boolean;
  modifiedFiles: number;
  message: string;
}

export async function previewAstFix(): Promise<AstFixResult> {
  return {
    success: true,
    modifiedFiles: 0,
    message: "AST Auto Fix preview is not implemented yet.",
  };
}

export async function applyAstFix(): Promise<AstFixResult> {
  return {
    success: false,
    modifiedFiles: 0,
    message: "AST Auto Fix is not implemented yet.",
  };
}
