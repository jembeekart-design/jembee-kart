export interface PatchFile {
  file: string;
  oldCode: string;
  newCode: string;

  lineStart: number;
  lineEnd?: number;
}

export interface PatchResult {
  success: boolean;
  diff: string;
  file: string;
}
