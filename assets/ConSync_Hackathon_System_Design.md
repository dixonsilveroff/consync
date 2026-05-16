**ConSync**

Hackathon MVP — Full System Design

*Squad Hackathon 3.0  |  Challenge 01: Proof of Life*

Next.js \+ TypeScript  ·  Clerk  ·  Convex  ·  Google Vertex AI (Gemini)  ·  Squad API

## **1\. System Overview & Context**

### **1.1 What We Are Building**

ConSync is an AI-powered construction milestone verification and conditional payment release platform. For the Squad Hackathon 3.0 MVP, we are building a trimmed, fully working version that demonstrates the core trust loop:

\> A project owner (diaspora or local) funds a project escrow via Squad → a contractor submits site photos claiming milestone completion → Google Gemini Vision AI analyzes the photos against pre-defined acceptance criteria → the AI returns a structured verification verdict → the owner reviews and approves → Squad Transfer API releases funds to the contractor.

This directly addresses Challenge 01 ("Proof of Life"): it uses AI computer vision as the core verification engine for a documented, real-world fraud and trust problem — unverified contractors collecting construction payments.

### **1.2 Scope Boundaries (Hackathon MVP)**

| In Scope | Out of Scope |
| :---- | :---- |
| Photo upload (3–5 images per submission) | Video processing |
| Gemini Vision AI criterion-by-criterion analysis | Mobile native app |
| Simulated escrow via Squad Virtual Accounts | Real BVN/KYC verification |
| Squad payment initiation and milestone release via Transfer API | Inspector escalation UI |
| Project \+ milestone management dashboard | Offline-first sync queue |
| Webhook receipt \+ verification from Squad; Simple AI memory/comparative analysis  |  |
| Responsive web app (Next.js) | WhatsApp integration |

### **1.3 Users**

| Role | Description | Primary Actions |
| :---- | :---- | :---- |
| \*\*Project Owner\*\* | Diaspora/local client funding the project | Create project, fund escrow via DVA, review AI verdict, approve/reject milestone, release payment |
| \*\*Contractor\*\* | Site-based builder claiming milestone | Complete 2-step bank detail verification, submit milestone photos, view analysis results, receive payment |

### **1.4 Hackathon Scoring Alignment**

| Criteria | Weight | How ConSync Addresses It |
| :---- | :---- | :---- |
| AI Technical Depth | 30% | Gemini Vision returning structured JSON criterion assessments with confidence scoring |
| Squad API Integration | 20% | Virtual Account creation (escrow), Initiate Payment (funding), Transfer API (release) — all functional |
| Problem Relevance | 15% | 88% Nigerian project abandonment rate; diaspora fraud; documented domain research |
| Solution Design & Scalability | 15% | Convex real-time backend; Clerk auth; documented architecture |
| Presentation & Demo | 15% | 5-min live demo story: fund → submit → AI verdict → release |
| Impact Potential (Bonus) | 10% | ₦2.4T construction sector, 5M+ diaspora Nigerians |

## **Phase 1 — High-Level Design (HLD)**

### **1.1 Architecture Overview**

Architecture Style: Serverless-first monorepo with a real-time reactive backend.

**Justification:**

* Next.js App Router provides the full-stack surface: server components for data-heavy pages, client components for interactivity, and API Route Handlers for Squad webhooks.

* Convex replaces a traditional REST API \+ PostgreSQL setup with a TypeScript-native reactive backend. Convex queries stream live data to the frontend, mutations handle writes, and actions handle side-effect-ful operations (AI calls, Squad API calls). This eliminates the need for a separate Express API and keeps the team in one codebase.

* Clerk handles authentication entirely — no custom auth code, no session management. It integrates with Convex via the @clerk/nextjs adapter and Convex identity middleware.

* Google Vertex AI (Gemini 2.0 Flash) is called from Convex actions (server-side, secure). Free credits on Vertex AI Studio make this zero-cost for the hackathon.

* Squad API is the financial backbone — Virtual Accounts hold escrowed funds, Initiate Payment drives the checkout flow, Transfer API releases milestone payments to contractors.

**Key Design Principles:**

* Separation of concerns: UI layer (Next.js) knows nothing about payment logic; Convex actions own Squad API calls exclusively.

* Idempotency everywhere: all Squad calls carry unique transaction\_ref values generated server-side.

* AI-first, human-second: Gemini provides the first-pass verdict; human (owner) holds final approval authority. The AI output informs but never auto-executes payment.

### **1.2 Component Diagram**

| Component: Next.js App (Frontend \+ Route Handlers) Type: Full-stack web application Responsibility: All UI rendering, routing, Squad webhook ingestion at /api/webhooks/squad Technology: Next.js 14 App Router, TypeScript, Tailwind CSS Owns: UI state, route protection (Clerk middleware), webhook endpoint   Component: Convex Backend Type: Serverless reactive backend Responsibility: All data queries, mutations, business logic, AI calls, Squad API calls Technology: Convex (cloud-hosted), TypeScript functions Owns: All application data, file storage for photos, business logic   Component: Convex File Storage Type: Object storage (built into Convex) Responsibility: Store submitted milestone photos Technology: Convex built-in storage Owns: Image files, upload URLs   Component: Clerk Type: Authentication service Responsibility: User signup, login, session management, JWT issuance Technology: Clerk (cloud-hosted) Owns: User identities, sessions   Component: Google Vertex AI (Gemini 2.0 Flash) Type: External AI API Responsibility: Analyze milestone photos against acceptance criteria; return structured JSON verdict Technology: @google-cloud/vertexai SDK, gemini-2.0-flash-exp model Owns: AI inference only — no data persistence   Component: Squad API Type: External payment gateway Responsibility: Virtual account creation (escrow), payment initiation, transfer/disbursement, transaction verification Technology: Squad REST API (sandbox: sandbox-api-d.squadco.com) Owns: Financial transactions, NGN fund movement   Component: Convex Scheduler (Background Jobs) Type: Built-in job scheduler in Convex Responsibility: Trigger async AI analysis after photo upload completes Technology: Convex scheduled functions Owns: Analysis job queue |
| :---- |

### **1.3 System Interaction Map**

| From | To | Protocol | Direction | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Browser | Next.js App | HTTPS | Sync | Page navigation, server components |
| Next.js App | Convex Backend | WebSocket (Convex SDK) | Bidirectional | Real-time reactive queries |
| Convex Actions | Google Vertex AI | HTTPS/REST | Sync (server-side) | Gemini Vision API call from Convex action |
| Convex Actions | Squad API | HTTPS/REST | Sync (server-side) | Virtual account creation, payment initiation, transfer |
| Squad API | Next.js /api/webhooks/squad | HTTPS POST | Inbound async | Payment confirmation webhooks |
| Next.js Webhook Handler | Convex Mutation | Convex HTTP API | Sync | Update payment status after Squad webhook |
| Clerk | Convex Backend | JWT | Sync | Identity verification on every Convex call |
| Browser | Convex File Storage | HTTPS (upload URL) | Sync | Direct photo upload via pre-signed URL |

### **1.4 Data Flow Narratives**

**Flow 1: Owner Creates Project and Funds Escrow**

1. Owner logs in via Clerk (Google OAuth or email/password).

2. Owner navigates to "New Project" → fills in project name, contractor email, total value, milestones with acceptance criteria.

3. Browser calls Convex mutation createProject → Convex creates project \+ milestone records, then calls Squad API (POST /virtual-account) to create a dedicated virtual account for this project's escrow.

4. Squad returns virtual\_account\_number. Convex stores it on the project record.

5. Owner is shown the project dashboard with the virtual account number and a "Fund Escrow" button.

6. Owner clicks "Fund Escrow" → Convex action calls Squad POST /transaction/initiate with the project value, owner email, and callback\_url. Squad returns checkout\_url.

7. Frontend redirects owner to Squad checkout URL to complete payment (card, bank transfer, USSD).

8. Squad fires webhook charge\_successful to /api/webhooks/squad. Webhook handler validates x-squad-signature, then calls Convex mutation confirmEscrowFunding → updates escrowBalance and project status to ACTIVE.

**Flow 2: Contractor Submits Milestone Claim (The Core Demo Flow)**

9. Contractor logs in → sees assigned projects → selects a milestone to claim.

10. Contractor uploads 3–5 photos. Browser requests a Convex upload URL (generateUploadUrl mutation) → uploads photos directly to Convex storage → receives storageId per photo.

11. Contractor clicks "Submit Claim" → browser calls Convex mutation createSubmission with milestoneId, array of storageIds, optional GPS coordinates, and a note.

12. Mutation creates a submission record with status PENDING\_ANALYSIS, then schedules a Convex action runMilestoneAnalysis to fire immediately.

13. Convex action runMilestoneAnalysis:

a. Fetches current milestone record and photos from Convex storage.

b. Fetches photoStorageIds from the previous successful submission for this project for comparative analysis.

c. Implements Geo-Fence Check comparing submission GPS against project siteLatitude/siteLongitude.

d. Constructs Gemini Vision prompt with photos, previous context, and criteria.

e. Calls gemini-2.0-flash-exp via Vertex AI SDK.

f. Parses JSON and saves analysisResult.

a. Fetches milestone record (name, acceptance criteria) from Convex DB.

b. Fetches each photo from Convex storage as base64 image data.

c. Constructs Gemini Vision prompt with photo data \+ acceptance criteria (see Section 3.5).

d. Calls gemini-2.0-flash-exp via Vertex AI SDK.

e. Parses structured JSON response.

f. Calls Convex mutation saveAnalysisResult → writes analysisResults record, updates submission status to ANALYSIS\_COMPLETE.

14. Owner's dashboard receives live update via Convex reactive query → shows AI verdict, criterion assessments, and confidence score.

**Flow 3: Owner Reviews and Releases Payment**

15. Owner sees the AI verdict on their dashboard. They review photo evidence \+ per-criterion AI assessments.

16. Owner clicks "Approve and Release Payment."

17. Convex mutation approveMilestone:

a. Validates milestone status and escrow balance.

b. Calls Squad Transfer Account Lookup (POST /payout/account/lookup) to verify contractor bank details.

c. Calls Squad Transfer API to initiate disbursement.

d. Updates milestone status to APPROVED, creates a payment record with status INITIATED.

18. Squad fires transfer webhook to /api/webhooks/squad. Webhook handler updates payment status to SUCCESS. Convex mutation decrements escrowBalance.

19. Both owner and contractor see updated milestone status in real-time.

**Flow 4: Contractor Rejection and Resubmission**

20. Owner clicks "Reject" → enters a rejection reason.

21. Convex mutation rejectMilestone → updates submission to REJECTED, saves owner reason.

22. Contractor sees rejection \+ AI analysis detail in their dashboard, understands what to fix, resubmits photos (repeats Flow 2).

### **1.5 External Integrations**

| Service | Purpose | Data Exchanged | Auth Method |
| :---- | :---- | :---- | :---- |
| Squad API (sandbox-api-d.squadco.com) | Virtual account creation, payment initiation, fund transfer | Transaction amounts (NGN kobo), account numbers, transaction refs | Bearer token (Secret Key in env var) |
| Google Vertex AI | Gemini Vision analysis | Base64-encoded JPEG images, structured JSON prompts and responses | Google Application Default Credentials / Service Account |
| Clerk | User authentication | User identity, JWT tokens, user metadata | Clerk publishable/secret keys |

### **1.6 Deployment Topology (Hackathon)**

* Frontend \+ API Routes: Vercel (free tier) — Next.js app auto-deployed from GitHub push.

* Backend \+ DB: Convex Cloud (free tier) — linked to the same GitHub repo, auto-deploys on push.

* Auth: Clerk (free tier) — configured via dashboard, keys in Vercel environment variables.

* AI: Google Vertex AI — called from Convex backend. Credentials stored as Convex environment variable.

* Squad: Sandbox environment for demo. Webhook URL set to https://\<vercel-domain\>/api/webhooks/squad.

| ⚠  Open Questions / Assumptions:  |
| :---- |

* Assumption: Squad sandbox BVN validation for virtual account creation is relaxed — confirm with Squad integration team via Teams channel.

* Assumption: Convex free tier supports enough storage for 5 photos × \~2MB each × 20 demo submissions.

* Assumption: The Squad sandbox does not enforce the GTBank settlement account requirement, allowing the team to proceed with the demo.

## **Phase 2 — Database Schema & Models (LLD)**

### **2.1 Technology Choice**

Convex is used as the sole data store. Convex is a document-oriented reactive database with a TypeScript schema definition language. It does not use SQL. Schema is defined in convex/schema.ts. All queries are written as TypeScript functions in the convex/ directory — not raw SQL.

Convex File Storage is used for milestone submission photos. Photos are stored as blobs, referenced by Id\<"\_storage"\> in the submissions table.

There is no separate Redis, PostgreSQL, or object storage bucket required — Convex provides all of this.

### **2.2 Entity Relationship Overview**

| users (managed by Clerk — not stored in Convex DB, referenced by clerkId string)   └── has many → projects (as owner)   └── has many → projects (as contractor)   projects   └── has many → milestones   └── has many → payments   └── has one  → squadVirtualAccount (embedded field)   milestones   └── belongs to → projects   └── has many  → submissions   submissions   └── belongs to → milestones   └── belongs to → projects   └── has many  → photoStorageIds (Convex \_storage references)   └── has one   → analysisResults   analysisResults   └── belongs to → submissions   payments   └── belongs to → projects   └── optionally belongs to → milestones |
| :---- |

### **2.3 Schema Definitions**

The full schema is defined in convex/schema.ts:

| // convex/schema.ts import { defineSchema, defineTable } from "convex/server"; import { v } from "convex/values";   export default defineSchema({     // ─── PROJECTS ──────────────────────────────────────────────   projects: defineTable({     name:                 v.string(),     description:          v.optional(v.string()),     ownerClerkId:         v.string(),         // Clerk user ID of the project owner     contractorClerkId:    v.optional(v.string()), // Clerk user ID of assigned contractor     contractorEmail:      v.optional(v.string()), // Used to invite/link contractor before they sign up     status:               v.union(                             v.literal("PENDING\_FUNDING"),                             v.literal("ACTIVE"),                             v.literal("COMPLETED"),                             v.literal("SUSPENDED")                           ),     totalValueKobo:       v.number(),         // Project total in kobo (₦ × 100\)     escrowBalanceKobo:    v.number(),         // Current escrow balance in kobo     projectType:          v.string(),         // e.g. "Residential 4-Bedroom Bungalow"     location:             v.optional(v.string()),     siteLatitude:         v.optional(v.number()),     siteLongitude:        v.optional(v.number()),     // Squad integration fields     squadVirtualAccountNumber: v.optional(v.string()),     squadCustomerIdentifier:   v.optional(v.string()), // e.g. "CSYNC\_proj\_\<id\>"     createdAt:            v.number(),         // Unix timestamp   })   .index("by\_owner", \["ownerClerkId"\])   .index("by\_contractor", \["contractorClerkId"\]),     // ─── MILESTONES ────────────────────────────────────────────   milestones: defineTable({     projectId:            v.id("projects"),     name:                 v.string(),         // e.g. "Ground Floor Slab Completion"     description:          v.string(),     boqReference:         v.optional(v.string()),     valueKobo:            v.number(),         // Milestone payment value in kobo     orderIndex:           v.number(),         // Display order (1, 2, 3...)     status:               v.union(                             v.literal("PENDING"),        // Not yet submitted                             v.literal("SUBMITTED"),      // Photos uploaded, awaiting AI                             v.literal("ANALYSIS\_DONE"),  // AI complete, awaiting owner review                             v.literal("APPROVED"),       // Owner approved, payment released                             v.literal("REJECTED")        // Owner rejected, can resubmit                           ),     acceptanceCriteria:   v.array(v.string()), // Plain-language criteria list     createdAt:            v.number(),   })   .index("by\_project", \["projectId"\])   .index("by\_project\_status", \["projectId", "status"\]),     // ─── SUBMISSIONS ───────────────────────────────────────────   submissions: defineTable({     milestoneId:          v.id("milestones"),     projectId:            v.id("projects"),     contractorClerkId:    v.string(),     photoStorageIds:      v.array(v.id("\_storage")), // Convex file storage IDs     photoCount:           v.number(),     gpsLatitude:          v.number(),     gpsLongitude:         v.number(),     contractorNote:       v.optional(v.string()),     status:               v.union(                             v.literal("PENDING\_ANALYSIS"),                             v.literal("ANALYSIS\_COMPLETE"),                             v.literal("APPROVED"),                             v.literal("REJECTED")                           ),     rejectionReason:      v.optional(v.string()),     submittedAt:          v.number(),   })   .index("by\_milestone", \["milestoneId"\])   .index("by\_project", \["projectId"\])   .index("by\_contractor", \["contractorClerkId"\]),     // ─── ANALYSIS RESULTS ──────────────────────────────────────   analysisResults: defineTable({     submissionId:         v.id("submissions"), |
| :---- |

### **2.4 Indexes & Query Optimization**

All Convex indexes are defined inline in the schema (shown above). Key query patterns and the indexes that serve them:

| Query Pattern | Index Used |
| :---- | :---- |
| Load all projects for owner dashboard | \`by\_owner\` on \`projects\` |
| Load all projects for contractor dashboard | \`by\_contractor\` on \`projects\` |
| Load all milestones for a project | \`by\_project\` on \`milestones\` |
| Load pending milestones for a project | \`by\_project\_status\` on \`milestones\` |
| Load all submissions for a milestone | \`by\_milestone\` on \`submissions\` |
| Fetch analysis result for a submission | \`by\_submission\` on \`analysisResults\` |
| Look up payment by Squad transaction ref (webhook) | \`by\_transaction\_ref\` on \`payments\` |
| Load all payments for a project | \`by\_project\` on \`payments\` |

### **2.5 Caching Strategy**

Convex handles caching automatically — queries are cached and invalidated reactively on mutations. No separate Redis layer is needed for the hackathon. The frontend receives live-updated data via Convex's WebSocket subscription.

For the AI analysis result (expensive to compute, immutable once written), the analysisResults record is written once and never mutated. Convex's query caching means subsequent reads are free.

### **2.6 Data Migration Strategy**

Convex schema changes are handled with the convex dev push workflow. For the hackathon:

* All schema is defined in convex/schema.ts.

* npx convex dev runs schema migrations automatically on save.

* Seed data (demo projects \+ milestones) should be created via a convex/seed.ts action callable from the Convex dashboard.

| ⚠  Open Questions / Assumptions:  |
| :---- |

* Commitment: We will implement an automated Convex action to delete photo blobs for submissions older than 48 hours to ensure the free tier storage is sufficient for the demo.

* Assumption: Contractor bank details will be verified via a 2-step process (lookup API call followed by user confirmation) rather than full BVN validation for the hackathon.

## **Phase 3 — API & Interface Contracts**

### **3.1 API Style & Standards**

The application uses Convex functions (not a traditional REST API) as the primary client-server communication layer. The only traditional HTTP endpoints are Next.js API Route Handlers for Squad webhooks.

**Convex Function Types:**

* query — Read-only, reactive, cached, subscribed by the client in real-time.

* mutation — Write operations, transactional, triggers reactive query updates.

* action — Side-effect operations (external API calls). Not reactive. Called imperatively.

Authentication: All Convex functions receive an authenticated user identity via ctx.auth.getUserIdentity(). Clerk's JWT is automatically forwarded by the Convex client SDK. Functions that require auth call await ctx.auth.getUserIdentity() and throw an error if null.

Response contract: Convex functions throw ConvexError for user-facing errors. The client catches these and displays them. TypeScript types are automatically inferred — no manual response envelope is needed.

### **3.2 Convex Function Catalogue**

**Queries (Read, Reactive)**

| // convex/projects.ts   // Get all projects for the currently authenticated owner export const getOwnerProjects \= query({   handler: async (ctx) \=\> {     const identity \= await ctx.auth.getUserIdentity();     if (\!identity) throw new ConvexError("Not authenticated");     return await ctx.db       .query("projects")       .withIndex("by\_owner", q \=\> q.eq("ownerClerkId", identity.subject))       .collect();   } });   // Get all projects assigned to the authenticated contractor export const getContractorProjects \= query({   handler: async (ctx) \=\> {     const identity \= await ctx.auth.getUserIdentity();     if (\!identity) throw new ConvexError("Not authenticated");     return await ctx.db       .query("projects")       .withIndex("by\_contractor", q \=\> q.eq("contractorClerkId", identity.subject))       .collect();   } });   // Get a single project by ID (validates ownership) export const getProject \= query({   args: { projectId: v.id("projects") },   handler: async (ctx, { projectId }) \=\> {     const identity \= await ctx.auth.getUserIdentity();     if (\!identity) throw new ConvexError("Not authenticated");     const project \= await ctx.db.get(projectId);     if (\!project) throw new ConvexError("Project not found");     // Authorize: user must be owner or contractor     if (project.ownerClerkId \!== identity.subject &&         project.contractorClerkId \!== identity.subject) {       throw new ConvexError("Access denied");     }     return project;   } });   // Get all milestones for a project export const getMilestones \= query({   args: { projectId: v.id("projects") },   handler: async (ctx, { projectId }) \=\> {     // Authorization check similar to getProject     return await ctx.db       .query("milestones")       .withIndex("by\_project", q \=\> q.eq("projectId", projectId))       .order("asc")       .collect();   } });   // Get the latest submission \+ analysis for a milestone export const getMilestoneDetail \= query({   args: { milestoneId: v.id("milestones") },   handler: async (ctx, { milestoneId }) \=\> {     const submissions \= await ctx.db       .query("submissions")       .withIndex("by\_milestone", q \=\> q.eq("milestoneId", milestoneId))       .order("desc")       .first();     if (\!submissions) return { submission: null, analysis: null };     const analysis \= await ctx.db       .query("analysisResults")       .withIndex("by\_submission", q \=\> q.eq("submissionId", submissions.\_id))       .first();     return { submission: submissions, analysis };   } });   // Get payment history for a project export const getProjectPayments \= query({   args: { projectId: v.id("projects") },   handler: async (ctx, { projectId }) \=\> {     return await ctx.db       .query("payments") |
| :---- |

**Mutations (Write)**

| // convex/projects.ts   // Create a new project (owner only) // Signature: createProject({ name, description, projectType, location, //             totalValueKobo, contractorEmail, milestones\[\] }) // Returns: { projectId } // Side effect: schedules setupSquadVirtualAccount action   // convex/submissions.ts   // Generate a pre-signed upload URL for photo upload // Signature: generateUploadUrl() // Returns: string (upload URL) // Auth: any authenticated user   // Create a new submission after photos are uploaded // Signature: createSubmission({ milestoneId, photoStorageIds\[\], gpsLatitude?, //             gpsLongitude?, contractorNote? }) // Returns: { submissionId } // Side effect: schedules runMilestoneAnalysis action // Validation: milestone must belong to project assigned to this contractor   // convex/decisions.ts   // Owner approves a milestone → triggers payment release // Signature: approveMilestone({ milestoneId, contractorBankCode, contractorAccountNum }) // Returns: { paymentRef } // Auth: owner only // Side effect: calls Squad Transfer API via action   // Owner rejects a milestone // Signature: rejectMilestone({ milestoneId, submissionId, reason }) // Returns: void // Auth: owner only   // convex/webhooks.ts   // Internal mutation — called by webhook handler, not directly by client // Signature: confirmEscrowFunding({ transactionRef, gatewayRef, amountKobo }) // Returns: void // Called by: /api/webhooks/squad route handler after signature verification |
| :---- |

**Actions (Side Effects — Server Only)**

| // convex/squad.ts   // Create Squad Virtual Account for project escrow // Called after project creation // Signature: setupSquadVirtualAccount({ projectId }) // Calls: POST https://sandbox-api-d.squadco.com/virtual-account // Writes: project.squadVirtualAccountNumber   // Initiate Squad payment for owner to fund escrow // Signature: initiateEscrowPayment({ projectId, callbackUrl }) // Calls: POST https://sandbox-api-d.squadco.com/transaction/initiate // Returns: { checkoutUrl, transactionRef } // Writes: payments record with status INITIATED   // Release milestone payment to contractor // Signature: releaseMilestonePayment({ milestoneId, bankCode, accountNumber }) // Calls: POST https://sandbox-api-d.squadco.com/payout/account/lookup //        POST https://sandbox-api-d.squadco.com/payout (transfer) // Writes: payments record with status INITIATED   // convex/analysis.ts   // Run Gemini Vision analysis on a submission //   1\. Fetch submission, milestone, and site location from DB //   2\. Fetch previous successful photoStorageIds for project //   3\. Implement Geo-Fence Check layer against site coordinates //   4\. Fetch photos from storage as base64 JPEG //   5\. Build Gemini prompt with current/previous photos //   6\. Call Vertex AI and handle malformed JSON fallbacks // Signature: runMilestoneAnalysis({ submissionId }) // Steps: //   1\. Fetch submission \+ milestone from DB //   2\. Fetch photos from Convex storage as ArrayBuffer //   3\. Convert to base64 JPEG //   4\. Build Gemini prompt (see Section 3.5) //   5\. Call Vertex AI Gemini API //   6\. Parse structured JSON response //   7\. Call saveAnalysisResult mutation // Returns: void |
| :---- |

### **3.3 Next.js API Route Handlers**

**Squad Webhook Handler**

| // app/api/webhooks/squad/route.ts   import { createHmac } from "crypto"; import { NextRequest, NextResponse } from "next/server"; import { ConvexHttpClient } from "convex/browser";   export async function POST(req: NextRequest) {   const body \= await req.text();   const signature \= req.headers.get("x-squad-signature");     // Step 1: Validate Squad HMAC signature   const expectedSig \= createHmac("sha512", process.env.SQUAD\_SECRET\_KEY\!)     .update(body)     .digest("hex")     .toUpperCase();     if (signature?.toUpperCase() \!== expectedSig) {     return NextResponse.json({ error: "Invalid signature" }, { status: 401 });   }     const payload \= JSON.parse(body);   const { Event, Body } \= payload;     const convex \= new ConvexHttpClient(process.env.NEXT\_PUBLIC\_CONVEX\_URL\!);     // Handle payment success events   if (Event \=== "charge\_successful" || Event \=== "transfer\_successful") {     await convex.mutation(api.webhooks.handleSquadWebhook, {       event: Event,       transactionRef: Body.transaction\_ref,       gatewayRef: Body.gateway\_ref,       amountKobo: Body.amount,       status: Body.transaction\_status,     });   }     // Squad requires acknowledgement   return NextResponse.json({     response\_code: 200,     transaction\_reference: Body?.transaction\_ref,     response\_description: "Success"   }); } |
| :---- |

### **3.4 Squad API Integration — Exact Endpoint Mapping**

**A. Initiate Escrow Payment (Owner Funds Project)**

| POST https://sandbox-api-d.squadco.com/transaction/initiate Authorization: Bearer {SQUAD\_SECRET\_KEY} Content-Type: application/json   Request: {   "amount": 500000000,              // Project value in kobo (₦5,000,000 × 100\)   "email": "owner@example.com",   "currency": "NGN",   "initiate\_type": "inline",   "transaction\_ref": "CSYNC\_fund\_\<projectId\>\_\<timestamp\>",  // UNIQUE per call   "customer\_name": "Adebayo Okonkwo",   "callback\_url": "https://\<domain\>/projects/\<projectId\>?funded=true",   "payment\_channels": \["card", "bank", "ussd", "transfer"\],   "metadata": {     "project\_id": "\<convex\_project\_id\>",     "transaction\_type": "ESCROW\_FUNDING"   } }   Response 200: {   "status": 200,   "data": {     "checkout\_url": "https://sandbox-pay.squadco.com/\<transaction\_ref\>",     "transaction\_ref": "CSYNC\_fund\_\<projectId\>\_\<timestamp\>"   } } |
| :---- |

**B. Create Virtual Account (Project Escrow Account)**

| POST https://sandbox-api-d.squadco.com/virtual-account Authorization: Bearer {SQUAD\_SECRET\_KEY} Content-Type: application/json   Request: {   "customer\_identifier": "CSYNC\_\<projectId\>",   // Unique per project   "first\_name": "Project",   "last\_name": "Escrow",   "middle\_name": "ConSync",   "mobile\_num": "08000000000",                   // Placeholder for sandbox   "email": "escrow+\<projectId\>@consync.io",   "bvn": "22222222222",                          // Test BVN for sandbox   "dob": "01/01/1990",   "address": "ConSync Platform, Lagos",   "gender": "1",   "beneficiary\_account": ""                      // Empty: funds go to Squad wallet }   Response 200: {   "success": true,   "data": {     "virtual\_account\_number": "7834927713",     "bank\_code": "058",     "customer\_identifier": "CSYNC\_\<projectId\>"   } } |
| :---- |

**C. Verify Transaction (After Webhook)**

| GET https://sandbox-api-d.squadco.com/transaction/verify/{transaction\_ref} Authorization: Bearer {SQUAD\_SECRET\_KEY}   Response 200: {   "data": {     "transaction\_amount": 500000000,     "transaction\_ref": "CSYNC\_fund\_\<projectId\>\_\<timestamp\>",     "transaction\_status": "Success",  // "Success" | "Failed" | "Pending"     "transaction\_type": "Card"   } } |
| :---- |

**D. Account Lookup Before Transfer (Contractor Payment)**

| POST https://sandbox-api-d.squadco.com/payout/account/lookup Authorization: Bearer {SQUAD\_SECRET\_KEY} Content-Type: application/json   Request: {   "bank\_code": "000013",           // GTBank (from bank code list)   "account\_number": "0123456789" }   Response 200: {   "data": {     "account\_name": "EMEKA JAMES OBI",     "account\_number": "0123456789"   } } |
| :---- |

### **3.5 Gemini Vision Prompt Architecture**

This is the most critical implementation detail for scoring 30% on AI Technical Depth. The prompt must be specific, construction-native, and return strict JSON.

**System Prompt**

| You are a construction quality inspector for ConSync, a Nigerian digital  construction verification platform.   Your role is to verify whether a specific construction milestone has been  completed based on photographic evidence submitted by a contractor.   RULES: \- Base your analysis ONLY on what is visually observable in the provided images. \- If an element is partially obscured (by scaffolding, dust, or equipment),    classify that criterion as CANNOT\_VERIFY — not NOT\_MET. \- Nigerian construction context applies: evaluate materials and methods against    Nigerian building standards and common practice. \- Never fabricate observations. If you cannot clearly see an element, say so. \- You MUST respond with ONLY a valid JSON object. No markdown, no explanation    outside the JSON structure. |
| :---- |

**User Prompt Template**

| PROJECT CONTEXT: \- Project Type: {projectType} \- Milestone: {milestoneName} \- Description: {milestoneDescription}   ACCEPTANCE CRITERIA (assess each one): {acceptanceCriteriaNumbered}   Example format:   1\. Concrete slab surface is visible and continuous across the floor area   2\. No visible cracks wider than approximately 2mm on accessible surfaces   3\. Formwork has been fully removed from underside where visible   4\. All cast-in service penetrations/sleeves are present and capped   IMAGES PROVIDED: {imageCount} photographs have been provided (labelled IMAGE\_1 through IMAGE\_{imageCount}). They are ordered as submitted by the contractor.   TASK: 1\. Review each image. 2\. For each acceptance criterion, determine: MET, NOT\_MET, or CANNOT\_VERIFY. 3\. Note any construction anomalies, safety concerns, or quality issues visible     in any image, even if not listed in the criteria. 4\. Provide an honest confidence score reflecting how clear and complete the     photographic evidence is. 5\. Check current images for background consistency, object reuse, or staging     artifacts compared to previously attached images.   Respond with this exact JSON structure: {   "verificationStatus": "CONFIRMED" | "UNCONFIRMED" | "NEEDS\_REVIEW" | "RESUBMIT\_REQUIRED",   "confidenceScore": \<float 0.0–1.0\>,   "criterionAssessments": \[     {       "criterionText": "\<exact criterion text\>",       "status": "MET" | "NOT\_MET" | "CANNOT\_VERIFY",       "observation": "\<1–2 sentences describing what you see\>"     }   \],   "anomalies": \[     {       "description": "\<specific description\>",       "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",       "recommendation": "\&quot;\&lt;suggested action\&gt; (Include LOCATION\_MISMATCH if geo-fence \&gt; 50m)\&quot;"     }   \],   "visibilityNotes": "\<notes on image quality, obstructions, or lighting\>",   "plainSummary": "\<2–3 sentences suitable for display to the project owner\>",   "routingRecommendation": "APPROVE" | "REVIEW" | "REJECT" } |
| :---- |

**Gemini API Call (Convex Action)**

| // convex/analysis.ts import { VertexAI } from "@google-cloud/vertexai";   const vertexAI \= new VertexAI({   project: process.env.GOOGLE\_CLOUD\_PROJECT\_ID\!,   location: "us-central1", });   const model \= vertexAI.getGenerativeModel({   model: "gemini-2.0-flash-exp",   generationConfig: {     temperature: 0.1,        // Low temperature for consistent, factual output     maxOutputTokens: 2048,     responseMimeType: "application/json",  // Force JSON output   },   systemInstruction: SYSTEM\_PROMPT, });   async function analyzePhotos(   photos: { data: string; mimeType: string }\[\],   // base64 \+ mimeType per photo   milestone: { name: string; description: string; acceptanceCriteria: string\[\] },   project: { projectType: string } ): Promise\<AnalysisJSON\> {     const imageParts \= photos.map((photo, i) \=\> ({     inlineData: { data: photo.data, mimeType: photo.mimeType }   }));     const textPart \= {     text: buildUserPrompt(milestone, project, photos.length)   };     const response \= await model.generateContent({     contents: \[{ role: "user", parts: \[...imageParts, textPart\] }\]   });     const rawText \= response.response.candidates?.\[0\]?.content?.parts?.\[0\]?.text;   if (\!rawText) throw new Error("Empty Gemini response");     return JSON.parse(rawText) as AnalysisJSON;   try { return JSON.parse(rawText) as AnalysisJSON; }    catch { await saveAnalysisResult({ verificationStatus: "NEEDS\_REVIEW",      plainSummary: "AI analysis failed due to malformed response." }); }  |
| :---- |

### **3.6 Webhook Signature Verification (Squad)**

| // lib/squad-webhook.ts import { createHmac } from "crypto";   export function verifySquadWebhook(   rawBody: string,   signature: string | null,   secretKey: string ): boolean {   if (\!signature) return false;   const expected \= createHmac("sha512", secretKey)     .update(rawBody)     .digest("hex")     .toUpperCase();   return expected \=== signature.toUpperCase(); } |
| :---- |

### **3.7 Error Handling Standards**

| Code | Trigger | Response Shape |
| :---- | :---- | :---- |
| ConvexError("Not authenticated") | No valid Clerk JWT | Convex client catches, redirects to /sign-in |
| ConvexError("Access denied") | User not owner/contractor of project | Shown as toast error |
| ConvexError("Insufficient escrow balance") | Release exceeds balance | Shown as error in UI |
| HTTP 401 from Squad API | Invalid secret key | Logged, action throws, submission stays PENDING\_ANALYSIS |
| HTTP 400 from Squad API | Bad request (e.g. duplicate transaction\_ref) | Logged, unique ref regenerated and retried once |
| Gemini API error | Quota exceeded or network failure | Submission stays PENDING\_ANALYSIS, scheduled retry in 2 minutes |

| ⚠  Open Questions / Assumptions:  |
| :---- |

* Squad Transfer API endpoint path needs confirmation (/payout vs /transfer). Verify at https://docs.squadco.com/Transfer-API/transfer-apis before implementation.

* Assumption: Convex actions can use Node.js crypto module and @google-cloud/vertexai npm package in the Convex runtime. Confirm at https://docs.convex.dev/functions/actions.

## **Phase 4 — Technical Specifications**

### **4.1 Full Technology Stack**

| Layer | Technology | Version | Notes |
| :---- | :---- | :---- | :---- |
| Frontend Framework | Next.js App Router | 14.x | Server \+ client components |
| Language | TypeScript | 5.x | Strict mode enabled |
| Styling | Tailwind CSS | 3.x | \+ ConSync design tokens |
| UI Components | shadcn/ui | latest | On top of Tailwind |
| Fonts | Poppins (headings), Inter (body) | via next/font | Per DESIGN.md |
| Authentication | @clerk/nextjs | latest | Clerk provider wraps app |
| Backend/DB | Convex | latest | convex.dev, TypeScript schema |
| File Storage | Convex built-in storage | — | For milestone photos |
| AI Model | gemini-2.0-flash-exp | via Vertex AI | @google-cloud/vertexai SDK |
| Payment Gateway | Squad API | REST v1 | sandbox-api-d.squadco.com (test) |
| HTTP client (server) | native fetch / axios | — | For Squad API calls in actions |
| Deployment (frontend) | Vercel | free tier | Auto-deploy from GitHub |
| Deployment (backend) | Convex Cloud | free tier | Auto-deploy from GitHub |
| Version control | GitHub | — | Monorepo |
| Package manager | pnpm | 8.x | Faster installs for hackathon |

### **4.2 Project File Structure**

| consync/ ├── app/                          \# Next.js App Router │   ├── (auth)/                   \# Clerk auth pages (sign-in, sign-up) │   ├── (dashboard)/ │   │   ├── owner/ │   │   │   ├── projects/ │   │   │   │   ├── page.tsx      \# Owner project list │   │   │   │   ├── new/page.tsx  \# Create project form │   │   │   │   └── \[id\]/ │   │   │   │       ├── page.tsx  \# Project dashboard │   │   │   │       └── milestones/\[milestoneId\]/page.tsx │   │   └── contractor/ │   │       └── projects/ │   │           └── \[id\]/ │   │               └── submit/page.tsx  \# Photo upload \+ submission │   └── api/ │       └── webhooks/ │           └── squad/route.ts    \# Squad webhook handler │ ├── convex/                       \# Convex backend (auto-deployed) │   ├── schema.ts                 \# Database schema (Phase 2\) │   ├── projects.ts               \# Project queries \+ mutations │   ├── milestones.ts             \# Milestone queries \+ mutations │   ├── submissions.ts            \# Submission mutations \+ upload URL │   ├── analysis.ts               \# Gemini AI analysis action │   ├── squad.ts                  \# Squad API actions │   ├── decisions.ts              \# Approve/reject mutations │   ├── webhooks.ts               \# Internal webhook mutation │   └── \_generated/               \# Auto-generated by Convex CLI │ ├── components/ │   ├── ui/                       \# shadcn/ui components │   ├── project-card.tsx │   ├── milestone-list.tsx │   ├── ai-verdict-panel.tsx      \# The key demo component │   ├── photo-uploader.tsx │   └── escrow-balance.tsx │ ├── lib/ │   ├── squad-webhook.ts          \# Signature verification util │   ├── gemini-prompts.ts         \# Prompt templates │   └── utils.ts │ ├── middleware.ts                 \# Clerk route protection ├── convex.json                   \# Convex project config └── .env.local                    \# Environment variables (never commit) |
| :---- |

### **4.3 Environment Variables**

| \# .env.local (never commit to GitHub)   \# Clerk Authentication NEXT\_PUBLIC\_CLERK\_PUBLISHABLE\_KEY=pk\_test\_... CLERK\_SECRET\_KEY=sk\_test\_... NEXT\_PUBLIC\_CLERK\_SIGN\_IN\_URL=/sign-in NEXT\_PUBLIC\_CLERK\_SIGN\_UP\_URL=/sign-up NEXT\_PUBLIC\_CLERK\_AFTER\_SIGN\_IN\_URL=/dashboard NEXT\_PUBLIC\_CLERK\_AFTER\_SIGN\_UP\_URL=/onboarding   \# Convex NEXT\_PUBLIC\_CONVEX\_URL=https://\<deployment\>.convex.cloud CONVEX\_DEPLOY\_KEY=...        \# For CI deployment (optional for hackathon)   \# Squad API SQUAD\_SECRET\_KEY=sandbox\_sk\_...    \# From Squad sandbox dashboard SQUAD\_PUBLIC\_KEY=sandbox\_pk\_...    \# For client-side Squad modal (if used) SQUAD\_BASE\_URL=https://sandbox-api-d.squadco.com   \# Google Vertex AI GOOGLE\_CLOUD\_PROJECT\_ID=...   \# App NEXT\_PUBLIC\_APP\_URL=https://\<vercel-domain\>.vercel.app |
| :---- |

Convex environment variables (set in Convex dashboard, not .env.local):

| SQUAD\_SECRET\_KEY          — Squad API secret key (server-side Squad calls) GOOGLE\_CLOUD\_PROJECT\_ID   — For Vertex AI GOOGLE\_APPLICATION\_CREDENTIALS\_JSON — Service account JSON as string |
| :---- |

### **4.4 Clerk Middleware Configuration**

| // middleware.ts import { authMiddleware } from "@clerk/nextjs";   export default authMiddleware({   publicRoutes: \[     "/",     "/sign-in(.\*)",     "/sign-up(.\*)",     "/api/webhooks/squad",   // Squad webhooks must be public (verified by HMAC)   \], });   export const config \= {   matcher: \["/((?\!.\*\\\\..\*|\_next).\*)", "/", "/(api|trpc)(.\*)"\], }; |
| :---- |

### **4.5 Security Implementation**

| Layer | Control | Implementation |
| :---- | :---- | :---- |
| Transport | HTTPS only | Enforced by Vercel \+ Convex (no HTTP) |
| Authentication | Clerk JWT | Every Convex function checks \`ctx.auth.getUserIdentity()\` |
| Authorization | Row-level access control | Every Convex query/mutation validates user is owner or assigned contractor |
| Webhook integrity | HMAC-SHA512 | Squad \`x-squad-signature\` validated before processing (see 3.6) |
| Secrets | Environment variables | Never in code. Squad secret key only in Convex env (server-side only) |
| Photo access | Convex signed URLs | Photos served via short-lived Convex storage URLs |
| AI input | Server-side only | Gemini API called from Convex action, never from browser |
| SQL injection | N/A | Convex uses TypeScript typed queries, not raw SQL |
| XSS | Next.js default | React JSX escapes output; no dangerouslySetInnerHTML |
| CORS Contractor Bank Details Fields not persisted contractorBankCode and contractorAccountNum are not persisted in Convex DB after payment initiation.  | Convex default | Only Convex client SDK (origin-validated WebSocket) |

### **4.6 Demo Seed Data Strategy**

For the hackathon demo, seed the database via a Convex action called once from the dashboard:

| // convex/seed.ts export const seedDemoData \= action({   handler: async (ctx) \=\> {     // Creates: 1 owner user's project, 3 milestones     // Milestones: "Foundation \+ DPC", "Ground Floor Slab", "Roofing Completion"     // Each milestone has 4 acceptance criteria pre-loaded     // Project value: ₦8,500,000 (850000000 kobo)     // Project type: "Residential 4-Bedroom Bungalow, Lagos"     // This gives judges a realistic context to evaluate   } }); |
| :---- |

| ⚠  Open Questions / Assumptions:  |
| :---- |

* Confirm @google-cloud/vertexai npm package works in Convex action runtime (Node.js compatible). Alternative: use direct fetch to Vertex AI REST API if SDK has compatibility issues.

* Convex environment variables are set via npx convex env set CLI command, not .env.local.

## **Phase 5 — Non-Functional Requirements**

### **5.1 Performance Targets (Hackathon Context)**

| Metric | Target | Notes |
| :---- | :---- | :---- |
| Page load (FCP) | \< 2s | Vercel edge, Next.js server components |
| Dashboard reactive update | \< 500ms | Convex WebSocket subscription latency |
| Photo upload (3 photos, \~1.5MB each) | \< 10s on 4G | Convex direct upload |
| AI analysis end-to-end | \< 30s | Gemini Flash is significantly faster than GPT-4o |
| Squad checkout redirect | \< 3s | Squad generates checkout URL server-side |
| Webhook processing | \< 2s | Squad fires, webhook handler calls Convex mutation |

### **5.2 Scalability Plan (Post-Hackathon)**

The Convex \+ Vercel stack scales horizontally without infrastructure changes. For ConSync's post-hackathon growth:

* Convex scales automatically; no manual server provisioning.

* Vercel serverless functions handle spiky traffic without pre-warming.

* Gemini API rate limits can be managed by queuing analysis jobs in Convex's scheduler.

* Squad API rate limits: confirm with Squad for production volumes.

### **5.3 Reliability Targets (Hackathon)**

| Risk | Mitigation |
| :---- | :---- |
| Gemini API timeout during demo | Retry logic in Convex action (2 retries, 5s backoff). Show "Analysis in progress" spinner. |
| Squad API unavailable during demo | Pre-cache a mock analysis result for the demo project as a fallback. |
| Convex deployment issue | \`npx convex dev\` keeps a local tunnel as fallback. |
| Photo upload fails mid-upload | Convex upload URLs are short-lived (1 hour). Re-request on failure. |
| Squad webhook not received | Manual trigger via Convex dashboard action for demo recovery. |

### **5.4 Observability**

For the hackathon:

* Convex Dashboard provides real-time function logs, error traces, and query performance.

* Vercel Logs provide Next.js runtime logs including webhook handler output.

* All Convex actions log key steps (photo fetch count, Gemini call start/end, Squad response codes).

### **5.5 NDPR Compliance Notes**

For the hackathon demo:

* No real PII is stored for the demo. Use fictional names and email addresses.

* In production: add consentGivenAt field to users, implement data deletion via Convex mutation that purges all records by clerkId.

* Construction site photos constitute sensitive commercial data — do not use real contractor footage for the demo.

## **7\. Hackathon Implementation Roadmap**

### **Day-by-Day Build Plan (5 Days)**

**Day 1 — Foundation (Monday)**

Goal: Auth, routing, data model, and project creation all working end-to-end.

Tasks:

23. create-next-app with TypeScript \+ Tailwind. Install Clerk, Convex, shadcn/ui.

24. Configure Clerk — set up sign-in/sign-up, middleware, Convex \+ Clerk integration.

25. Write convex/schema.ts (full schema from Phase 2).

26. Implement createProject mutation \+ project list queries.

27. Build "Create Project" form (project name, type, value, milestone names \+ criteria).

28. Build Owner Dashboard page — shows project list, loading states.

29. Test: create a project end-to-end, verify it appears in Convex dashboard.

End of Day 1 checkpoint: Owner can sign in, create a project with milestones, and see it on their dashboard.

**Day 2 — The AI Core (Tuesday)**

Goal: Photo upload \+ Gemini analysis working. This is the highest-risk day — de-risk it first.

Tasks:

30. Implement generateUploadUrl mutation \+ photo upload component (file input → Convex storage → storageId).

31. Implement createSubmission mutation \+ schedule runMilestoneAnalysis.

32. Implement runMilestoneAnalysis action:

\- Fetch photos from Convex storage as base64.

\- Build Gemini prompt (paste from Phase 3 prompts — do not improvise).

\- Call Vertex AI Gemini API.

\- Parse JSON response.

\- Save to analysisResults table.

33. Build AI Verdict Panel component (the key demo component):

\- Confidence score displayed as a percentage bar.

\- Criterion-by-criterion table: criterion text | MET/NOT\_MET/CANNOT\_VERIFY | observation.

\- Anomalies list with severity badges.

\- Plain summary in a card.

34. Test: upload 3 real construction site photos (find on Unsplash/Pexels), trigger analysis, verify structured JSON is returned and displayed correctly.

End of Day 2 checkpoint: Photo upload → Gemini analysis → structured verdict displayed to owner in under 30 seconds.

**Day 3 — Squad Integration (Wednesday)**

Goal: Squad payment flows working in sandbox.

Tasks:

35. Set up Squad sandbox account. Get sandbox secret key. Set in Convex env.

36. Implement setupSquadVirtualAccount action — called after project creation.

37. Implement initiateEscrowPayment action → get Squad checkout URL → redirect owner.

38. Build /api/webhooks/squad/route.ts — HMAC validation \+ call Convex mutation.

39. Implement confirmEscrowFunding webhook mutation — update project escrowBalance.

40. Implement owner Approve/Reject flow:

\- approveMilestone mutation → call Squad Account Lookup → call Transfer API.

\- rejectMilestone mutation with reason.

41. Build Escrow Balance widget on owner dashboard.

42. Test Squad sandbox flow: initiate payment → complete via Squad sandbox test card 5200000000000007 → webhook fires → balance updates.

End of Day 3 checkpoint: Full payment loop works in Squad sandbox. Owner funds project, approves milestone, contractor payment initiated.

**Day 4 — Contractor Flow \+ UI Polish (Thursday)**

Goal: Contractor experience complete. UI matches DESIGN.md.

Tasks:

43. Build contractor dashboard — assigned project list, milestone status.

44. Build photo submission page (multi-file upload \+ GPS metadata display \+ note).

45. Apply ConSync design tokens:

\- Primary: Blueprint Blue \#1E4E8C.

\- Cards: border-radius: 12px, subtle shadow.

\- Status badges: green (APPROVED), yellow (NEEDS\_REVIEW), red (REJECTED).

\- Poppins for headings, Inter for body text.

46. Add real-time status polling — contractor sees "Analysis in progress..." then live verdict when ready.

47. Onboarding: contractor 2-step bank verification flow (lookup name → confirm → save).

48. Build the demo scenario end-to-end (full rehearsal run):

\- Owner creates project → funds escrow via Squad.

\- Contractor submits 3 photos.

\- AI verdict appears.

\- Owner approves.

\- Payment released.

49. Fix bugs found in rehearsal.

End of Day 4 checkpoint: Full demo flow rehearsed twice without breaking.

**Day 5 — Demo Prep \+ Buffer (Friday)**

Goal: Stable demo, pitch deck, documentation.

Tasks:

50. Seed the demo project with polished data (realistic Nigerian project names, addresses, milestone names).

51. Pre-load 2 demo accounts: owner (owner@consync.app) and contractor (contractor@consync.app).

52. Test on mobile browser (responsive check — judges may view on phones).

53. Write README.md for GitHub repo (setup instructions, env vars, demo credentials).

54. Prepare 10-slide pitch deck (follow the exact submission format from challenge book).

55. Write the one-pager PDF summary.

56. Final rehearsal of 5-minute demo. Every team member speaks one part.

57. Prepare answers to likely Q\&A questions (see below).

### **Likely Judge Q\&A — Prepare These Cold**

| Question | Answer Brief |
| :---- | :---- |
| "Why can't a contractor just send staged photos?" | Fraud is mitigated through three layers: \*\*1.\*\* GPS bounds checking on submission. \*\*2.\*\* The Gemini Vision prompt explicitly asks for anomalies and consistency checks against previous milestone photos. \*\*3.\*\* The structured JSON output is immutable and provides an audit trail with a \*\*confidence score\*\* and \*\*routing recommendation\*\*, ensuring the human Project Owner holds final sign-off authority.  |
| "Why Squad and not Paystack?" | Squad's Virtual Account API \+ Transfer API maps perfectly to our escrow-and-release architecture. We chose Squad because of its strong API stack and competitive fee structure for construction-scale transactions. |
| "How does the AI know Nigerian construction standards?" | The system prompt explicitly sets Nigerian building context. Acceptance criteria are authored per milestone type (we demo this with 3 pre-loaded milestone types). Over time, fine-tuning on Nigerian construction imagery deepens accuracy. |
| "What's your revenue model?" | 2% transaction fee on released milestone payments — charged on the Squad transfer, not the escrow deposit. At ₦8.5M per project, that's ₦170,000 per project on our platform. |
| "Could this scale nationally?" | Convex \+ Vercel auto-scale. The Squad API handles millions of transactions. The AI cost per analysis is approximately ₦70. At 10,000 analyses/month, AI cost is ₦700,000 — well within the fee revenue at that volume. |

### **Submission Checklist**

* \[ \] Live demo stable and rehearsed (primary) or screen recording prepared (fallback)

* \[ \] Squad API integration visibly firing in demo — checkout URL, webhook update

* \[ \] Gemini AI verdict showing criterion-by-criterion breakdown (not just a summary)

* \[ \] GitHub repo public, README complete, convex/schema.ts documented

* \[ \] 10-slide pitch deck with Squad API slide and AI/Data Intelligence slide

* \[ \] One-pager PDF (A4) ready to hand to judges

* \[ \] All team members know their demo segment and Q\&A brief

End of Document — ConSync Hackathon MVP System Design v1.0

Built for Squad Hackathon 3.0 | Challenge 01: Proof of Life

Stack: Next.js · TypeScript · Clerk · Convex · Google Vertex AI (Gemini) · Squad API

