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

// ─── Helper: Call Vertex AI REST API directly via fetch ───────────────────────

async function callVertexAI(
  accessToken: string,
  projectId: string,
  location: string,
  model: string,
  requestBody: object,
): Promise<string> {
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Vertex AI returned ${response.status}: ${errorBody}`,
    );
  }

  const data = await response.json();

  // Extract text from the Vertex AI REST response structure
  const candidates = data.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("Vertex AI returned no candidates");
  }
  const parts = candidates[0].content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("Vertex AI returned no content parts");
  }
  return parts.map((p: { text?: string }) => p.text ?? "").join("");
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
      // 1. Fetch all data via internal query (in aiData.ts — default runtime)
      const data = await ctx.runQuery(internal.aiData.fetchSubmissionData, {
        submissionId: args.submissionId,
      });

      if (!data) {
        console.error("[AI] Submission data not found:", args.submissionId);
        return;
      }

      // 2. Fetch photos from Convex storage as base64
      const photoParts: { inlineData: { mimeType: string; data: string } }[] =
        [];

      for (const storageId of data.photoStorageIds) {
        const url = await ctx.storage.getUrl(storageId);
        if (!url) continue;

        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const contentType =
            response.headers.get("content-type") || "image/jpeg";
          photoParts.push({
            inlineData: { mimeType: contentType, data: base64 },
          });
        } catch (err) {
          console.warn("[AI] Failed to fetch photo:", storageId, err);
        }
      }

      if (photoParts.length === 0) {
        console.error("[AI] No photos could be fetched:", args.submissionId);
        return;
      }

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

      // 4. Parse service account credentials and get access token
      const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
      const projectId = process.env.GOOGLE_VERTEX_PROJECT_ID;
      const location = process.env.GOOGLE_VERTEX_LOCATION ?? "us-central1";

      const totalBase64Size = photoParts.reduce(
        (acc, p) => acc + p.inlineData.data.length,
        0,
      );
      console.log(
        `[AI] Preparing Vertex AI REST call for ${photoParts.length} photos. Payload: ${(totalBase64Size / 1024 / 1024).toFixed(2)} MB`,
      );

      if (!credentialsJson || !projectId) {
        console.error("[AI] Missing Vertex AI environment variables");
        return;
      }

      let credentials: { client_email: string; private_key: string };
      try {
        const decoded = Buffer.from(credentialsJson, "base64").toString(
          "utf-8",
        );
        credentials = JSON.parse(decoded);
      } catch (err) {
        console.error(
          "[AI] Failed to decode/parse GOOGLE_APPLICATION_CREDENTIALS_JSON:",
          err,
        );
        return;
      }

      // 5. Get OAuth2 access token
      console.log("[AI] Obtaining access token from service account...");
      const accessToken = await getAccessToken(credentials);
      console.log("[AI] Access token obtained. Calling Vertex AI REST API...");

      // 6. Build the Vertex AI REST request body
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
          maxOutputTokens: 2048,
        },
      };

      // 7. Call Vertex AI directly via fetch (bypassing the SDK)
      const MODEL_ID = "gemini-2.0-flash-001";
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
        console.error("[AI] Vertex AI REST call failed:", err);
        return;
      }

      console.log("[AI] Received response from Vertex AI. Parsing JSON...");

      // 8. Parse JSON response (strip any markdown fences)
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
        console.error("[AI] JSON parse failed. Raw response:", rawJson, err);
        return;
      }

      // 9. Persist result via internal mutation (in aiData.ts — default runtime)
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
        `[AI] Analysis complete — ${args.milestoneId}: ${parsed.verificationStatus} @ ${parsed.confidenceScore}%`,
      );
    } catch (err) {
      console.error("[AI] CRITICAL ERROR in runMilestoneAnalysis:", err);
      // Ensure the frontend stops loading by marking it as rejected
      try {
        await ctx.runMutation(internal.aiData.saveAnalysisFailure, {
          submissionId: args.submissionId,
          milestoneId: args.milestoneId,
        });
      } catch (patchErr) {
        console.error("[AI] Failed to update status on error:", patchErr);
      }
    }
  },
});
