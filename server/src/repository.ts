import mongoose, { Schema } from "mongoose";
import type { MysteryCase } from "./types.js";

const caseSchema = new Schema({ publicId: { type: String, unique: true, index: true }, status: String, premise: String, settings: Schema.Types.Mixed, title: String, briefing: Schema.Types.Mixed, suspects: [Schema.Types.Mixed], evidence: [Schema.Types.Mixed], timeline: [Schema.Types.Mixed], solution: Schema.Types.Mixed, createdAt: Date, expiresAt: Date, accusation: Schema.Types.Mixed }, { minimize: false });
caseSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const CaseModel = mongoose.models.MysteryCase || mongoose.model("MysteryCase", caseSchema);
const memory = new Map<string, MysteryCase>();
export async function connectDatabase(uri?: string) { if (uri) await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }); }
export async function saveCase(value: MysteryCase) { if (mongoose.connection.readyState === 1) await CaseModel.findOneAndUpdate({ publicId: value.publicId }, value, { upsert: true, new: true }); else memory.set(value.publicId, structuredClone(value)); }
export async function findCase(id: string): Promise<MysteryCase | undefined> { if (mongoose.connection.readyState === 1) { const doc = await CaseModel.findOne({ publicId: id }).lean(); return doc ? doc as unknown as MysteryCase : undefined; } const value = memory.get(id); return value ? structuredClone(value) : undefined; }
export async function saveAccusation(value: MysteryCase) { await saveCase(value); }
export function databaseStatus() { return mongoose.connection.readyState === 1 ? "connected" : "memory-demo"; }
