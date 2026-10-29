export type Difficulty = "easy" | "medium" | "hard";
export type Theme = "any" | "theft" | "missing_item" | "sabotage" | "blackmail" | "suspicious_death" | "custom";
export type EvidenceType = "document" | "chat_log" | "image" | "cctv" | "timeline" | "technical_record" | "witness_statement";
export interface Suspect { id: string; name: string; role: string; publicProfile: string; relationshipToIncident: string; statement: string; alibi: string; }
export interface Evidence { id: string; title: string; type: EvidenceType; description: string; content?: string; inWorldTimestamp?: string; source: string; relatedSuspectIds: string[]; clueClass: "direct" | "supporting" | "red_herring" | "context"; playerCaption: string; sortOrder: number; }
export interface MysteryCase {
  publicId: string; status: "ready" | "failed"; premise: string; settings: { difficulty: Difficulty; theme: Theme; evidenceRichness: "standard" | "extended" };
  title: string; briefing: { summary: string; incident: string; location: string; inWorldDate: string; objective: string };
  suspects: Suspect[]; evidence: Evidence[]; timeline: { id: string; timestamp: string; description: string; relatedEvidenceIds: string[]; relatedSuspectIds: string[] }[];
  solution: { culpritSuspectId: string; motive: string; method: string; opportunity: string; reconstruction: string; decisiveEvidenceIds: string[]; redHerringExplanation: string };
  createdAt: Date; expiresAt: Date;
  accusation?: { accusedSuspectId: string; isCorrect: boolean; score: number; scoringVersion: string; submittedAt: Date };
}
