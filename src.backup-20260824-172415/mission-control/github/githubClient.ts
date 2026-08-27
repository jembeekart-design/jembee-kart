const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

const BASE_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

export async function githubRequest(
  endpoint: string,
  init?: RequestInit
) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("GitHub API Error:", data);

    throw new Error(
      JSON.stringify(
        {
          status: response.status,
          statusText: response.statusText,
          endpoint,
          error: data,
        },
        null,
        2
      )
    );
  }

  return data;
}
