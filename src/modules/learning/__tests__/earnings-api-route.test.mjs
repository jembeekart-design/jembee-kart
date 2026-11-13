import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../");
const route = readFileSync(resolve(root, "src/app/api/creator/earnings/route.ts"), "utf8");
test("earnings endpoint verifies Firebase token and checks revocation before response", () => {
 assert.match(route,/extractEarningsBearerToken/);
 assert.match(route,/verifyIdToken\(token, true\)/);
 assert.ok(route.indexOf("verifyIdToken") < route.indexOf("EARNINGS_LEDGER_NOT_CONFIGURED"));
});
test("earnings endpoint fails closed until canonical ledger repository exists", () => {
 assert.match(route,/status: 503/);
 assert.match(route,/EARNINGS_LEDGER_NOT_CONFIGURED/);
 assert.doesNotMatch(route,/monetagEarnings|monetagPayments/);
});
test("earnings endpoint prevents shared caching", () => { assert.match(route,/Cache-Control/); assert.match(route,/no-store/); });
