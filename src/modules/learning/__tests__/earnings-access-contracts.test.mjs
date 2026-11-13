import { test } from "node:test";
import assert from "node:assert/strict";
import { extractEarningsBearerToken, authorizeEarningsPrincipal, isSelfEarningsRequest } from "../earnings-access-contracts.ts";

test("extracts bounded bearer tokens only", () => {
 assert.equal(extractEarningsBearerToken("Bearer abc.def"),"abc.def");
 for (const h of [null,"Basic abc","Bearer ","Bearer abc def","Bearer "+"x".repeat(8193),"Bearer "+"x".repeat(8300)]) assert.equal(extractEarningsBearerToken(h),null);
});
test("requires trusted creator role and explicit creator enablement", () => {
 assert.deepEqual(authorizeEarningsPrincipal({authenticatedUid:"u1",accountRole:"creator",creatorEnabled:true}),{ok:true,principal:{uid:"u1",role:"creator"}});
 assert.equal(authorizeEarningsPrincipal({authenticatedUid:"u1",accountRole:"creator"}).ok,false);
});
test("requires explicit sharer enablement and verified teacher status", () => {
 assert.equal(authorizeEarningsPrincipal({authenticatedUid:"u1",accountRole:"sharer",sharerEnabled:true}).ok,true);
 assert.equal(authorizeEarningsPrincipal({authenticatedUid:"u1",accountRole:"teacher",teacherVerified:true}).ok,true);
 assert.equal(authorizeEarningsPrincipal({authenticatedUid:"u1",accountRole:"teacher",teacherVerified:false}).ok,false);
});
test("denies unsupported roles and malformed identities", () => {
 assert.equal(authorizeEarningsPrincipal({authenticatedUid:"../x",accountRole:"creator",creatorEnabled:true}).status,401);
 assert.equal(authorizeEarningsPrincipal({authenticatedUid:"u1",accountRole:"admin"}).status,403);
});
test("requested uid can never override verified token subject", () => {
 assert.equal(isSelfEarningsRequest("u1"),true);
 assert.equal(isSelfEarningsRequest("u1","u1"),true);
 assert.equal(isSelfEarningsRequest("u1","u2"),false);
 assert.equal(isSelfEarningsRequest("../u","../u"),false);
});
