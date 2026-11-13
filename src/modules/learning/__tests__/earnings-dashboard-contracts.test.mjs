import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEarningsDashboard } from "../earnings-dashboard-contracts.ts";
const base = { entryId:"e1", ownerUserId:"user_1", ownerRole:"creator", earningType:"ad_creator_share", amountMinor:3000, currency:"INR", status:"eligible", verified:true, reconciled:true, createdAt:"2026-11-12T10:00:00.000Z" };
const input = (rows, patch={}) => ({ authenticatedUserId:"user_1", rows, ...patch });
test("builds owner-scoped dashboard and omits owner identity from each row", () => {
 const r=buildEarningsDashboard(input([base])); assert.equal(r.rows.length,1); assert.equal(r.rows[0].amountMinor,3000); assert.equal("ownerUserId" in r.rows[0],false); assert.equal(r.summaries[0].eligibleMinor,3000);
});
test("excludes other owners and unverified or unreconciled rows", () => {
 const r=buildEarningsDashboard(input([base,{...base,entryId:"e2",ownerUserId:"other"},{...base,entryId:"e3",verified:false},{...base,entryId:"e4",reconciled:false}])); assert.deepEqual(r.rows.map(x=>x.entryId),["e1"]); assert.equal(r.excludedRows,3);
});
test("enforces role to earning-type mapping", () => { const r=buildEarningsDashboard(input([{...base,ownerRole:"teacher"}])); assert.equal(r.rows.length,0); assert.equal(r.excludedRows,1); });
test("deduplicates ledger entry IDs", () => { const r=buildEarningsDashboard(input([base,{...base,amountMinor:9000}])); assert.equal(r.rows.length,1); assert.equal(r.rows[0].amountMinor,3000); assert.equal(r.excludedRows,1); });
test("keeps currencies separate and calculates status buckets", () => {
 const r=buildEarningsDashboard(input([base,{...base,entryId:"e2",amountMinor:2000,status:"settled"},{...base,entryId:"e3",amountMinor:-500,status:"reversed"},{...base,entryId:"e4",amountMinor:100,currency:"USD",status:"pending"}]));
 const i=r.summaries.find(x=>x.currency==="INR"); assert.equal(r.summaries.length,2); assert.equal(i.eligibleMinor,3000); assert.equal(i.settledMinor,2000); assert.equal(i.reversedMinor,-500); assert.equal(i.netRecordedMinor,4500);
});
test("applies date filters and bounded result limit", () => {
 const r=buildEarningsDashboard(input([base,{...base,entryId:"e2",createdAt:"2026-11-13T10:00:00.000Z"}],{from:"2026-11-12T00:00:00.000Z",to:"2026-11-12T23:59:59.999Z",limit:1})); assert.deepEqual(r.rows.map(x=>x.entryId),["e1"]); assert.equal(r.excludedRows,1); assert.equal(buildEarningsDashboard(input([base],{limit:0})),null);
});
test("rejects invalid identity, dates and oversized input", () => {
 assert.equal(buildEarningsDashboard(input([base],{authenticatedUserId:"../other"})),null); assert.equal(buildEarningsDashboard(input([base],{from:"not-a-date"})),null); assert.equal(buildEarningsDashboard(input([base],{from:"2026-12-01T00:00:00Z",to:"2026-11-01T00:00:00Z"})),null); assert.equal(buildEarningsDashboard(input(Array(501).fill(base))),null);
});
test("excludes malformed money, currency, status and timestamp rows", () => {
 const r=buildEarningsDashboard(input([{...base,entryId:"m",amountMinor:1.25},{...base,entryId:"c",currency:"INR!"},{...base,entryId:"s",status:"paid"},{...base,entryId:"d",createdAt:"yesterday"}])); assert.equal(r.rows.length,0); assert.equal(r.excludedRows,4);
});
