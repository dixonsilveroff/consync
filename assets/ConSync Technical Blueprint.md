# ConSync — Technical Blueprint (complete, implementable)

Nice — below is a single, developer-focused technical blueprint that will take a team from project start → MVP launch. I keep decisions pragmatic for the Nigerian construction use case (field + office users), prioritize security and iteration velocity, and give copy-paste-ready examples you can feed to Cursor / GitHub Copilot / Qoder.

---

# 1. Executive summary

ConSync is a web-based Construction Lifecycle Management System that combines **Project & Cost Management** with **Supply Chain & Logistics**.
**Tech stack (recommended for MVP):**

* Frontend: **Vite + React (JavaScript)** + **Tailwind CSS**
* Backend: **Node.js + Express**
* Database: **MongoDB Atlas** (with Mongoose)
* Cache / Queue: **Redis** + **BullMQ** (for background jobs)
* Real-time: **Socket.IO**
* File storage: **AWS S3 (or DigitalOcean Spaces)**
* Notifications: **EmailJS / SendGrid** for email, **Twilio** for SMS
* Maps: **Google Maps APIs** (or Mapbox)
* Charts: **Recharts**
* Deploy: Frontend → **Vercel**, Backend & workers → **Render**, DB → **MongoDB Atlas**

I recommend a **modular monolith** for MVP (single backend codebase with clear service boundaries). Split to microservices after product-market fit.

---

# 2. High-level architecture (textual diagram)

Frontend (Vite/React)
↔ HTTPS (REST + WebSockets)
Backend API (Express)
├─ Auth service (JWT + refresh cookies)
├─ Projects service
├─ Procurement & Suppliers service
├─ Logistics & Tracking service
├─ Notifications service (in-app, email, SMS)
├─ Analytics service
└─ Background workers (BullMQ) — process heavy jobs, send emails/SMS, compute reports

Persistence:

* MongoDB Atlas (primary data)
* Redis (session/cache/queue)
* S3 for attachments

Third-party:

* Google Maps (geocoding, directions)
* Twilio (SMS), EmailJS / SendGrid (emails)
* Recharts (frontend charts)

Real-time:

* Socket.IO for live notifications, shipment/location updates.

---

# 3. Data model (core collections / entities)

**Key entities** (fields abbreviated):

1. `User`

* `_id`, `name`, `email`, `phone`, `passwordHash`, `role` (Client|Contractor|Supplier|ProjectEngineer|Admin), `company`, `profilePic`, `meta`, `createdAt`, `updatedAt`

2. `Project`

* `_id`, `title`, `clientId`, `engineerIds`, `contractorId`, `status`, `address`, `startDate`, `endDate`, `budgetTotal`, `budgetConsumed`, `tags`, `documents[]`

3. `CostItem` (budget lines)

* `_id`, `projectId`, `title`, `type` (capex/opex), `amount`, `spent`, `lineItems[]`, `status`

4. `Supplier`

* `_id`, `companyName`, `contacts[]`, `services[]`, `location` (geo), `rating`, `documents`

5. `PurchaseOrder` (PO)

* `_id`, `projectId`, `supplierId`, `items[]`, `amount`, `status` (draft/issued/accepted/fulfilled/cancelled), `createdBy`

6. `Shipment`

* `_id`, `poId`, `supplierId`, `eta`, `status`, `currentLocation` (lat/lng), `history[]`, `trackingReference`

7. `InventoryItem`

* `_id`, `projectId`, `name`, `qtyOnHand`, `reorderLevel`, `uom`, `location`

8. `Notification`

* `_id`, `userId`, `type`, `title`, `body`, `meta`, `read`, `createdAt`

9. `ActivityLog` (audit)

* `_id`, `actorId`, `action`, `resource`, `resourceId`, `meta`, `timestamp`

---

# 4. Backend — folder + file structure (Node.js + Express + JS)

```
/backend
├─ package.json
├─ .env.example
├─ src
│  ├─ index.js                # app bootstrap
│  ├─ app.js                  # express app setup (cors/helmet)
│  ├─ config/
│  │   ├─ db.js
│  │   ├─ redis.js
│  │   └─ logger.js
│  ├─ models/                 # Mongoose schemas
│  │   ├─ User.js
│  │   ├─ Project.js
│  │   └─ ...
│  ├─ controllers/            # controllers per resource
│  │   ├─ authController.js
│  │   ├─ projectController.js
│  │   └─ supplierController.js
│  ├─ routes/
│  │   ├─ authRoutes.js
│  │   ├─ projectRoutes.js
│  │   └─ ...
│  ├─ services/               # business logic and integrations
│  │   ├─ mailService.js
│  │   ├─ smsService.js
│  │   ├─ mapsService.js
│  │   └─ fileService.js
│  ├─ middlewares/
│  │   ├─ auth.js
│  │   ├─ role.js
│  │   └─ errorHandler.js
│  ├─ jobs/                   # BullMQ consumers
│  │   ├─ notificationWorker.js
│  │   └─ shipmentWorker.js
│  ├─ utils/
│  │   └─ validators.js
│  └─ sockets/
│      └─ socketHandler.js
├─ scripts/
└─ Dockerfile
```

**Key backend libs**

* express, mongoose, jsonwebtoken, bcryptjs (or argon2), cookie-parser, helmet, cors, joi (validation), multer, aws-sdk/@aws-sdk/client-s3, bullmq, ioredis, socket.io, winston/pino (logging), dotenv

---

# 5. Frontend — folder + file structure (Vite + React + JS + Tailwind)

```
/frontend
├─ package.json
├─ vite.config.js
├─ tailwind.config.js
├─ src
│  ├─ main.jsx
│  ├─ index.css
│  ├─ App.jsx
│  ├─ api/
│  │   └─ apiClient.js        # axios instance with interceptors
│  ├─ pages/
│  │   ├─ Login.jsx
│  │   ├─ Dashboard.jsx
│  │   ├─ Projects/
│  │   │   ├─ ProjectsList.jsx
│  │   │   └─ ProjectDetail.jsx
│  │   └─ Suppliers/
│  ├─ components/
│  │   ├─ layout/
│  │   │   ├─ Topbar.jsx
│  │   │   └─ Sidebar.jsx
│  │   ├─ ui/
│  │   │   ├─ Button.jsx
│  │   │   └─ Modal.jsx
│  │   ├─ charts/
│  │   │   └─ BudgetChart.jsx
│  │   └─ maps/
│  │       └─ SupplierMap.jsx
│  ├─ contexts/
│  │   └─ AuthContext.jsx
│  ├─ hooks/
│  │   └─ useAuth.js
│  ├─ services/               # typed JS helpers: authService, projectService
│  ├─ utils/
│  └─ assets/
└─ public/
```

---

# 6. API design (resource list + selected endpoints)

> General rules:
>
> * RESTful, JSON responses.
> * `Authorization: Bearer <accessToken>` for access tokens.
> * Refresh tokens kept in **httpOnly cookies** and used via `/auth/refresh` (helps secure against XSS).
> * Use role-based middleware for sensitive endpoints.

### Auth

```
POST  /api/auth/register        # public - register (role selection guarded)
POST  /api/auth/login           # public - returns accessToken + sets refresh cookie
POST  /api/auth/refresh         # refresh token (reads httpOnly cookie) => new accessToken
POST  /api/auth/logout          # clears refresh cookie + invalidates tokens
POST  /api/auth/forgot-password # public - send reset email
POST  /api/auth/reset-password  # public - reset
```

### Users

```
GET   /api/users/               # Admin only - list users
GET   /api/users/:id            # self or admin
PUT   /api/users/:id            # self or admin
DELETE /api/users/:id           # admin
GET   /api/profile              # auth - current user profile
```

### Projects

```
GET   /api/projects             # list (filter by role/project assignments)
POST  /api/projects             # Create (Client/Contractor/Engineer)
GET   /api/projects/:id         # Detail
PUT   /api/projects/:id         # Update
DELETE /api/projects/:id
POST  /api/projects/:id/assign  # assign users (engineers/contractors)
```

### Budget & Cost Items

```
GET   /api/projects/:id/costs
POST  /api/projects/:id/costs
PUT   /api/costs/:costId
DELETE /api/costs/:costId
POST  /api/costs/:costId/approve   # role: ProjectEngineer / Client
```

### Suppliers & Procurement

```
GET   /api/suppliers
POST  /api/suppliers
GET   /api/suppliers/:id
POST  /api/purchase-orders         # create PO
GET   /api/purchase-orders/:id
PUT   /api/purchase-orders/:id
POST  /api/purchase-orders/:id/accept
POST  /api/purchase-orders/:id/ship    # supplier updates
```

### Logistics / Shipments

```
GET   /api/shipments
POST  /api/shipments
GET   /api/shipments/:id
PUT   /api/shipments/:id/location  # supplier/driver updates currentLocation
```

### Notifications

```
GET   /api/notifications
POST  /api/notifications/mark-read
```

### File upload (attachments)

```
POST  /api/uploads/presign        # returns S3 presigned POST or URL
POST  /api/uploads                # (multer -> S3 fallback) store metadata in DB
```

### Webhooks (example)

```
POST  /api/webhooks/twilio        # SMS delivery callbacks
POST  /api/webhooks/maps/directions # optional
```

---

# 7. Example backend snippets (auth + role middleware + refresh)

**JWT helpers (utils/jwt.js)**

```js
const jwt = require('jsonwebtoken');

function signAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefresh(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccess, verifyRefresh };
```

**Auth routes (controllers/authController.js)**

```js
const bcrypt = require('bcryptjs');
const { signAccessToken, signRefreshToken, verifyRefresh } = require('../utils/jwt');
const User = require('../models/User');

async function login(req, res, next) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // set cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({
    accessToken,
    user: { id: user._id, name: user.name, role: user.role }
  });
}

async function refresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const payload = verifyRefresh(token);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const accessToken = signAccessToken(user);
    return res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}
```

**Auth middleware (middlewares/auth.js)**

```js
const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Missing auth header' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

**Role middleware (middlewares/role.js)**

```js
module.exports = function permit(...permittedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No user' });
    if (!permittedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

---

# 8. Frontend auth + API patterns (examples)

**api/apiClient.js**

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  withCredentials: true // <— so refresh cookie is sent
});

// attach Authorization header from in-memory store
let accessToken = null;
export function setAccessToken(token) { accessToken = token; }
api.interceptors.request.use(cfg => {
  if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
  return cfg;
});

// auto-refresh on 401
let isRefreshing = false;
let queue = [];
api.interceptors.response.use(
  r => r,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((res, rej) => queue.push({ res, rej }));
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const resp = await axios.post('/api/auth/refresh', {}, { baseURL: import.meta.env.VITE_API_BASE_URL, withCredentials: true });
        const newToken = resp.data.accessToken;
        setAccessToken(newToken);
        queue.forEach(q => q.res(newToken));
        queue = [];
        return api(original);
      } catch (e) {
        queue.forEach(q => q.rej(e));
        queue = [];
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw err;
  }
);

export default api;
```

**Auth flow in React**

* `AuthContext` stores `user` and `accessToken` in memory (context + local state).
* On app load: call `/auth/refresh` (with cookie via `withCredentials`) to get access token and set user.
* Use `ProtectedRoute` to guard pages by role.

**ProtectedRoute (React Router v6)**

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, roles=[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}
```

---

# 9. UI component hierarchy (core screens & components)

Top-level pages:

* `Auth` — Login, Register, Forgot Password, Reset Password
* `Dashboard` — quick KPIs: budget vs spent, pending POs, shipments in-transit, supplier performance
* `Projects` — ProjectsList, ProjectDetail (Overview, Schedule, Budget, Procurement, Logistics, Files)
* `Suppliers` — Directory, Supplier profile
* `Procurement` — POs list, Create PO, Quotes
* `Inventory` — Stock levels, Reorder alerts
* `Logistics` — Shipments map, Live tracking, Delivery history
* `Notifications` — In-app list
* `Admin` — Users, Roles, System settings

Component breakdown (examples):

* `Layout`

  * `Sidebar` (navigation + quick filters)
  * `Topbar` (search, notifications, profile)
  * `MainContent`
* `DashboardWidgets`

  * `BudgetCard`, `POsCard`, `ShipmentMapCard`
* `ProjectDetail`

  * `ProjectHeader` (status, actions)
  * `Tabs`: Overview, Schedule (Gantt), Budget, Procurement, Logistics
  * `BudgetTable`, `CostItemModal`
* `SupplierMap` (react-google-maps)
* `Chart` components (Recharts): `BudgetTrend`, `SpendByCategory`
* `Forms` (reusable): `Input`, `Select`, `DatePicker`, `FormModal`

---

# 10. Notifications architecture

* **In-app**: create `Notification` collection. When an event occurs (PO issued, shipment updated), push to DB and emit via Socket.IO to connected user clients.
* **Email**: transactional (PO created, password reset) — use EmailJS for quick MVP or SendGrid for production. Use worker queue for retries.
* **SMS**: Twilio for urgent alerts (e.g., shipment delayed).
* **Push scheduling**: use BullMQ jobs, enqueue email/SMS/notification tasks from main app, processed by worker.

**Example Notification flow**

1. `PO` created → publish event to BullMQ (`notificationQueue.add({ type: 'PO_CREATED', data: { poId, userIds } })`)
2. Worker processes event:

   * save Notification documents
   * emit Socket.IO messages to relevant users
   * enqueue or call email/sms service

---

# 11. Maps & supplier tracking (integration notes)

* Use **Google Maps JS API** plus **Directions API** for route, and **Geocoding API** for addresses. Alternative: **Mapbox** for cost savings.
* For real-time tracking: drivers/suppliers send periodic location via `/api/shipments/:id/location` → backend updates `Shipment.currentLocation` and emits Socket.IO to project users.
* On frontend: `@react-google-maps/api` to render map and polylines.

Sample map usage:

```jsx
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
```

---

# 12. Background workers & scheduled jobs

* Use **BullMQ** (Redis-based). Workers on Render (background service or separate instance).
* Jobs:

  * Send emails/SMS
  * Update shipment statuses (via webhook polling if external carriers)
  * Nightly analytics aggregation
  * Reorder alert generation
* Keep job handlers idempotent and use lock patterns.

---

# 13. File uploads & attachments

* Prefer S3 signed upload flow:

  1. Client requests presigned URL: `POST /api/uploads/presign` with file meta.
  2. Backend returns presigned URL.
  3. Client uploads directly to S3.
  4. Client notifies backend when upload completes to persist metadata.

* For small MVP or internal, `multer` → backend → S3 upload.

---

# 14. Security & Best practices (must-haves)

* HTTPS everywhere.
* HttpOnly secure refresh cookies (mitigate XSS).
* Short-lived access tokens; refresh token rotation for production.
* Input validation (Joi/celebrate).
* Rate limit authentication endpoints / IP-based throttling.
* Use helmet, cors with strict origin policy.
* Sanitize data to prevent NoSQL injection.
* Passwords: bcrypt (saltRounds >= 12) or argon2.
* Store secrets in environment variables (Render / Vercel secret manager).
* Audit logs for critical operations (PO approvals, payments).
* Least-privilege on AWS S3 buckets.

---

# 15. Testing & QA

* Frontend: **Jest + React Testing Library**, stories with Storybook for components.
* Backend: **Jest + Supertest** for routes.
* E2E: **Cypress** (happy paths: create project → issue PO → supplier accepts)
* CI: run lint, unit tests, e2e on PRs.

---

# 16. Deployment plan (Vercel + Render + MongoDB Atlas)

**Frontend (Vercel)**

* Connect GitHub repo to Vercel. Vercel builds Vite app (automatic).
* Set env vars in Vercel (`VITE_API_BASE_URL`).
* Use Vercel preview deployments for PR reviews.

**Backend (Render)**

* Deploy Express app on Render as a Web Service (auto-deploy from GitHub).
* Environment variables in Render dashboard.
* Create a separate **Background Worker** service on Render for BullMQ workers.

**Database**

* MongoDB Atlas (cluster). Use SRV connection string in Render/Vercel env vars.
* Enable IP access for Render / set VPC peering if needed.
* Configure automated backups and point-in-time snapshots if available.

**Redis**

* Use Render managed Redis or Upstash for simpler setup.

**File storage**

* AWS S3 (production). For dev, DigitalOcean Spaces is cheaper and S3-compatible.

**CI / CD**

* Let Vercel auto-deploy front. Let Render auto-deploy back. Add GitHub Actions for:

  * Running tests on PRs
  * Optionally deploying to staging branches.

**Sample .env (backend)**

```
PORT=4000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/consync?retryWrites=true&w=majority
JWT_SECRET=...
JWT_REFRESH_SECRET=...
S3_BUCKET=consync-uploads
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
REDIS_URL=redis://:password@hostname:6379
TWILIO_SID=...
TWILIO_TOKEN=...
EMAILJS_API_KEY=...
GOOGLE_MAPS_API_KEY=...
```

---

# 17. Observability & ops

* Logging: **winston** or **pino**. Forward logs to Logflare / Papertrail.
* Error tracking: **Sentry**.
* Metrics: Prometheus + Grafana (optional). At minimum create health endpoints and uptime checks.
* Backups: MongoDB Atlas automated snapshots.
* Incident: daily logs retention, alerting on worker failures, error rate thresholds.

---

# 18. Scaling & evolution plan

MVP as modular monolith → mature product split into services:

* Auth service
* Projects & budgets service
* Procurement service
* Logistics service
* Notifications service
  Communicate between services using REST + event bus (e.g., Redis streams or Kafka) for high throughput.

---

# 19. Example API contract (OpenAPI snippet — auth)

```yaml
openapi: 3.0.0
info:
  title: ConSync API
  version: 0.1.0
paths:
  /api/auth/login:
    post:
      summary: Login user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email: { type: string }
                password: { type: string }
      responses:
        '200':
          description: ok
```

Generate full OpenAPI with tools (SwaggerHub) once endpoints are finalized.

---

# 20. Example frontend snippets (Login + Dashboard widget)

**Login.jsx**

```jsx
import React, { useState } from 'react';
import api, { setAccessToken } from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth();

  async function submit(e) {
    e.preventDefault();
    const resp = await api.post('/api/auth/login', { email, password });
    setAccessToken(resp.data.accessToken);
    setUser(resp.data.user);
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <form onSubmit={submit} className="space-y-4">
        <input value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="Email" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="input" placeholder="Password" />
        <button className="btn w-full">Login</button>
      </form>
    </div>
  );
}
```

**BudgetChart.jsx (Recharts)**

```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BudgetChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="spent" />
        <Line type="monotone" dataKey="budget" strokeDasharray="3 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

# 21. MVP feature list (prioritized)

1. Auth + RBAC (Client/Contractor/Supplier/Engineer)
2. Project CRUD + basic project detail page
3. Budget & cost items (create/approve)
4. Supplier directory + PO create/accept workflow
5. Shipment creation + simple location updates (manually posted)
6. Dashboard KPIs + 2–3 charts (Recharts)
7. In-app notifications + email alerts on critical events
8. File uploads (S3 presigned)
9. Basic logs & error monitoring

(Keep analytics, advanced route optimization, offline-first features for later phases.)

---

# 22. Dev & team recommendations (developer-friendly)

* **Use feature-based folders** for big modules (e.g., `features/projects/`).
* **API-first**: design OpenAPI and generate client stubs for faster frontend work.
* **Contract tests** between frontend and backend.
* **Small PRs** with story deployments (Vercel/Render previews).
* **Automate local dev** with `docker-compose` (Mongo, Redis) to mirror production.

---

# 23. Example GitHub Copilot / Cursor prompts (copy-paste)

1. *"Generate an Express + Mongoose CRUD controller and routes for a `Project` model with fields: title, clientId, startDate, endDate, budgetTotal, status. Include validation with Joi and unit tests using Jest + Supertest."*
2. *"Create a Vite + React (JS) page `ProjectDetail.jsx` with tabs (Overview, Budget, Logistics). Use Tailwind, call `/api/projects/:id` and show a BudgetChart using Recharts."*
3. *"Build an auth flow: Express endpoints `/auth/login`, `/auth/refresh`, middleware to verify access token and role-based middleware function `permit(...roles)`. Use httpOnly refresh cookie. Provide client-side axios auth wrapper with refresh handling."*

---

# 24. Environment variables (complete list to add to .env.example)

```
# App
PORT=4000
NODE_ENV=development

# Mongo
MONGO_URI=

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=

# AWS S3
S3_BUCKET=
S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Redis
REDIS_URL=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=

# Email
SENDGRID_API_KEY=
EMAIL_FROM=

# Google
GOOGLE_MAPS_API_KEY=

# Cors
FRONTEND_URL= (e.g. https://app.consnyc.com)
```

---

# 25. Final checklist before coding (practical next steps)

* Create initial GitHub repo with separate `frontend/` and `backend/` folders.
* Provision MongoDB Atlas cluster and Render/Vercel accounts.
* Create feature board (MVP items above) and assign 2-week sprints (or your preferred cadence).
* Scaffold backend with Express, Mongoose, JWT auth.
* Scaffold frontend with Vite + Tailwind, AuthContext, and sample dashboard.
* Wire one full end-to-end flow (register/login → create project → create PO → supplier accepts → create shipment → update location).
* Add monitoring (Sentry) early.

---

If you'd like, I can:

* Generate the backend repository scaffold (folder + key files) in JS that you can paste into Cursor or Qoder, **or**
* Produce the React Vite starter with AuthContext, API client, and a working Login + Dashboard sample.
