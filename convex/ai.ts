"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { JWT } from "google-auth-library";
import { Buffer } from "buffer";

// ─── GEMINI SYSTEM PROMPT ────────────────────────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `You are ConSync AI, an expert construction milestone verification system specializing in Nigerian construction projects. Your role is to analyze photo evidence submitted by contractors to determine if a construction milestone has been completed according to specified acceptance criteria.

You must respond with ONLY valid JSON matching the exact schema below. No markdown, no prose, just raw JSON.

Response schema:
{
  "verificationStatus": "CONFIRMED" | "UNCONFIRMED" | "NEEDS_REVIEW" | "RESUBMIT_REQUIRED",
  "confidenceScore": <number 0-100>,
  "criterionAssessments": [
    {
      "criterionText": "<exact criterion text>",
      "status": "MET" | "NOT_MET" | "CANNOT_VERIFY",
      "observation": "<specific observation from the photos supporting this assessment>"
    }
  ],
  "anomalies": [
    {
      "description": "<description of the anomaly>",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "recommendation": "<recommended action>"
    }
  ],
  "visibilityNotes": "<notes about photo quality or visibility issues, or null>",
  "plainSummary": "<2-3 sentence plain English summary of the overall assessment>",
  "routingRecommendation": "APPROVE" | "REVIEW" | "REJECT"
}

Verification status rules:
- CONFIRMED: All criteria met, confidence >= 80%, no HIGH/CRITICAL anomalies
- UNCONFIRMED: Major criteria not met or confidence < 50%
- NEEDS_REVIEW: Mixed results, some criteria unclear, confidence 50-79%
- RESUBMIT_REQUIRED: Photos are too blurry, too dark, or do not show the work area

Routing rules:
- APPROVE: verificationStatus is CONFIRMED
- REVIEW: verificationStatus is NEEDS_REVIEW
- REJECT: verificationStatus is UNCONFIRMED or RESUBMIT_REQUIRED`;

// ─── Helper: Get access token from service account credentials ───────────────

async function getAccessToken(credentials: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const jwtClient = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const tokenResponse = await jwtClient.getAccessToken();
  if (!tokenResponse.token) {
    throw new Error("Failed to obtain access token from service account");
  }
  return tokenResponse.token;
}

// ─── Helper: Call Vertex AI REST API with retry + timeout ────────────────────

async function callVertexAI(
  accessToken: string,
  projectId: string,
  location: string,
  model: string,
  requestBody: object,
): Promise<string> {
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
  const bodyStr = JSON.stringify(requestBody);
  console.log(`[AI] Endpoint: ${endpoint}`);
  console.log(`[AI] JSON body size: ${(bodyStr.length / 1024).toFixed(1)} KB`);

  const MAX_RETRIES = 4;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`[AI] Attempt ${attempt}/${MAX_RETRIES}...`);

    try {
      const controller = new AbortController();
      // 90-second timeout — generous for multimodal model
      const timer = setTimeout(() => controller.abort(), 90_000);

      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: bodyStr,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Vertex AI HTTP ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const candidates = data.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("Vertex AI returned no candidates");
      }
      const parts = candidates[0].content?.parts;
      if (!parts || parts.length === 0) {
        throw new Error("Vertex AI returned no content parts");
      }
      console.log(`[AI] Attempt ${attempt} succeeded.`);
      return parts.map((p: { text?: string }) => p.text ?? "").join("");
    } catch (err: unknown) {
      // Dig into the error — undici wraps ECONNRESET inside err.cause
      const errMsg = err instanceof Error ? err.message : String(err);
      const causeMsg =
        err instanceof Error && err.cause instanceof Error
          ? err.cause.message
          : "";
      const causeCode =
        err instanceof Error && err.cause instanceof Error
          ? (err.cause as NodeJS.ErrnoException).code ?? ""
          : "";

      const isNetwork =
        errMsg.includes("fetch failed") ||
        errMsg.includes("ECONNRESET") ||
        causeMsg.includes("ECONNRESET") ||
        causeCode === "ECONNRESET" ||
        errMsg.includes("socket hang up") ||
        (err instanceof Error && err.name === "AbortError");

      console.warn(
        `[AI] Attempt ${attempt} failed — msg: "${errMsg}", cause: "${causeMsg}", code: "${causeCode}", isNetwork: ${isNetwork}`,
      );

      if (isNetwork && attempt < MAX_RETRIES) {
        const delay = attempt * 3000; // 3s, 6s, 9s
        console.log(`[AI] Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw err;
    }
  }

  throw new Error("[AI] callVertexAI: all retries exhausted");
}

// ─── MAIN ACTION: Run Gemini Vision analysis ──────────────────────────────────

export const runMilestoneAnalysis = internalAction({
  args: {
    submissionId: v.id("submissions"),
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Fetch all data via internal query
      const data = await ctx.runQuery(internal.aiData.fetchSubmissionData, {
        submissionId: args.submissionId,
      });

      if (!data) {
        console.error("[AI] Submission data not found:", args.submissionId);
        return;
      }

      // 2. Fetch photos from Convex storage as base64
      const storageUrls = await Promise.all(
        data.photoStorageIds.map(async (id: string) => {
          const url = await ctx.storage.getUrl(id as import("./_generated/dataModel").Id<"_storage">);
          return url ? { id, url } : null;
        })
      );

      const validUrls = storageUrls.filter((item): item is { id: string; url: string } => item !== null);

      const fetchPromises = validUrls.map(async ({ id, url }) => {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const contentType = response.headers.get("content-type") || "image/jpeg";
          return {
            inlineData: { mimeType: contentType, data: base64 },
          };
        } catch (err) {
          console.warn("[AI] Failed to fetch photo:", id, err);
          return null;
        }
      });

      const photoResults = await Promise.all(fetchPromises);
      const photoParts = photoResults.filter((part): part is { inlineData: { mimeType: string; data: string } } => part !== null);

      if (photoParts.length === 0) {
        console.error("[AI] No photos could be fetched:", args.submissionId);
        return;
      }

      const totalKB = photoParts.reduce(
        (acc, p) => acc + p.inlineData.data.length,
        0,
      ) / 1024;
      console.log(
        `[AI] ${photoParts.length} photo(s) loaded. Total base64: ${totalKB.toFixed(1)} KB`,
      );

      // 3. Build user prompt
      const criteriaText = data.acceptanceCriteria
        .map((c: string, i: number) => `${i + 1}. ${c}`)
        .join("\n");

      const userPrompt = `Milestone: "${data.milestoneName}"
Project Type: ${data.projectType}
${data.projectLocation ? `Location: ${data.projectLocation}` : ""}

Acceptance Criteria to verify:
${criteriaText}

${data.contractorNote ? `Contractor's note: "${data.contractorNote}"` : ""}

Analyze the ${photoParts.length} attached photo(s) and determine whether this milestone has been completed.`;

      // 4. Parse service account credentials
      const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
      const projectId = process.env.GOOGLE_VERTEX_PROJECT_ID;
      const location = process.env.GOOGLE_VERTEX_LOCATION ?? "us-central1";

      if (!credentialsJson || !projectId) {
        console.error("[AI] Missing Vertex AI environment variables");
        return;
      }

      let credentials: { client_email: string; private_key: string };
      try {
        const decoded = Buffer.from(credentialsJson, "base64").toString("utf-8");
        credentials = JSON.parse(decoded);
      } catch (err) {
        console.error("[AI] Failed to parse credentials:", err);
        return;
      }

      // 5. Get OAuth2 access token
      console.log("[AI] Obtaining access token...");
      const accessToken = await getAccessToken(credentials);
      console.log("[AI] Token obtained. Starting Vertex AI call...");

      // 6. Build request body
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }, ...photoParts],
          },
        ],
        systemInstruction: {
          parts: [{ text: ANALYSIS_SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 16384,
        },
      };

      // 7. Call Vertex AI REST API (with retry logic)
      const MODEL_ID = "gemini-2.5-pro";
      let rawJson: string;
      try {
        rawJson = await callVertexAI(
          accessToken,
          projectId,
          location,
          MODEL_ID,
          requestBody,
        );
      } catch (err) {
        console.error("[AI] Vertex AI call failed after all retries:", err);
        return;
      }

      console.log("[AI] Response received. Parsing JSON...");

      // 8. Parse JSON response
      let parsed: {
        verificationStatus:
          | "CONFIRMED"
          | "UNCONFIRMED"
          | "NEEDS_REVIEW"
          | "RESUBMIT_REQUIRED";
        confidenceScore: number;
        criterionAssessments: {
          criterionText: string;
          status: "MET" | "NOT_MET" | "CANNOT_VERIFY";
          observation: string;
        }[];
        anomalies: {
          description: string;
          severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
          recommendation: string;
        }[];
        visibilityNotes?: string;
        plainSummary: string;
        routingRecommendation: "APPROVE" | "REVIEW" | "REJECT";
      };

      try {
        const cleaned = rawJson
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch (err) {
        console.error("[AI] JSON parse failed. Raw:", rawJson, err);
        return;
      }

      // 9. Persist result
      await ctx.runMutation(internal.aiData.saveAnalysisResult, {
        submissionId: args.submissionId,
        milestoneId: args.milestoneId,
        projectId: args.projectId,
        verificationStatus: parsed.verificationStatus,
        confidenceScore: Math.max(0, Math.min(100, parsed.confidenceScore)),
        criterionAssessments: parsed.criterionAssessments ?? [],
        anomalies: parsed.anomalies ?? [],
        visibilityNotes: parsed.visibilityNotes ?? undefined,
        plainSummary: parsed.plainSummary,
        routingRecommendation: parsed.routingRecommendation,
      });

      console.log(
        `[AI] ✅ Analysis complete — ${parsed.verificationStatus} @ ${parsed.confidenceScore}%`,
      );
    } catch (err) {
      console.error("[AI] CRITICAL ERROR:", err);
      try {
        await ctx.runMutation(internal.aiData.saveAnalysisFailure, {
          submissionId: args.submissionId,
          milestoneId: args.milestoneId,
        });
      } catch (patchErr) {
        console.error("[AI] Failed to save failure state:", patchErr);
      }
    }
  },
});
