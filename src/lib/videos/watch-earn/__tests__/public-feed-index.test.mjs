import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../../../../", import.meta.url);

test("public video feed has a composite index for all equality filters and createdAt ordering", async () => {
  const indexes = JSON.parse(await readFile(new URL("firestore.indexes.json", root), "utf8"));
  const match = indexes.indexes.find((index) =>
    index.collectionGroup === "watchEarnVideos" &&
    index.queryScope === "COLLECTION" &&
    index.fields.map((field) => field.fieldPath).join(",") ===
      "status,active,moderation,videoAccess,createdAt"
  );
  assert.ok(match, "missing watchEarnVideos public feed composite index");
  assert.deepEqual(
    match.fields.map((field) => field.order),
    ["ASCENDING", "ASCENDING", "ASCENDING", "ASCENDING", "DESCENDING"]
  );
});
