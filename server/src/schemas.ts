import { z } from "zod";
export const createCaseSchema = z.object({
  premise: z.string().trim().min(30, "The premise must contain between 30 and 1,000 characters.").max(1000, "The premise must contain between 30 and 1,000 characters."),
  settings: z.object({ difficulty: z.enum(["easy", "medium", "hard"]).default("medium"), theme: z.enum(["any", "theft", "missing_item", "sabotage", "blackmail", "suspicious_death", "custom"]).default("any"), evidenceRichness: z.enum(["standard", "extended"]).default("standard") }).default({})
});
export const accusationSchema = z.object({ suspectId: z.string().min(1).max(80) });
