import { githubRequest } from "./githubClient";

export interface PullRequestResult {
  success: boolean;
  branch: string;
  pullRequestUrl?: string;
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

  return {
    success: true,
    branch,
    pullRequestUrl: "",
  };
}
