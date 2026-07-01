# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ConSync is an AI-powered construction verification and conditional escrow platform. Contractors submit site photos/videos for milestones; AI (AWS Bedrock / Claude) analyzes the evidence against acceptance criteria; owners approve and release escrow payments (Paystack).

## Commands

```bash
# Development (run in separate terminals)
npx convex dev          # Convex backend (pushes schema + functions, watches for changes)
npm run dev             # Next.js frontend at http://localhost:3000

# Build & lint
npm run build           # Production build
npm run lint            # ESLint (next/core-web-vitals + next/typescript)
```

There is no test suite configured. The Convex guidelines file documents testing with `convex-test` + vitest but it is not set up in this project.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui (Radix)
- **Backend:** Convex (serverless reactive DB + functions)
- **Auth:** Clerk (`@clerk/nextjs`)
- **AI:** AWS Bedrock via `@ai-sdk/amazon-bedrock` (Claude model for image analysis)
- **Payments:** Paystack (escrow funding + milestone releases)
- **Maps:** Leaflet + React Leaflet + Turf.js (geofencing for road/corridor projects)

## Architecture

### Convex Backend (`convex/`)

**Always read `convex/_generated/ai/guidelines.md` before writing Convex code.** It overrides training-data patterns.

| File | Purpose |
|------|---------|
| `schema.ts` | 8 tables: users, projects, milestones, submissions, analysisResults, inspectorFeedback, payments, invitations |
| `ai.ts` | AI analysis actions (AWS Bedrock) — baseline, milestone delta, project progress |
| `prompts.ts` | System prompts for each analysis type |
| `aiData.ts` | Internal queries feeding data to AI actions |
| `paystack.ts` | Paystack API actions (fund escrow, release payment, verify bank) |
| `payments.ts` | Payment record mutations |
| `webhooks.ts` | Internal mutations called by webhook route |
| `projects.ts` | Project CRUD queries/mutations |
| `milestones.ts` | Milestone lifecycle (PENDING → SUBMITTED → ANALYSIS_DONE → APPROVED/REJECTED) |
| `submissions.ts` | Photo/video submission handling with GPS coords |
| `users.ts` | User sync with Clerk, role management (owner/contractor) |
| `projectsData.ts` | Project template seed data |

Convex uses the `tsgo` compiler (see `convex.json`). Node actions that need external packages use `"use node"` directive.

### Frontend (`src/`)

**Routing (Next.js App Router):**
- `(auth)/` — Clerk sign-in/sign-up pages
- `(dashboard)/` — Protected layout with sidebar, RBAC redirect
  - `owner/projects/` — Create projects, view milestones, approve/reject, fund escrow
  - `contractor/projects/` — View assigned projects, submit evidence for milestones
- `api/webhooks/paystack/route.ts` — Paystack webhook endpoint

**Key components:**
- `convex-client-provider.tsx` — Wraps app with Convex + Clerk providers
- `ai-verdict-panel.tsx` — Displays AI analysis results
- `geofence-map.tsx` — Leaflet map for location verification
- `escrow-balance.tsx` — Escrow status display
- `video-upload.tsx` — Media upload with frame extraction

**Utilities (`src/lib/`):**
- `banks.ts` — Nigerian bank code lookup table
- `frame-extractor.ts` — Extracts key frames from video for AI analysis
- `geo.ts` — Geospatial helpers (point-in-corridor checks)
- `project-templates.ts` — Predefined project types with milestone templates

### Path Aliases

- `@/*` → `src/*`
- `@convex/*` → `convex/_generated/*`

## Environment Variables

**Local (`.env.local`):**
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`

**Convex backend (set via `npx convex env set`):**
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` — For Bedrock AI
- `PAYSTACK_SECRET_KEY` — Payment processing

## Convex Patterns Used

- Queries/mutations use `query()`/`mutation()` from `"./_generated/server"`
- Actions (external API calls) use `action()` with `"use node"` when importing Node packages
- Internal functions prefixed with `internalMutation`/`internalQuery`/`internalAction`
- Auth: functions access Clerk identity via `ctx.auth.getUserIdentity()`
- File storage: submissions store Convex storage IDs, resolved via `ctx.storage.getUrl()`
- Real-time: frontend uses `useQuery()` hooks that auto-update on DB changes

## Design System

Brutalist/structural aesthetic. Key Tailwind tokens defined in `tailwind.config.ts`:
- Semantic colors: `--success`, `--warning`, `--escrow`, `--danger`, `--critical-red`
- Typography: `font-display` (headings), `font-mono` (labels/data), `font-sans` (body)
- Custom utilities: `text-h1`–`text-h4`, `text-body`, `text-small`

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
