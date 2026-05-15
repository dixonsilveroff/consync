# Audit Findings: `convex/` Directory

## 1. Authorization Issues
- **Missing `ctx.auth.getUserIdentity()` or explicit access checks:**
  - `convex/payments.ts`: `createPayment`, `getPaymentByTransactionRef`, `updatePaymentRef` do not check the user's identity. Since they are `internalMutation`/`internalQuery`, they are not directly callable by the client, but it's important to document.
  - `convex/projectsData.ts`: `getProjectById` and `setProjectVirtualAccount` (internal) lack authorization checks.
  - `convex/squad.ts`: `requeryEscrowPayment` and `releaseMilestonePayment` (internal) lack authorization checks.
  - `convex/webhooks.ts`: `handleSquadWebhook` (public mutation) does not require authorization since webhooks are unauthenticated, but there are no signature verifications (e.g. verifying headers from Squad).

- **Incomplete Access Controls:**
  - `convex/squad.ts`: `buildDvaPool` (lines 124-146) does not check `ctx.auth.getUserIdentity()` or role permissions.
  - `convex/squad.ts`: `initiateEscrowViaDva` (lines 151-206) does NOT check if the authenticated user owns the `projectId`.

## 2. Data Fetching & Performance Patterns
- **N+1 Query Patterns / Promise.all:**
  - `convex/milestones.ts`: In `getMilestoneDetail` (lines 81-85), we loop over `latestSubmission.photoStorageIds` calling `await ctx.storage.getUrl(storageId)` sequentially.
  - `convex/users.ts`: In `syncUser` (lines 58-65), we loop over `invitations`, calling `await ctx.db.patch` and `await ctx.db.delete` sequentially.
  - `convex/projects.ts`: In `createProject` (lines 122-134), milestones are created sequentially in a `for` loop.
  - `convex/ai.ts`: In `runMilestoneAnalysis` (lines 184-200), we iterate over `data.photoStorageIds` sequentially.

- **Missing Pagination:**
  - `convex/projects.ts`: `getOwnerProjects` (lines 11-21) and `getContractorProjects` (lines 26-38) use `.collect()`.
  - `convex/milestones.ts`: `getMilestones` (lines 9-33) and `getSubmissionHistory` (lines 99-112) use `.collect()`.

## 3. Logic & Quality Issues
- **Unhandled Promises:**
  - `convex/ai.ts`: `ctx.runMutation(internal.aiData.saveAnalysisFailure, ...)` in the catch block (line 344) may throw if it fails, which the inner try/catch catches, but the overall `runMilestoneAnalysis` action doesn't return anything robust.

- **Missing Return Types:**
  - Most handlers lack explicit return types, relying entirely on inference.

- **Webhook Verification:**
  - `convex/webhooks.ts`: `handleSquadWebhook` completely lacks any signature verification for the webhook event.
