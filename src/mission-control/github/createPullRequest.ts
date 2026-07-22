export interface PullRequestResult {
  success: boolean;
  branch: string;
  pullRequestUrl?: string;
}

export async function createPullRequest() {
  // TODO:
  // GitHub REST API

  return {
    success: true,
    branch: `autofix-${Date.now()}`,
    pullRequestUrl: "",
  } satisfies PullRequestResult;
}
