import { githubRequest } from "./githubClient";
import { uploadModifiedFiles } from "./uploadModifiedFiles";
import { getAutoFixFiles } from "@/mission-control/autofix";

export interface PullRequestResult {
  success: boolean;
  branch: string;
  pullRequestUrl?: string;
  uploadedFiles?: number;
  themeFiles?: number;
  ruleFiles?: number;
}

export async function createPullRequest(): Promise<PullRequestResult> {
  const branch = `autofix-${Date.now()}`;

  // Get latest commit of main
  const main = await githubRequest("/git/ref/heads/main");

  // Create new branch
  await githubRequest("/git/refs", {
    method: "POST",
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: main.object.sha,
    }),
  });

  // Generate all Auto Fix files
  const {
    files,
    themeFiles,
    ruleFiles,
    totalFiles,
  } = await getAutoFixFiles();

  if (totalFiles === 0) {
    throw new Error("No files require auto fix.");
  }

  // Upload modified files
  const upload = await uploadModifiedFiles(branch, files);

  // Create Pull Request
  const pr = await githubRequest("/pulls", {
    method: "POST",
    body: JSON.stringify({
      title: "🤖 Mission Control Auto Fix",
      head: branch,
      base: "main",
      body: `# 🤖 Mission Control Auto Fix

This Pull Request was generated automatically.

## Summary

- Theme Fixes: ${themeFiles}
- Hardcoded Rule Fixes: ${ruleFiles}
- Total Modified Files: ${upload.uploadedFiles}

### Completed

- Theme Color Auto Fix
- Hardcoded Business Rule Auto Fix
- Ready for Review

Generated automatically by Mission Control.
`,
    }),
  });

  return {
    success: true,
    branch,
    uploadedFiles: upload.uploadedFiles,
    themeFiles,
    ruleFiles,
    pullRequestUrl: pr.html_url,
  };
}
