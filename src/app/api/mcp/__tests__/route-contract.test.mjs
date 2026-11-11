import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("MCP endpoint advertises per-tool OAuth and linking challenge metadata", async () => {
  const route = await read("src/app/api/mcp/route.ts");
  assert.match(route, /securitySchemes:\s*\[\{\s*type:\s*"oauth2",\s*scopes:\s*\[scope\]\s*\}\]/);
  assert.match(route, /mcp\/www_authenticate/);
  assert.match(route, /oauth-protected-resource/);
  assert.match(route, /MCP-Protocol-Version/);
});

test("OAuth discovery uses canonical origin, CIMD, issuer binding and PKCE S256", async () => {
  const authorization = await read("src/app/.well-known/oauth-authorization-server/route.ts");
  const protectedResource = await read("src/app/.well-known/oauth-protected-resource/route.ts");
  const security = await read("src/lib/mcp/security.ts");
  assert.match(authorization, /client_id_metadata_document_supported:\s*true/);
  assert.match(authorization, /authorization_response_iss_parameter_supported:\s*true/);
  assert.match(authorization, /code_challenge_methods_supported:\s*\["S256"\]/);
  assert.match(authorization, /token_endpoint_auth_methods_supported:\s*\["none"\]/);
  assert.match(protectedResource, /resource,/);
  assert.match(security, /metadata\.client_id !== clientId/);
  assert.match(security, /grantTypes\.includes\("authorization_code"\)/);
  assert.match(security, /responseTypes\.includes\("code"\)/);
  assert.match(security, /verifyPkceS256/);
  assert.match(security, /offline_access/);
  assert.match(security, /return getMcpBaseUrl\(\);/);
});

test("ChatGPT client metadata and callback are allowlisted, redirects are not followed", async () => {
  const security = await read("src/lib/mcp/security.ts");
  assert.match(security, /clientUrl\.origin !== "https:\/\/chatgpt\.com"/);
  assert.match(security, /redirect:\s*"error"/);
  assert.match(security, /connector_platform_oauth_redirect/);
  assert.match(security, /connector/);
});

test("MCP exposes only read-only approved-video and own-upload tools", async () => {
  const route = await read("src/app/api/mcp/route.ts");
  assert.match(route, /jembee_list_approved_videos/);
  assert.match(route, /jembee_get_approved_video/);
  assert.match(route, /jembee_get_my_upload_status/);
  assert.match(route, /data\.status === "approved"/);
  assert.match(route, /data\.active === true/);
  assert.match(route, /data\.moderation === "safe"/);
  assert.match(route, /data\.videoAccess === "free"/);
  assert.doesNotMatch(route, /name:\s*"jembee_(?:delete|approve|upload|payout|settlement)/i);
  assert.match(route, /where\("creatorId",\s*"==",\s*identity\.uid\)/);
});

test("Admin switch invalidates outstanding tokens", async () => {
  const settings = await read("src/app/api/admin/mcp/settings/route.ts");
  assert.match(settings, /verifyAdminRequest/);
  assert.match(settings, /tokenEpoch:\s*changed \? previousEpoch \+ 1 : previousEpoch/);
  assert.match(settings, /MCP_SERVER_BASE_URL/);
});

test("OAuth consent returns a state- and issuer-bound callback and creates short-lived one-use codes", async () => {
  const consent = await read("src/app/api/mcp/oauth/consent/route.ts");
  assert.match(consent, /callback\.searchParams\.set\("iss",\s*base\)/);
  assert.match(consent, /callback\.searchParams\.set\("state",\s*state\)/);
  assert.match(consent, /expiresAtMs:\s*Date\.now\(\) \+ 5 \* 60 \* 1000/);
  assert.match(consent, /createHash\("sha256"\)/);
  assert.match(consent, /verifyFirebaseAdminToken/);
});

test("OAuth token exchange enforces the resource, PKCE, one-time codes, rotation and revocation", async () => {
  const token = await read("src/app/oauth/token/route.ts");
  const revoke = await read("src/app/oauth/revoke/route.ts");
  assert.match(token, /resource !== expectedResource/);
  assert.match(token, /verifyPkceS256/);
  assert.match(token, /tx\.delete\(codeRef\)/);
  assert.match(token, /REFRESH_TTL_MS/);
  assert.match(token, /tx\.delete\(refreshRef\)/);
  assert.match(revoke, /where\("familyId",\s*"==",\s*familyId\)/);
});
