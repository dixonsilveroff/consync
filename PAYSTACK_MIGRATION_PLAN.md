# Paystack Migration Plan (Replacing Squad Financial APIs)

## 1. Objectives & Scope
- Replace all Squad financial flows (escrow funding, virtual accounts, transfers, webhook verification) with Paystack equivalents.
- Preserve existing product behavior: project escrow funding, milestone release, and real-time status updates.
- Keep Convex/Next.js architecture intact while refactoring provider-specific logic.

## 2. Current Squad Implementation Inventory
**Backend (Convex)**
- `convex/squad.ts`: Squad API wrapper and actions (bank lookup, DVA initiation, transfer release, requery, sandbox overrides).
- `convex/webhooks.ts`: payment status updates and escrow balance adjustments.
- `convex/payments.ts`: payment record creation and transaction ref lookups.
- `convex/milestones.ts`: triggers `releaseMilestonePayment`.
- `convex/projectsData.ts`: stores Squad virtual account info on projects.
- `convex/schema.ts`: fields `squadVirtualAccountNumber`, `squadCustomerIdentifier`, `squadTransactionRef`, `squadGatewayRef`, `dvaAccountNumber`.

**Frontend / API Routes**
- `src/app/api/webhooks/squad/route.ts`: Squad webhook validation and routing to Convex.
- `src/app/(dashboard)/layout.tsx`: uses `api.squad.verifyAndSaveBankDetails`.
- `src/app/(dashboard)/owner/projects/[id]/page.tsx`: uses `api.squad.initiateEscrowViaDva` and displays `squadVirtualAccountNumber`.

**Configuration**
- README references `SQUAD_SECRET_KEY`, `SQUAD_BASE_URL`, `SQUAD_MERCHANT_ID`.
- Sandbox-specific signature bypass and mocked bank lookups exist in `convex/squad.ts` and the webhook route.

## 3. Paystack Capability Mapping (Squad → Paystack)
| Squad Capability | Current Use | Paystack Equivalent | Notes |
| --- | --- | --- | --- |
| Virtual Account (DVA) | Escrow funding via dedicated account | Dedicated Virtual Account (DVA) | Confirm dedicated account requirements (customer creation, BVN/KYC). |
| Payment Initiation | `transaction/initiate` | Transaction Initialize | Returns `authorization_url` for checkout. |
| Payment Verification | `transaction/verify` | Transaction Verify | Used for fallback requery. |
| Bank Account Lookup | `payout/account/lookup` | Resolve Account Number | Required before transfers. |
| Transfer / Disbursement | `payout/transfer` | Transfer Recipient + Transfer | Paystack requires a recipient code. |
| Webhook Signature | `x-squad-signature` | `x-paystack-signature` | HMAC SHA512 of raw body using secret key. |
| Webhook Events | `charge_successful`, transfer events | `charge.success`, `transfer.success`, `transfer.failed` | Confirm exact event payload fields. |

## 4. Key Design Decisions (To Confirm Early)
- **Escrow funding method**: Dedicated Virtual Account only vs. Paystack checkout (card/transfer/USSD).
- **Provider-neutral data model**: rename or extend `squad*` fields to `provider*` fields to support multi-provider use.
- **Sandbox/demo overrides**: remove all signature bypasses and mocked lookups; replace with Paystack test-mode flows.
- **Webhook routing**: keep `/api/webhooks/squad` temporarily or introduce `/api/webhooks/paystack` and deprecate the former.

## 5. Phased Migration Plan

### Phase 0 — Discovery & Prerequisites
- Confirm Paystack product access: Dedicated Virtual Accounts, Transfers, and required KYC tiers.
- Collect test and live keys; define new env vars (`PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, optional base URL).
- Identify Paystack-specific data fields needed (customer codes, dedicated account IDs, transfer recipient codes).
- Align on expected escrow funding UX (bank transfer vs. checkout).

### Phase 1 — Data Model & Schema Refactor
- Introduce provider-agnostic fields in `convex/schema.ts` (e.g., `paymentProvider`, `transactionRef`, `gatewayRef`, `virtualAccountNumber`, `customerIdentifier`, `transferCode`).
- Update `projects` and `payments` tables to store Paystack metadata alongside existing Squad fields.
- Add or adjust indexes to include provider where transaction refs can collide.
- Create a backfill/migration strategy:
  - Map existing `squad*` fields into new provider-agnostic fields for historical records.
  - Keep legacy fields read-only during transition until fully deprecated.

### Phase 2 — Backend Integration (Convex Actions)
- Replace `convex/squad.ts` with a new `convex/paystack.ts` (or a provider module).
- Implement Paystack actions:
  - Resolve account number (bank verification).
  - Create Customer + Dedicated Virtual Account (if escrow is DVA-based).
  - Initialize transaction for escrow funding (if checkout flow is used).
  - Verify transactions for requery fallback.
  - Create transfer recipient + initiate transfer for milestone releases.
  - Verify transfer status and map to internal payment statuses.
- Update `convex/milestones.ts` and payment flow to call Paystack actions and persist Paystack refs.
- Remove sandbox-only overrides and align with Paystack test mode.

### Phase 3 — Webhook Handling Updates
- Add or replace route handler: `/api/webhooks/paystack` (keep `/api/webhooks/squad` for legacy).
- Validate webhook signature using Paystack’s `x-paystack-signature`.
- Map Paystack event payloads to `convex/webhooks.ts`:
  - `charge.success` → escrow funding success
  - `transfer.success` / `transfer.failed` → milestone release status updates
- Ensure idempotency and safe reprocessing.

### Phase 4 — Frontend & UX Adjustments
- Update UI strings and labels to Paystack references.
- Replace `squadVirtualAccountNumber` usage with provider-agnostic fields.
- Update action hooks and error messaging to reflect Paystack workflows.
- Confirm escrow funding instructions match Paystack flow (bank transfer vs. checkout).

### Phase 5 — Configuration & Documentation
- Update README and environment setup instructions to Paystack keys and webhook URLs.
- Update architecture docs: `assets/ConSync_Hackathon_System_Design.md` references Squad heavily.
- Remove or document deprecation of Squad-related env vars.

### Phase 6 — Testing & QA
- Use Paystack test environment to validate:
  - Dedicated account creation and funding.
  - Checkout transaction initialization and verification.
  - Transfer recipient creation and transfers.
  - Webhook ingestion and idempotency.
- Test manual flows: project creation → escrow funding → milestone approval → transfer.
- Validate fallback requery logic and failure states.

### Phase 7 — Cutover & Rollout
- Add a provider feature flag to switch between Squad and Paystack.
- Run a dual-webhook period to allow in-flight Squad transactions to complete.
- Freeze new Squad transactions once Paystack is stable.
- Monitor for webhook failures and payment status drift.

### Phase 8 — Monitoring & Rollback
- Add logging around webhook signature failures, status mismatches, and requery retries.
- Define rollback procedure: switch provider flag back to Squad and keep Paystack disabled.
- Maintain manual reconciliation steps for any transactions that were in-flight during cutover.

## 6. Acceptance Criteria
- All escrow funding and milestone release flows work end-to-end on Paystack test keys.
- Webhooks update payment status and escrow balances reliably.
- Provider-agnostic data model supports historical Squad records without regression.
- Documentation reflects Paystack setup and webhook configuration.

## 7. Risks & Open Questions
- Paystack Dedicated Virtual Account requirements (KYC/BVN) may differ from Squad sandbox behavior.
- Transfer recipient creation introduces new failure points and data fields.
- Dual-provider transaction references must avoid collisions and preserve idempotency.
- Any production cutover must account for in-flight Squad transactions and webhook delivery.
