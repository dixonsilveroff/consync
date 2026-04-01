# 🚢 Vibe Coding: The "Sinking Ship" Prevention Guide
> **Instructions for AI Agents:** Use this checklist as a system prompt or context file. Before finalizing any feature, verify the implementation against these 20 critical failure points.

---

## 🔐 Security & Authentication

### 1. API Rate Limiting
* **Check:** Ensure all backend routes have rate limiting.
* **Risk:** Backend spam resulting in massive API bills or DoS.

### 2. Secure Token Storage
* **Check:** Move auth tokens from `localStorage` to **HttpOnly, Secure Cookies**.
* **Risk:** XSS attacks compromising all user accounts.

### 3. Input Sanitization
* **Check:** Sanitize all form inputs; use parameterized queries.
* **Risk:** SQL Injection is still a threat in 2026.

### 4. Frontend API Keys
* **Check:** Zero hardcoded keys in the frontend. Use server-side environment variables.
* **Risk:** Public discovery and theft of keys within 48 hours.

### 5. Webhook Signature Verification
* **Check:** Verify signatures on all incoming webhooks (e.g., Stripe, Supabase).
* **Risk:** Spoofed payment events granting free access.

### 6. Admin Role Checks
* **Check:** Implement strict RBAC (Role-Based Access Control) on all `/admin` routes.
* **Risk:** Logged-in non-admin users accessing sensitive panels.

### 7. CORS Policy
* **Check:** Define explicit origins. Do not use `*` in production.
* **Risk:** Unauthorized domains making cross-origin requests.

---

## 📈 Performance & Scalability

### 8. Database Indexing
* **Check:** Add indexes to any field used in a `WHERE` or `JOIN` clause.
* **Risk:** App performance dies once you hit 1,000+ users.

### 9. Database Connection Pooling
* **Check:** Use a pooler (like PgBouncer) for traffic spikes.
* **Risk:** Database crashes under high concurrent load.

### 10. Pagination
* **Check:** All fetch requests must use `limit` and `offset` (or cursor-based logic).
* **Risk:** Loading the entire database into memory on a single fetch.

### 11. Asset Delivery (CDN)
* **Check:** Serve images/videos via CDN, never directly from the application server.
* **Risk:** High hosting bills and 8s+ load times.

### 12. Background Processing (SMTP)
* **Check:** Send emails/notifications via background workers, not synchronously.
* **Risk:** Slow SMTP servers hanging the entire app UI.

---

## 🛠️ Reliability & DevOps

### 13. Environment Validation
* **Check:** Use a schema (like Zod) to validate `.env` variables at startup.
* **Risk:** App breaks silently in production with no error logs.

### 14. Error Boundaries
* **Check:** Wrap UI components in Error Boundaries.
* **Risk:** A single crash resulting in a permanent "White Screen of Death."

### 15. Session TTL
* **Check:** Implement session expiration.
* **Risk:** Permanent access for stolen tokens.

### 16. Password Reset Expiry
* **Check:** Set short TTLs on reset links (e.g., 15–30 minutes).
* **Risk:** Instant account takeover via old emails.

### 17. Health Check Endpoints
* **Check:** Implement a `/health` route for monitoring tools.
* **Risk:** Silent downtime only discovered by client complaints.

### 18. Production Logging
* **Check:** Implement structured logging (e.g., Pino, Winston).
* **Risk:** Zero visibility into why things break in production.

### 19. Backup Strategy
* **Check:** Automated daily DB snapshots and "point-in-time" recovery.
* **Risk:** Complete data loss during a bad migration.

---

## 🤖 AI Development Standards

### 20. TypeScript Enforcement
* **Check:** No `any` types. Strictly type all AI-generated code.
* **Risk:** Shipping confident but wrong, untyped AI hallucinations.