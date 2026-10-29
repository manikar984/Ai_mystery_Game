import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
let server: Server;
let base = "";
before(async () => { process.env.NODE_ENV = "test"; const { default: app } = await import("./app.js"); server = app.listen(0); await new Promise<void>(resolve => server.once("listening", resolve)); const address = server.address(); if (address && typeof address !== "string") base = `http://127.0.0.1:${address.port}/api/v1`; });
after(async () => { if (server) await new Promise<void>(resolve => server.close(() => resolve())); });

describe("case API", () => {
  it("validates premises and settings", async () => {
    const response = await fetch(`${base}/cases`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ premise: "too short" }) });
    assert.equal(response.status, 400);
    const body = await response.json() as { error: { code: string } };
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });

  it("hides the solution, persists a single accusation, and returns the saved reveal", async () => {
    const create = await fetch(`${base}/cases`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ premise: "A rare prototype disappears from a locked design studio during a storm.", settings: { difficulty: "medium", theme: "theft", evidenceRichness: "standard" } }) });
    assert.equal(create.status, 201);
    const created = await create.json() as { caseId: string };
    const publicResponse = await fetch(`${base}/cases/${created.caseId}`);
    const publicBody = await publicResponse.json() as { case: Record<string, unknown> };
    assert.equal("solution" in publicBody.case, false);
    const evidence = publicBody.case.evidence as Record<string, unknown>[];
    assert.equal("clueClass" in evidence[0]!, false);
    const accusation = (suspectId: string) => fetch(`${base}/cases/${created.caseId}/accusations`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ suspectId }) });
    const first = await accusation("suspect_02");
    const firstResult = await first.json() as { result: { score: number; accusedSuspectId: string } };
    assert.equal(first.status, 200);
    assert.equal(firstResult.result.score, 100);
    const repeat = await accusation("suspect_01");
    const repeatResult = await repeat.json() as { result: { score: number; accusedSuspectId: string } };
    assert.equal(repeatResult.result.accusedSuspectId, "suspect_02");
    const saved = await fetch(`${base}/cases/${created.caseId}/result`);
    const savedResult = await saved.json() as { result: { score: number } };
    assert.equal(savedResult.result.score, 100);
  });
});
