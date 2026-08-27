import type { GitCommit, GitPushResult } from "./types";

export async function pushCommit(
  commit: GitCommit
): Promise<GitPushResult> {
  console.log("Preparing Git Commit", commit);

  return {
    success: false,
    message:
      "GitHub Provider is not connected yet.",
  };
}
