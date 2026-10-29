AI Mystery Room — Product & Engineering Specification
Document type: Single source of truth for Spec-Driven Development
Status: Initial implementation specification
Version: 1.0.0
Primary consumers: Codex, developers, QA
Product name: AI Mystery Room
Stack: MERN (MongoDB, Express.js, React, Node.js)
AI provider: Google Gemini
Default language: English
Primary experience: A user submits a short scenario or story, the system generates a fictional investigation with evidence, and the user identifies the culprit.
1. Purpose and Source-of-Truth Rules
This document defines the product scope, user experience, architecture, data contracts, API contracts, AI behavior, security requirements, acceptance criteria, and delivery sequence for AI Mystery Room.
Rules for implementation
1. Treat this document as the authoritative product specification.
2. If implementation details conflict with this document, follow this document and update it only when a deliberate product decision is made.
3. Do not silently invent product behavior. For unspecified details, follow the explicit defaults in this document and record material deviations.
4. Build a working end-to-end product, not just static UI mockups.
5. Do not expose Gemini API keys, database credentials, prompts containing server-only instructions, or private server data to the browser.
6. AI-generated investigations are fictional. Never present generated evidence as real-world evidence.
7. Implement and test each milestone before proceeding to the next.
8. Keep API validation, business rules, authorization, and answer evaluation on the server.
9. Any feature not listed as MVP or explicitly required below is out of scope unless approved.
2. Product Summary
AI Mystery Room is an interactive, AI-powered fictional detective game. A user provides a short story, setting, or mystery premise. The backend uses Gemini to create a solvable case containing:
- A case summary and incident.
- A defined cast of suspects.
- A hidden culprit and a consistent motive, method, and timeline.
- Evidence items such as fictional chat messages, witness statements, images, and simulated CCTV clips/stills.
- Clues and red herrings that require the player to compare evidence.
- A final accusation flow, result explanation, and score.
The user reviews the case file, inspects evidence, and selects one suspect as the culprit. The application then reveals whether the accusation is correct and explains the decisive evidence.

Core product promise: Every case must be fictional, internally consistent, evidence-based, and solvable from the evidence provided. The answer must not depend on outside knowledge or information withheld from the player.
3. Goals and Non-Goals
3.1 MVP goals
- Let a visitor create a mystery from a short text premise.
- Generate a complete case using Gemini on the server.
- Validate generated case data before it becomes playable.
- Present suspects and evidence in an immersive, readable investigation workspace.
- Support text evidence, fictional chat logs, image evidence, and simulated CCTV evidence.
- Let the player make one final accusation.
- Reveal the answer with a clear evidence-based explanation.
- Persist cases and game results in MongoDB.
- Handle AI errors, malformed output, rate limits, and loading states gracefully.
- Make the UI responsive and accessible.
3.2 Non-goals for MVP
- Real police investigations, real crime reporting, or real evidence analysis.
- Real WhatsApp, social media, security-camera, or messaging integrations.
- Uploading or analyzing arbitrary user files.
- Multiplayer, live chat, public leaderboards, payments, subscriptions, or user-generated public case sharing.
- Voice calls, live video analysis, or real-time surveillance.
- Guaranteed photorealistic video generation. CCTV can be represented by a generated still image, a simulated clip, or a storyboard-style sequence.
- User accounts are not required for the first MVP. Cases can be accessed through a secure case ID/token. If authentication is added later, it must not be simulated with insecure client-only checks.
4. Target Users and Main User Journey
Primary user
A person who enjoys detective stories, logic puzzles, escape rooms, and interactive mystery games.
Main journey
1. User opens the landing page.
2. User enters a short scenario, selects optional settings, and starts a case.
3. Frontend sends the premise and settings to the backend.
4. Backend validates the request, creates a case-generation job, and calls Gemini.
5. Backend validates and normalizes the returned structured case.
6. Backend creates or obtains the evidence media assets.
7. Case is saved and the user is routed to the case workspace.
8. User reads the briefing, inspects suspects, and opens evidence items.
9. User selects a suspect and submits a final accusation.
10. Backend evaluates the accusation against the stored solution.
11. Frontend displays the result, explanation, decisive clues, and score.
12. User can start another case or revisit the current result.
User-facing states
- Landing / empty input
- Input validation error
- Generating case
- Case generation failed with retry option
- Case workspace loading
- Case workspace ready
- Evidence detail open
- Accusation confirmation
- Result: correct
- Result: incorrect
- Case unavailable / invalid token
- Network error
5. Product Requirements
5.1 Landing page
Must include:
- Product name and concise value proposition.
- Primary call to action: Create a Mystery.
- Scenario/premise text area.
- Character counter and input validation.
- Optional case settings:
  - Difficulty: Easy, Medium, Hard.
  - Theme: Any, Theft, Missing Item, Sabotage, Blackmail, Suspicious Death (fictional, non-graphic), or Custom.
  - Evidence richness: Standard or Extended.
- A clear notice that the experience generates fictional mysteries and synthetic evidence.
- A generation/loading state that prevents accidental duplicate submissions.
Defaults:
- Difficulty: Medium.
- Theme: Any.
- Evidence richness: Standard.
- Premise length: 30–1,000 characters after trimming.
- Reject an empty premise or a premise containing only whitespace.
5.2 Case briefing
Display:
- Case title.
- Case ID or short case reference.
- Incident summary.
- Location and approximate date/time within the fictional world.
- Objective/instructions.
- Difficulty label.
- Suspect count.
- Evidence count.
- Fictional-content notice.
- Navigation to Suspects and Evidence.
Do not display the culprit, hidden solution, private generation metadata, or answer key before the user submits an accusation.
5.3 Suspect board
Each suspect card must show:
- Name.
- Role/relationship to the incident.
- Short public profile.
- Publicly known alibi or statement, where applicable.
- A consistent portrait image if generated media is enabled.
- Button or action to inspect the suspect.
Suspect detail must show:
- Full public profile.
- Statement.
- Relationship to the victim/object/event.
- Evidence links associated with the suspect.
- Any known alibi, including whether the evidence supports, weakens, or does not establish it. Avoid revealing the correct interpretation prematurely.
Suspects must have stable IDs. Evidence references must use IDs, not display names.
5.4 Evidence room
Evidence categories:
- Documents: incident report, note, receipt, access log, or witness statement.
- Chat logs: fictional messaging transcript styled as a generic chat interface. It may be described as “WhatsApp-style” for visual familiarity, but must be labeled as simulated and must not imply it came from the real WhatsApp service.
- Images: AI-generated or placeholder images that are explicitly synthetic.
- CCTV: simulated camera stills, a storyboard sequence, or a short generated clip when technically available. If video generation is not available, use a convincing CCTV-style still or sequence; do not block case creation.
- Timeline: chronological events reconstructed from evidence.
- Forensic/technical records: fictional access records, device logs, or other non-graphic clues.
Each evidence item must include:
- Stable ID.
- Title.
- Evidence type.
- Short description.
- Content or media reference.
- In-world timestamp, if relevant.
- Source/origin within the fictional story.
- Related suspect IDs.
- Clue classification: direct, supporting, red_herring, or context.
- A player-facing caption that does not directly disclose the answer.
- Optional unlock/order metadata, if used.
Evidence interactions:
- Selecting an item opens a detail panel or modal.
- Images open in a larger view with a caption and synthetic-media label.
- Chat evidence is readable and ordered by timestamp.
- CCTV evidence includes a visible “SIMULATED CCTV” label; timestamps and camera IDs are fictional.
- Evidence must be keyboard-accessible and usable on mobile.
- The evidence board should support filtering by category and sorting by time or title.
5.5 Accusation
- User chooses exactly one suspect.
- The submit button remains disabled until a suspect is selected.
- Before submission, show a confirmation step: “Submit final accusation?”
- A case may be accused only once in MVP. The server must enforce this, not just the UI.
- If a repeated submission is received, return the already-recorded result rather than recalculating or changing the outcome.
- The answer evaluation uses the stored culprit ID, not a fresh Gemini call.
- The user must not be able to submit arbitrary culprit IDs that are not part of the case.
5.6 Result screen
Show:
- Correct/incorrect outcome.
- Culprit’s name and profile.
- Motive, method, and opportunity.
- A concise case reconstruction.
- The decisive evidence IDs/titles and how each supports the solution.
- Explanation of important red herrings.
- Score and a brief scoring breakdown.
- Actions: “Play Another Mystery” and “Review Evidence”.
5.7 Scoring
MVP scoring is deterministic:
- Correct accusation: 100 points.
- Incorrect accusation: 0 points.
- Optional evidence exploration bonus: not included in MVP.
- Do not imply that the score measures real investigative skill.
- Store the result and scoring version so later scoring changes do not alter old results.
5.8 Case history
MVP may offer “Recent cases” in the current browser session if case tokens are available. Do not create an insecure global list of all cases. If persisted browser history is implemented, store only public case IDs/tokens and non-sensitive display metadata. Do not store secrets in localStorage.
6. UX and Visual Design
Design direction
A modern detective case-management workspace: dark, cinematic, readable, and restrained. It should feel like an investigation desk rather than a generic admin dashboard.
Visual principles
- Dark neutral base with high-contrast text.
- One accent color for primary actions; use color consistently.
- Clear hierarchy between briefing, suspects, evidence, and final accusation.
- Cards/panels with restrained borders and shadows.
- Subtle transitions only; no distracting animations.
- Use typography optimized for long evidence text.
- Evidence should look distinct by type while remaining readable.
- Keep the synthetic/fictional label visible where evidence media could be mistaken for real material.
- Responsive layout: desktop can use a multi-column case board; mobile uses stacked sections and full-screen detail panels.
Required pages/routes
- / — landing and case creation.
- /case/:caseId — case workspace.
- /case/:caseId/result — result and reveal.
- Unknown route — branded 404 page.
Accessibility
- Semantic HTML and correct heading hierarchy.
- Visible keyboard focus.
- All controls usable with keyboard.
- Inputs have labels and useful error text.
- Do not rely on color alone to communicate evidence type or result.
- Images require descriptive alt text; decorative images use empty alt text.
- Respect reduced-motion preferences.
- Target WCAG 2.1 AA practices for contrast and interaction where practical.
7. Technical Architecture
7.1 Stack
Frontend
- React
- Vite
- React Router
- TypeScript preferred for maintainability
- CSS Modules, Tailwind CSS, or another consistent styling system; choose one and use it throughout
- Fetch or Axios for API calls; do not mix multiple API clients without a reason
Backend
- Node.js
- Express.js
- TypeScript preferred
- Zod (or equivalent schema validator) for request and AI-output validation
- Official Google Gemini SDK or current supported Google Gen AI SDK
- MongoDB with Mongoose or the official MongoDB driver; choose one and use it consistently
Storage
- MongoDB for case data, evidence metadata, status, and result.
- Generated images/videos should be stored in an object store or provider media service in production. For local MVP, a configurable local media directory may be used. Store media URLs/keys in MongoDB, not raw large binary payloads.
- Never assume a Gemini response URL is permanent. If a provider returns temporary media, copy it to configured durable storage before marking the case ready.
7.2 Suggested repository structure
ai-mystery-room/
  client/
    src/
      app/
      components/
      features/
        case-creation/
        case-workspace/
        suspects/
        evidence/
        accusation/
        results/
      lib/
      pages/
      styles/
      types/
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
        ai/
        case-generation/
        media/
        scoring/
      schemas/
      utils/
      app.ts
      server.ts
  shared/
    schemas/
    types/
  tests/
  .env.example
  README.md
  SPEC.md
This is a recommended structure, not a reason to over-engineer the MVP. Shared types/schemas may be placed elsewhere if the repository remains clear.
7.3 Architecture rules
- Frontend never calls Gemini directly.
- Backend owns all AI prompts and generation.
- Backend validates all input and output.
- Generation orchestration is separate from Express route handlers.
- Scoring and culprit evaluation are deterministic server-side functions.
- Database access is kept in model/repository/service layers, not scattered through UI code.
- Use environment variables for secrets and deployment-specific configuration.
- Add request IDs and structured logs, but do not log API keys, full private prompts, or sensitive user content unnecessarily.
8. Data Model
Use MongoDB collections with schema validation. The following is the logical contract; implementation may add operational metadata without changing the public API.
8.1 MysteryCase
type Difficulty = "easy" | "medium" | "hard";
type CaseStatus = "generating" | "ready" | "failed";
type Theme =
  | "any"
  | "theft"
  | "missing_item"
  | "sabotage"
  | "blackmail"
  | "suspicious_death"
  | "custom";

interface MysteryCase {
  _id: ObjectId;
  publicId: string;              // unguessable public identifier; never expose Mongo _id as a security control
  accessTokenHash?: string;      // optional hash if bearer-style access token is used
  status: CaseStatus;
  premise: string;
  settings: {
    difficulty: Difficulty;
    theme: Theme;
    evidenceRichness: "standard" | "extended";
  };
  title: string;
  briefing: {
    summary: string;
    incident: string;
    location: string;
    inWorldDate: string;
    objective: string;
  };
  suspects: Suspect[];
  evidence: Evidence[];
  timeline: TimelineEvent[];
  solution: {
    culpritSuspectId: string;
    motive: string;
    method: string;
    opportunity: string;
    reconstruction: string;
    decisiveEvidenceIds: string[];
    redHerringExplanation: string;
  };
  generation: {
    provider: "gemini";
    model: string;
    promptVersion: string;
    schemaVersion: string;
    attempts: number;
    warnings: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  readyAt?: Date;
  expiresAt?: Date;
}
8.2 Suspect
interface Suspect {
  id: string;                    // unique within case
  name: string;                  // fictional name
  role: string;
  publicProfile: string;
  relationshipToIncident: string;
  statement: string;
  alibi: string;
  portraitMediaId?: string;
}
8.3 Evidence
type EvidenceType =
  | "document"
  | "chat_log"
  | "image"
  | "cctv"
  | "timeline"
  | "technical_record"
  | "witness_statement";

type ClueClass = "direct" | "supporting" | "red_herring" | "context";

interface Evidence {
  id: string;
  title: string;
  type: EvidenceType;
  description: string;
  content?: string;              // text/document/chat content; omit for media-only items
  mediaIds?: string[];
  inWorldTimestamp?: string;
  source: string;
  relatedSuspectIds: string[];
  clueClass: ClueClass;          // do not expose internal clueClass in public API if it reveals answer
  playerCaption: string;
  sortOrder: number;
}
8.4 TimelineEvent
interface TimelineEvent {
  id: string;
  timestamp: string;
  description: string;
  relatedEvidenceIds: string[];
  relatedSuspectIds: string[];
}
8.5 MediaAsset
interface MediaAsset {
  id: string;
  kind: "image" | "video" | "audio" | "placeholder";
  storageKey?: string;
  url?: string;
  mimeType?: string;
  altText: string;
  syntheticLabel: string;        // e.g. "AI-generated fictional evidence"
  provider?: string;
  status: "pending" | "ready" | "failed" | "placeholder";
}
8.6 AccusationResult
interface AccusationResult {
  _id: ObjectId;
  casePublicId: string;
  accusedSuspectId: string;
  isCorrect: boolean;
  score: number;
  scoringVersion: string;
  submittedAt: Date;
  revealedAt: Date;
}
Data constraints
- Suspect IDs and evidence IDs must be unique within each case.
- Every related suspect/evidence ID must refer to an existing item.
- The culprit ID must refer to one of the case’s suspects.
- Every decisive evidence ID must refer to existing evidence.
- The case must contain at least 3 suspects and no more than 6.
- Standard evidence richness: 6–9 evidence items.
- Extended evidence richness: 9–12 evidence items.
- At least 2 evidence items must materially support the correct solution.
- Include at least 1 red herring only if it is fair and later explainable.
- A case cannot become ready until structural and consistency checks pass.
- Never include the solution object in the public case response before accusation.
9. API Contract
Base path: /api/v1

All JSON endpoints use Content-Type: application/json. Responses should use consistent error shapes.
Standard error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The premise must contain between 30 and 1000 characters.",
    "requestId": "req_..."
  }
}
9.1 Create a case
POST /api/v1/cases

Request:
{
  "premise": "A rare prototype disappears from a locked design studio during a storm.",
  "settings": {
    "difficulty": "medium",
    "theme": "theft",
    "evidenceRichness": "standard"
  }
}
Behavior:
- Validate premise length and settings.
- Apply request rate limits.
- Generate a cryptographically strong public ID and optional access token.
- Create a generating record or run the generation flow with a defined timeout.
- Return the generation state or the ready case.
- Do not return solution details.
- Avoid creating multiple cases from duplicate rapid submissions; use an optional idempotency key if practical.
Suggested response:
{
  "caseId": "public-case-id",
  "status": "generating",
  "statusUrl": "/api/v1/cases/public-case-id"
}
If synchronous generation is chosen for the first version, the endpoint may return the ready case directly, but it must have a clear timeout and error strategy. Prefer a status/polling design if generation can take several seconds.
9.2 Get case status/public case
GET /api/v1/cases/:caseId

Returns:
- generating: status only and retry guidance if appropriate.
- ready: public briefing, suspects, evidence, timeline, and media references.
- failed: safe error code and retry action guidance.
Never return solution, culpritSuspectId, internal clue classifications that reveal the answer, raw AI prompts, provider credentials, or internal stack traces.
9.3 Submit accusation
POST /api/v1/cases/:caseId/accusations

Request:
{
  "suspectId": "suspect_02"
}
Behavior:
- Confirm case exists and is ready.
- Confirm suspect ID belongs to that case.
- Enforce one final accusation per case.
- Compare submitted suspect ID with the stored culprit ID.
- Persist result and return the reveal.
- Do not ask Gemini to decide whether the user is correct.
Response:
{
  "result": {
    "isCorrect": false,
    "score": 0,
    "accusedSuspectId": "suspect_02"
  },
  "reveal": {
    "culprit": {
      "id": "suspect_01",
      "name": "Example Name"
    },
    "motive": "...",
    "method": "...",
    "opportunity": "...",
    "reconstruction": "...",
    "decisiveEvidence": [
      {
        "id": "evidence_03",
        "title": "...",
        "explanation": "..."
      }
    ],
    "redHerringExplanation": "..."
  }
}
9.4 Get result
GET /api/v1/cases/:caseId/result
- Return result only after an accusation has been submitted.
- If no accusation exists, return 409 ACCUSATION_REQUIRED.
- If the case has an access token, require it or a suitable session authorization.
- Avoid exposing solution data through the ordinary case endpoint.
9.5 Health check
GET /api/v1/health
- Returns service status and non-sensitive dependency status.
- Must not expose environment variables, secrets, database URIs, or detailed infrastructure.
HTTP status guidance
- 200 success
- 201 resource created, when creation is synchronous
- 202 generation accepted and still running
- 400 invalid request
- 401 missing/invalid case access token where required
- 404 case not found
- 409 case not ready, accusation already submitted, or accusation required
- 413 payload too large
- 429 rate limit exceeded
- 502 AI provider returned invalid/unusable output
- 503 provider temporarily unavailable
- 500 unexpected internal error
10. Gemini Integration and Generation Pipeline
10.1 Core rule
Gemini creates the fictional case content, but the application—not the model—controls validation, access, scoring, and persistence.
10.2 Pipeline
1. Validate and normalize the premise.
2. Apply moderation/safety checks and rate limits.
3. Create a generation record with status generating.
4. Build a server-side prompt from the premise and settings.
5. Request structured JSON output using the current supported Gemini SDK/schema features.
6. Parse JSON; do not trust free-form markdown around the JSON.
7. Validate against a strict runtime schema.
8. Run consistency checks.
9. If validation fails, retry with a repair prompt a limited number of times (maximum 2 repair attempts after the first generation).
10. If still invalid, mark the case failed and return a safe error.
11. Generate or assign media assets.
12. Validate all media references and labels.
13. Persist the final case with status ready.
14. Return only the public case representation.
10.3 AI output requirements
The model must return structured data for:
- title
- briefing
- suspects
- evidence
- timeline
- solution
Use a strict JSON schema or equivalent structured output mode when supported. Never rely on the model to follow formatting instructions alone.
10.4 Case-writing prompt requirements
The server-side system instruction should require Gemini to:
- Produce a fictional detective mystery based only on the user’s premise and settings.
- Keep the mystery fair, coherent, and solvable from the supplied evidence.
- Use fictional people, organizations, locations, and identifiers.
- Choose exactly one culprit.
- Ensure the culprit, motive, method, opportunity, timeline, statements, and evidence agree.
- Provide at least two independent clues supporting the solution.
- Include red herrings only when they are plausible and do not contradict the true solution.
- Avoid revealing the culprit in public-facing briefing, suspect descriptions, evidence titles, captions, or public content.
- Avoid graphic detail and gratuitous violence.
- Avoid real personal data, real private individuals, and claims that generated evidence is authentic.
- Use clear language suitable for a general audience.
- Use the requested difficulty to tune clue subtlety, not to make the solution arbitrary.
- Return only schema-compliant structured output.
10.5 Difficulty definitions
- Easy: obvious but not explicitly stated clues; 3–4 suspects; straightforward timeline.
- Medium: 4–5 suspects; multiple evidence sources must be cross-referenced; at least one plausible red herring.
- Hard: 5–6 suspects; contradictions and timing details require careful comparison; still solvable without guessing.
10.6 Consistency validation
Implement deterministic checks where possible:
- Exactly one culprit ID and it maps to a suspect.
- All referenced IDs exist.
- Timestamps parse when supplied and can be ordered.
- Evidence count is within selected richness range.
- At least two decisive clues exist and each refers to an evidence item.
- The solution explanation references evidence that actually exists.
- Public text does not directly state the culprit or solution.
- Suspect statements and alibis do not make the timeline impossible unless that contradiction is intentionally supported by evidence.
- No missing required fields or unexpected enum values.
- Reject duplicate IDs and broken media references.
Some semantic checks require an additional model review. If used, treat it as a quality-control step, not as the authority for scoring. Keep review calls bounded to control cost and latency.
10.7 AI failures and cost control
- Use timeouts and a limited retry policy.
- Respect provider rate limits and handle quota exhaustion.
- Do not loop indefinitely on malformed output.
- Set configurable maximum premise size, output token budget, and media budget.
- Cache no private prompt data across users unless explicitly designed and safe.
- Record model name and prompt/schema version for debugging.
- Do not log API keys or full provider headers.
- If image/video generation is unavailable, use clearly labeled synthetic placeholder assets and continue with a playable case.
- Make the UI communicate generation progress without inventing precise percentage completion.
10.8 Model selection
Use a current Gemini model available to the configured API key that supports the required structured output and text quality. The model name must come from environment configuration, not be hard-coded in many files. Document the exact model selected in .env.example/README and verify it against current Google documentation during implementation.
11. Synthetic Evidence and Media Generation
11.1 MVP media strategy
Text-based evidence is mandatory. Image and CCTV-style evidence are supported through an abstract media service so the app remains playable even without a video-generation provider.

Suggested order:
1. Generate case structure and text evidence.
2. Generate suspect portraits and selected scene images if an image generation provider is configured.
3. Generate CCTV-style stills or storyboard frames for relevant evidence.
4. Use a placeholder when media generation fails.
5. Mark all generated or simulated media clearly as fictional.
11.2 Media service interface
Create a provider-independent interface similar to:
interface MediaGenerationService {
  generateImage(input: {
    prompt: string;
    altText: string;
    syntheticLabel: string;
  }): Promise<MediaAsset>;

  generateCctvEvidence(input: {
    prompt: string;
    altText: string;
    syntheticLabel: string;
  }): Promise<MediaAsset[]>;
}
The interface may have an implementation that returns placeholders when no provider is configured. Do not couple core case generation directly to one image/video vendor.
11.3 Media safety and truthfulness
- Every generated image/video must be labeled as synthetic/fictional.
- Never use actual private individuals’ images as suspects.
- Do not create evidence intended to impersonate a real person, prove a real crime, or mislead a real investigation.
- Use fictional dates, locations, camera labels, and sender names.
- Avoid real WhatsApp branding/assets unless legally approved; a generic chat UI is sufficient.
- Do not claim an image or clip is real CCTV footage.
- Strip unnecessary metadata from generated media where feasible.
- Validate file type, size, and content type before storing uploaded or provider-returned media.
12. Security, Privacy, and Abuse Prevention
Required controls
- Store secrets only in server environment variables or a secret manager.
- Configure CORS for known frontend origins in production.
- Use Helmet or equivalent secure HTTP headers.
- Rate-limit case creation and accusation endpoints by IP/session.
- Validate and sanitize all request data.
- Enforce request body size limits.
- Use cryptographically secure public IDs and tokens; store token hashes if tokens are persisted.
- Avoid exposing sequential database IDs as authorization.
- Prevent MongoDB operator injection by validating typed input and never passing raw user objects directly into database queries.
- Use parameterized/structured database operations.
- Never trust client-provided score, correctness, culprit ID, or case status.
- Keep error messages safe; log technical details only on the server.
- Use HTTPS in production.
- Configure database network access and credentials with least privilege.
- Define retention/expiration for abandoned cases; default retention may be 30 days and must be configurable.
- Do not collect unnecessary personal information.
- Provide a privacy notice explaining that user-provided premises are sent to Gemini for case generation.
- Do not include sensitive personal details in AI prompts or generated cases.
- Add safeguards against prompt injection in user premises: treat the premise as story content, never as instructions to reveal system prompts, credentials, or server data.
Abuse and content policy
- This is fictional entertainment, not a tool for accusing real people.
- If a premise names a real private individual or frames the generated result as proof of their wrongdoing, transform names to fictional characters or reject the request with a safe message.
- Avoid instructions that enable real-world harm, evasion, stalking, or evidence fabrication for actual legal proceedings.
- Fictional crime themes may be used in a non-graphic puzzle context, but generated content must remain clearly fictional.
13. Frontend State and Error Handling
State rules
- Keep the case ID in the route.
- Fetch the case from the API; do not rely on in-memory data surviving refresh.
- Represent loading, ready, failed, and unavailable states explicitly.
- Avoid showing hidden solution fields in client state before accusation.
- Disable repeated submit actions while requests are in flight.
- Use a shared API error handler and display user-safe messages.
- Use optimistic UI only where it cannot corrupt game state.
Error messages
- Invalid premise: “Enter a scenario between 30 and 1,000 characters.”
- Generation failed: “We couldn’t create this mystery right now. Try again.”
- Case still generating: “Your case is being prepared.”
- Case not found/expired: “This mystery is unavailable. Create a new one.”
- Accusation already submitted: display the saved result; do not allow a second guess.
- Network issue: “Connection problem. Check your internet and retry.”
14. Environment Configuration
Create .env.example with documented placeholders only. Never commit a real .env file.

Suggested server variables:
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/ai-mystery-room
GEMINI_API_KEY=
GEMINI_MODEL=
CASE_ACCESS_TOKEN_SECRET=
CASE_RETENTION_DAYS=30
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_CASE_CREATIONS=5
MEDIA_STORAGE_MODE=local
MEDIA_STORAGE_PATH=./storage/media
PUBLIC_MEDIA_BASE_URL=http://localhost:5000/media
Notes:
- GEMINI_MODEL must be set to a currently supported model.
- Production media storage must use durable object storage or an equivalent managed service.
- Do not use the development fallback secrets in production.
- The frontend should have only non-secret variables such as VITE_API_BASE_URL.
- If a separate image/video provider is configured later, add its credentials as server-only variables and document them.
15. Testing Requirements
Unit tests
- Premise validation.
- Request schema validation.
- AI JSON parsing and schema validation.
- ID/reference consistency checks.
- Case public serializer removes the solution and internal clue metadata.
- Scoring returns 100 for the stored culprit and 0 for other valid suspects.
- Duplicate accusation behavior returns the original result.
- Access token verification.
- Rate-limit and error mapping helpers where practical.
Integration tests
- Create a case using a mocked Gemini service.
- Handle malformed Gemini JSON and retry exhaustion.
- Case remains unavailable until validation succeeds.
- Fetching a ready case does not expose the solution.
- Invalid suspect ID is rejected.
- Valid accusation persists the result.
- Result endpoint blocks access before accusation.
- Expired/unknown case returns a safe 404/410-style response.
- Media provider failure falls back to a placeholder and does not make the case unplayable.
Frontend tests
- Premise form validation.
- Loading and failure states.
- Suspect selection and confirmation.
- Evidence category filters.
- Result screen for correct and incorrect accusations.
- Responsive navigation and evidence detail interactions.
End-to-end smoke flow
1. Open landing page.
2. Enter a valid premise and create a case.
3. Wait until status is ready.
4. Open case workspace.
5. Inspect at least one suspect and one evidence item.
6. Submit an accusation.
7. Confirm the result and explanation appear.
8. Refresh the result page and verify the saved result is consistent.
Test constraints
- Automated tests must not require a live Gemini API key by default.
- Use mocked AI/media providers in CI.
- Provide an optional integration test command for developers who configure real credentials.
- Do not use real personal data in fixtures.
16. Observability and Operational Requirements
- Structured server logs with timestamp, severity, request ID, route, status code, and duration.
- Track generation success/failure, retry count, generation latency, media fallback rate, and API error rates without logging secrets.
- Add a health endpoint.
- Use graceful shutdown for the Express server and database connection.
- Set timeouts on external provider calls.
- Avoid returning stack traces to the client.
- Record a case generation failure reason internally using safe error categories.
- Make model and prompt/schema versions traceable per case.
17. Performance and Reliability Targets
These are engineering targets, not promises about third-party provider latency:
- Initial page should render without waiting for Gemini.
- Case generation should be asynchronous or have a clear timeout and retry UX.
- API requests unrelated to generation should return promptly under normal local/development conditions.
- Evidence images should be lazy-loaded where appropriate.
- Use pagination only if case history becomes large; a single case has a bounded number of evidence items.
- A provider outage must not crash the entire server.
- Media failure must not prevent the core text mystery from being playable.
- Avoid repeated full-case generation on refresh.
18. Definition of Done
The MVP is done only when:
- A user can create a case from a valid premise.
- Gemini is called only from the backend.
- AI output is schema-validated and consistency-checked.
- At least 3 suspects and the required evidence set are present.
- Case content persists in MongoDB.
- The user can inspect the briefing, suspects, timeline, and evidence.
- Synthetic media is labeled and has a fallback path.
- The user can submit one accusation.
- Correctness is evaluated deterministically by the server.
- The result includes a coherent reveal and evidence-based reasoning.
- Public case responses do not expose the solution before accusation.
- All core tests pass.
- .env.example, setup instructions, and run scripts exist.
- No secrets are committed.
- The app has usable loading, empty, error, and mobile states.
19. Implementation Milestones
Milestone 1 — Foundation
- Create repository structure and TypeScript setup.
- Configure React/Vite, Express, MongoDB, linting, formatting, and tests.
- Add environment validation and health endpoint.
- Add shared schemas/types.
Exit criteria: frontend and backend start locally; MongoDB connection is verified; health endpoint works.
Milestone 2 — Case generation
- Implement Gemini service abstraction.
- Build strict case-generation prompt and structured output schema.
- Implement validation, consistency checks, retries, and safe failure handling.
- Persist case status and content.
Exit criteria: mocked tests pass; optional live Gemini generation creates a valid case.
Milestone 3 — Case workspace
- Build landing form and creation/loading state.
- Build case briefing, suspect board, evidence room, and timeline.
- Add evidence filters and detail panels.
- Ensure public serializer hides solution fields.
Exit criteria: a ready case can be explored from the browser and after refresh.
Milestone 4 — Accusation and reveal
- Implement suspect selection and confirmation.
- Add server-side single-attempt enforcement and deterministic scoring.
- Build result/reveal UI and saved result endpoint.
Exit criteria: correct and incorrect accusation flows pass integration tests.
Milestone 5 — Media and polish
- Add media service abstraction, synthetic labels, and placeholders.
- Improve responsive layout, accessibility, loading, and error states.
- Add request logging, rate limiting, security headers, and retention cleanup.
Exit criteria: core experience remains playable when media generation fails.
Milestone 6 — Release readiness
- Run unit, integration, frontend, and end-to-end smoke tests.
- Review privacy/security requirements.
- Write README setup/deployment guide.
- Verify production environment variables and CORS.
- Document known limitations.
Exit criteria: a new developer can set up the project from the README and run the app without undocumented steps.
20. Codex Execution Instructions
When implementing from this specification:
1. Inspect the existing repository before creating or replacing files.
2. If the repository already contains code, preserve working functionality and identify gaps against this spec before editing.
3. Start by reporting the detected structure and a concise implementation plan.
4. Implement one milestone at a time, keeping the app runnable.
5. Before adding a dependency, verify that it is needed and compatible with the existing setup.
6. Never hard-code secrets or invent API keys.
7. Add tests alongside business logic, especially for validation, solution privacy, and accusation evaluation.
8. Run the available lint, type-check, test, and build commands after meaningful changes.
9. Fix errors caused by your changes before moving on.
10. If a required external credential is missing, implement the integration boundary and mocked tests; clearly document what cannot be verified live.
11. Do not claim that Gemini generation or media generation works live unless it has actually been tested with configured credentials.
12. Keep this SPEC.md updated only when an approved product decision changes requirements.
21. Decisions and Explicit Defaults
These defaults remove ambiguity for the initial build:
- Product name: AI Mystery Room.
- Backend: Express + Node.js + TypeScript.
- Frontend: React + Vite + TypeScript.
- Database: MongoDB.
- AI: Gemini via a server-side SDK.
- Authentication: no account system in MVP; use unguessable case IDs and, where needed, an access token.
- Case generation: status-based flow preferred; polling is acceptable for MVP.
- Accusations: one final accusation per case.
- Scoring: 100 for correct, 0 for incorrect.
- Evidence: 6–9 standard, 9–12 extended.
- Suspects: 3–6 based on difficulty.
- Images/video: provider-independent media service with placeholders as fallback.
- Media truthfulness: generated assets are always labeled fictional/synthetic.
- Retention: 30 days by default, configurable.
- UI: dark, cinematic, accessible, responsive.
- Language: English for MVP.
- No real-world evidence analysis, real messaging integrations, multiplayer, or payments in MVP.
22. Final Product Acceptance Checklist
- [ ] Landing page explains the product and fictional nature of generated evidence.
- [ ] User can enter a valid premise and select optional settings.
- [ ] Invalid premise is rejected with a useful message.
- [ ] Server generates and validates a case using Gemini.
- [ ] Case contains a coherent briefing, 3–6 suspects, timeline, and evidence.
- [ ] At least two decisive clues support the actual culprit.
- [ ] Evidence references are valid and all content is consistent.
- [ ] Case can be refreshed and retrieved from MongoDB.
- [ ] Case endpoint never leaks the hidden solution before accusation.
- [ ] Evidence room supports text, chat, images, and simulated CCTV-style evidence.
- [ ] Every synthetic media item is clearly labeled.
- [ ] Media failure falls back safely without breaking gameplay.
- [ ] User can submit one valid suspect accusation.
- [ ] Invalid or repeated accusations are handled correctly.
- [ ] Server determines the result from stored solution data.
- [ ] Result explains motive, method, opportunity, decisive clues, and red herrings.
- [ ] Unit, integration, and end-to-end smoke tests pass.
- [ ] Rate limiting, validation, security headers, and safe errors are implemented.
- [ ] .env.example and README are complete.
- [ ] No secrets or real personal data are committed.
End of specification.