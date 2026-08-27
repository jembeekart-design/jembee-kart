export interface GitPatch {
  file: string;
  patch: string;
}

export interface GitCommit {
  message: string;
  author: string;
  patches: GitPatch[];
}

export interface GitPushResult {
  success: boolean;
  commitId?: string;
  branch?: string;
  url?: string;
  message: string;
}
