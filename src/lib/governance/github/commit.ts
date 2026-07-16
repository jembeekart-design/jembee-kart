export interface CommitRequest {
  message: string;

  file: string;

  patch: string;
}

export async function createCommit(
  request: CommitRequest
) {
  console.log("Commit Request");

  console.log(request);

  return {
    success: true,
    commitId: crypto.randomUUID(),
  };
}
