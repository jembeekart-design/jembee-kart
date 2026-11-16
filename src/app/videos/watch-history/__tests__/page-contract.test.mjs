import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const player = await readFile(new URL("../../components/ExoClickVideoPlayer.tsx", import.meta.url), "utf8");
const videosPage = await readFile(new URL("../../page.tsx", import.meta.url), "utf8");

test("viewer watch history page loads only through the authenticated history API", () => {
  assert.match(page, /onAuthStateChanged\(auth/);
  assert.match(page, /\/api\/videos\/watch-history/);
  assert.match(page, /Authorization: `Bearer \$\{token\}`/);
});

test("watch history supports continue, completed, and remove actions", () => {
  assert.match(page, /Continue/);
  assert.match(page, /Watch again/);
  assert.match(page, /method: "DELETE"/);
  assert.match(page, /\/videos\?v=/);
});

test("long-video player stores progress only for authenticated free-video sessions", () => {
  assert.match(player, /videoAccess !== "free"/);
  assert.match(player, /\/api\/videos\/watch-history/);
  assert.match(player, /positionSeconds: video\.currentTime/);
  assert.match(player, /restoreWatchProgress/);
  assert.match(videosPage, /videoId=\{video\.id\}/);
});

test("video library exposes a separate viewer history route", () => {
  assert.match(videosPage, /\/videos\/watch-history/);
});
