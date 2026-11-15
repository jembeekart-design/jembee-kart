import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const player = readFileSync(resolve(here, "../VideoPlayer.tsx"), "utf8");
const feed = readFileSync(resolve(here, "../VerticalVideoFeed.tsx"), "utf8");

test("player starts telemetry only for an active, playing, explicitly eligible video", () => {
  assert.match(player, /if \(!active \|\| !isPlaying \|\| !watchSessionVideoId\) return/);
  assert.match(player, /watchSessionVideoId/);
  assert.match(player, /Authorization: `Bearer \$\{token\}`/);
  assert.match(feed, /watchSessionVideoId=\{video\.videoAccess === "free" \? video\.id : undefined\}/);
});

test("player heartbeats every ten seconds and closes session on cleanup", () => {
  assert.match(player, /setInterval\([\s\S]*?10000\)/);
  assert.match(player, /send\("heartbeat", sessionId\)/);
  assert.match(player, /if \(sessionId\) void send\("stop", sessionId\)/);
  assert.match(player, /clearInterval\(heartbeatTimer\)/);
});

test("player telemetry is not connected to rewards", () => {
  assert.doesNotMatch(player, /createWatchReward|walletBalance|totalCoins|rewardRepository/);
});

test("watch telemetry effect is declared after playback state", () => {
  assert.ok(player.indexOf('const [isPlaying, setIsPlaying] = useState(false)') < player.indexOf("// Server-time telemetry only"));
});
