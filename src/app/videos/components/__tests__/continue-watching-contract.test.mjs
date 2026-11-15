import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const player = readFileSync(resolve(here, "../VideoPlayer.tsx"), "utf8");
const page = readFileSync(resolve(here, "../../continue-watching/page.tsx"), "utf8");

test("player saves the current resume position before closing a session", () => {
  assert.match(player, /watch-progress/);
  assert.match(player, /positionSeconds/);
  assert.match(player, /await saveProgress\(sessionId!\)/);
  assert.match(player, /await send\("stop", sessionId!\)/);
});

test("continue watching page loads only the authenticated user's server data", () => {
  assert.match(page, /auth\.currentUser/);
  assert.match(page, /\/api\/shorts\/watch-progress/);
  assert.match(page, /Authorization: `Bearer \$\{token\}`/);
});

test("resume UI does not describe position as verified watch time or rewards", () => {
  assert.match(page, /यह verified watch time या reward eligibility नहीं है/);
  assert.match(page, /Continue Watching/);
});
