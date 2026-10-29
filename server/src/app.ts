import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { accusationSchema, createCaseSchema } from "./schemas.js";
import { databaseStatus, findCase, saveAccusation, saveCase } from "./repository.js";
import { generateCase } from "./generator.js";
import type { MysteryCase } from "./types.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));
app.use((req, res, next) => { const id = randomUUID(); res.setHeader("X-Request-Id", id); const started = Date.now(); res.on("finish", () => console.log(JSON.stringify({ timestamp: new Date().toISOString(), severity: "info", requestId: id, route: req.path, status: res.statusCode, durationMs: Date.now() - started }))); next(); });

const attempts = new Map<string, number[]>();
const limitWindow = Number(process.env.RATE_LIMIT_WINDOW_MS || 900000); const limitCount = Number(process.env.RATE_LIMIT_MAX_CASE_CREATIONS || 5);
function publicCase(value: MysteryCase) {
  const { solution: _solution, ...rest } = value;
  return { ...rest, evidence: rest.evidence.map(({ clueClass: _classification, ...item }) => item), hasAccusation: Boolean(value.accusation) };
}
function reveal(value: MysteryCase) {
  const culprit = value.suspects.find(s => s.id === value.solution.culpritSuspectId)!;
  return { result: { isCorrect: value.accusation!.isCorrect, score: value.accusation!.score, accusedSuspectId: value.accusation!.accusedSuspectId, submittedAt: value.accusation!.submittedAt, scoringVersion: value.accusation!.scoringVersion }, reveal: { culprit: { id: culprit.id, name: culprit.name, role: culprit.role, publicProfile: culprit.publicProfile }, motive: value.solution.motive, method: value.solution.method, opportunity: value.solution.opportunity, reconstruction: value.solution.reconstruction, decisiveEvidence: value.solution.decisiveEvidenceIds.map(id => { const evidence = value.evidence.find(e => e.id === id)!; return { id, title: evidence.title, explanation: evidence.content || evidence.description }; }), redHerringExplanation: value.solution.redHerringExplanation } };
}
function sendError(res: express.Response, status: number, code: string, message: string) { return res.status(status).json({ error: { code, message, requestId: res.getHeader("X-Request-Id") } }); }

app.get("/api/v1/health", (_req, res) => res.json({ status: "ok", dependencies: { database: databaseStatus(), ai: process.env.GEMINI_API_KEY ? "configured" : "demo-mode" } }));
app.post("/api/v1/cases", async (req, res, next) => {
  try {
    const parsed = createCaseSchema.parse(req.body); const ip = req.ip || "unknown"; const now = Date.now(); const recent = (attempts.get(ip) || []).filter(t => now - t < limitWindow);
    if (recent.length >= limitCount) return sendError(res, 429, "RATE_LIMITED", "Too many mysteries created. Please try again later.");
    attempts.set(ip, [...recent, now]);
    const value = await generateCase(parsed.premise, parsed.settings); await saveCase(value);
    return res.status(201).json({ caseId: value.publicId, status: "ready", case: publicCase(value) });
  } catch (error) { if (error instanceof ZodError) return sendError(res, 400, "VALIDATION_ERROR", error.issues[0]?.message || "Invalid request."); if ((error as Error).message === "GENERATION_INVALID") return sendError(res, 502, "GENERATION_INVALID", "We couldn't create this mystery right now. Try again."); next(error); }
});
app.get("/api/v1/cases/:caseId", async (req, res, next) => { try { const value = await findCase(req.params.caseId!); if (!value || value.expiresAt.getTime() < Date.now()) return sendError(res, 404, "CASE_UNAVAILABLE", "This mystery is unavailable. Create a new one."); return res.json({ case: publicCase(value) }); } catch (error) { next(error); } });
app.post("/api/v1/cases/:caseId/accusations", async (req, res, next) => { try {
  const input = accusationSchema.parse(req.body); const value = await findCase(req.params.caseId!);
  if (!value || value.expiresAt.getTime() < Date.now()) return sendError(res, 404, "CASE_UNAVAILABLE", "This mystery is unavailable. Create a new one.");
  if (value.status !== "ready") return sendError(res, 409, "CASE_NOT_READY", "Your case is being prepared.");
  if (!value.suspects.some(s => s.id === input.suspectId)) return sendError(res, 400, "INVALID_SUSPECT", "Choose a suspect from this case.");
  if (!value.accusation) { value.accusation = { accusedSuspectId: input.suspectId, isCorrect: input.suspectId === value.solution.culpritSuspectId, score: input.suspectId === value.solution.culpritSuspectId ? 100 : 0, scoringVersion: "1.0", submittedAt: new Date() }; await saveAccusation(value); }
  return res.json(reveal(value));
} catch (error) { if (error instanceof ZodError) return sendError(res, 400, "VALIDATION_ERROR", "A valid suspect is required."); next(error); } });
app.get("/api/v1/cases/:caseId/result", async (req, res, next) => { try { const value = await findCase(req.params.caseId!); if (!value) return sendError(res, 404, "CASE_UNAVAILABLE", "This mystery is unavailable. Create a new one."); if (!value.accusation) return sendError(res, 409, "ACCUSATION_REQUIRED", "Submit your final accusation to reveal the case."); return res.json(reveal(value)); } catch (error) { next(error); } });
app.use((_req, res) => sendError(res, 404, "NOT_FOUND", "That page could not be found."));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => { console.error(JSON.stringify({ severity: "error", message: error instanceof Error ? error.message : "Unknown error" })); return sendError(res, 500, "INTERNAL_ERROR", "Something went wrong. Please try again."); });
export default app;
