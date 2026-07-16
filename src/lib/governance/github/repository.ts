export interface RepositoryConfig {
  owner: string;
  repo: string;
  branch: string;
}

let repository: RepositoryConfig = {
  owner: "",
  repo: "",
  branch: "main",
};

export function setRepository(config: RepositoryConfig) {
  repository = config;
}

export function getRepository() {
  return repository;
}
