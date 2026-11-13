/** Education school-catalog use cases. Persistence is injected through a narrow port. */
import type { CreateSchoolInput, ReviewSchoolInput } from "@/schemas/education/school";

export interface SchoolCatalogRepository {
  createPending(input: CreateSchoolInput, adminUid: string): Promise<{ id: string; created: boolean }>;
  review(input: ReviewSchoolInput, adminUid: string): Promise<void>;
}

export async function submitSchool(
  repository: SchoolCatalogRepository,
  input: CreateSchoolInput,
  adminUid: string,
) {
  if (!adminUid) throw new Error("UNAUTHORIZED");
  return repository.createPending(input, adminUid);
}

export async function reviewSchool(
  repository: SchoolCatalogRepository,
  input: ReviewSchoolInput,
  adminUid: string,
) {
  if (!adminUid) throw new Error("UNAUTHORIZED");
  await repository.review(input, adminUid);
  return { id: input.id, status: input.status };
}
