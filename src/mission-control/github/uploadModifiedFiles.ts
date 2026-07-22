import { githubRequest } from "./githubClient";

export interface ModifiedFile {
  path: string;
  modifiedContent: string;
}

export interface UploadResult {
  success: boolean;
  uploadedFiles: number;
}

async function getFileSha(
  filePath: string,
  branch: string
): Promise<string | undefined> {
  try {
    const file = await githubRequest(
      `/contents/${filePath}?ref=${branch}`
    );

    return file.sha;
  } catch {
    return undefined;
  }
}

export async function uploadModifiedFiles(
  branch: string,
  files: ModifiedFile[]
): Promise<UploadResult> {
  let uploadedFiles = 0;

  for (const file of files) {
    const sha = await getFileSha(file.path, branch);

    const body: Record<string, unknown> = {
      message: `🤖 Mission Control Auto Fix: ${file.path}`,
      content: Buffer.from(file.modifiedContent, "utf8").toString("base64"),
      branch,
    };

    // Existing file update
    if (sha) {
      body.sha = sha;
    }

    await githubRequest(`/contents/${file.path}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    uploadedFiles++;
  }

  return {
    success: true,
    uploadedFiles,
  };
}
