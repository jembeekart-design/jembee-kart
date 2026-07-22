import { githubRequest } from "./githubClient";

export interface ModifiedFile {
  path: string;
  content: string;
}

export async function uploadModifiedFiles(
  branch: string,
  files: ModifiedFile[]
) {
  for (const file of files) {
    await githubRequest(`/contents/${file.path}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `🤖 Auto Fix: ${file.path}`,
        content: Buffer.from(file.content).toString("base64"),
        branch,
      }),
    });
  }

  return {
    success: true,
    modifiedFiles: files.length,
  };
}
