# ConSync

**AI-Powered Construction Verification & Conditional Escrow Releases**

*Built for Squad Hackathon 3.0 | Challenge 01: Proof of Life*

---

## 📌 The Problem: The Construction Trust Deficit

In Nigeria, over **88% of construction projects** face delays or abandonment. Diaspora investors and local project owners constantly battle unverified claims, staged photos, and misappropriated funds. Without a reliable way to verify progress remotely, releasing payments becomes a massive risk.

**ConSync** replaces blind trust with irrefutable, AI-analyzed photographic evidence and conditional escrow. It guarantees that contractors only get paid when the work is actually done, and owners only pay for verified progress.

## ✨ Key Features (The Trust Loop)

1. **Secure Escrow (Powered by Squad API):** Project funds are held securely in Squad Dynamic Virtual Accounts (DVAs).
2. **AI Verification (Powered by Google Gemini 2.0):** Contractors upload site photos for specific milestones. Gemini Vision AI evaluates the evidence against predefined acceptance criteria, providing a structured verdict, anomaly detection, and a confidence score.
3. **Instant Release (Powered by Squad Transfer API):** Once the owner approves the AI-verified milestone, funds are instantly disbursed to the contractor's verified bank account.

## 🛠️ Technical Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend & Database:** Convex (Serverless reactive backend)
- **Authentication:** Clerk
- **AI Model:** Google Vertex AI (Gemini 2.0 Flash)
- **Payment Infrastructure:** Squad API (Virtual Accounts, Transfers, Webhooks)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and `npm` or `pnpm`
- A Clerk account (for authentication)
- A Convex account (for backend/DB)
- A Squad Sandbox account (for payments)
- A Google Cloud project with Vertex AI enabled

### 1. Clone the repository

```bash
git clone https://github.com/your-username/consync.git
cd consync
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables Setup

You need to configure both your local Next.js environment and your Convex backend environment.

**A. Local Environment (`.env.local`)**
Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Convex
NEXT_PUBLIC_CONVEX_URL=https://<your-convex-deployment>.convex.cloud

# App Base URL (Important for Webhook testing locally via Ngrok)
APP_BASE_URL=http://localhost:3000
```

**B. Convex Backend Environment**
Set these variables using the Convex CLI or dashboard:

```bash
npx convex env set SQUAD_SECRET_KEY "sandbox_sk_..."
npx convex env set SQUAD_BASE_URL "https://sandbox-api-d.squadco.com"
npx convex env set SQUAD_MERCHANT_ID "YOUR_MERCHANT_ID"
npx convex env set GOOGLE_CLOUD_PROJECT_ID "your-gcp-project-id"
npx convex env set GOOGLE_APPLICATION_CREDENTIALS_JSON '{...}'
```

### 4. Run the Development Servers

Start the Convex backend (this will push your schema and functions):
```bash
npx convex dev
```

In a new terminal, start the Next.js frontend:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🧪 Testing the Squad Webhooks Locally

Since Squad needs to send webhooks to your app, you must expose your local server to the internet using a tool like [Ngrok](https://ngrok.com/).

1. Start Ngrok: `ngrok http 3000`
2. Copy the Ngrok HTTPS URL.
3. In your Squad Sandbox Dashboard, set your Webhook URL to: `https://<your-ngrok-url>/api/webhooks/squad`

*Note: For Dynamic Virtual Account (DVA) testing, ensure you have contacted Squad Support to profile your sandbox account for DVA access, and run the `buildDvaPool` Convex action to generate test accounts.*

## 📂 Project Structure

- `/src/app`: Next.js App Router pages (Frontend, Dashboards, Webhook API).
- `/src/components`: Reusable UI components (Navbar, Footer, AI Verdict Panel, etc.).
- `/convex`: Backend logic, database schema (`schema.ts`), serverless actions (AI, Squad API), and mutations.
- `/assets`: Contains detailed architecture documentation (`ConSync_Hackathon_System_Design.md`, `ConSync_Squad_API_Implementation_Guide.md`).

## 🛡️ Hackathon Note to Judges
This repository contains a fully functional prototype designed for the **Squad Hackathon 3.0**. The implementation utilizes the Squad Sandbox environment. Please refer to `assets/ConSync_Hackathon_System_Design.md` for an in-depth architectural breakdown and data flow narrative.
