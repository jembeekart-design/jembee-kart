import type {
  PatchFile,
  PatchResult,
} from "./types";

export function generatePatch(
  patch: PatchFile
): PatchResult {
  const diff = [
    `--- ${patch.file}`,
    `+++ ${patch.file}`,
    `@@ Line ${patch.lineStart} @@`,
    patch.oldCode,
    "----------------------",
    patch.newCode,
  ].join("\n");

  return {
    success: true,
    diff,
    file: patch.file,
  };
}
