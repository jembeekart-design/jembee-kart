import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const login = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
const verify = await readFile(new URL("../../verify-email/page.tsx", import.meta.url), "utf8");

test("login accepts only same-origin path redirects and blocks external or auth-loop targets", () => {
  assert.match(login, /function getSafeRedirect/);
  assert.match(login, /target\.origin !== window\.location\.origin/);
  assert.match(login, /target\.pathname/);
  assert.match(login, /startsWith\("\/\/"\)/);
  assert.match(login, /String\.fromCharCode\(92\)/);
});

test("email verification retains the requested destination after successful verification", () => {
  assert.match(login, /verify-email\?redirect=/);
  assert.match(verify, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(verify, /redirectRef\.current = target\.pathname/);
  assert.match(verify, /router\.push\(redirectRef\.current\)/);
  assert.match(verify, /\/login\?redirect=/);
});
