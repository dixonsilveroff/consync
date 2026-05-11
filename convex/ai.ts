"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { GoogleGenAI } from "@google/genai";

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

// ─── MAIN ACTION: Run Gemini Vision analysis ──────────────────────────────────

export const runMilestoneAnalysis = internalAction({
  args: {
    submissionId: v.id("submissions"),
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch all data via internal query (in aiData.ts — default runtime)
    const data = await ctx.runQuery(internal.aiData.fetchSubmissionData, {
      submissionId: args.submissionId,
    });

    if (!data) {
      console.error("[AI] Submission data not found:", args.submissionId);
      return;
    }

    // 2. Fetch photos from Convex storage as base64
    const photoParts: { inlineData: { mimeType: string; data: string } }[] = [];

    for (const storageId of data.photoStorageIds) {
      const url = await ctx.storage.getUrl(storageId);
      if (!url) continue;

      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = response.headers.get("content-type") || "image/jpeg";
        photoParts.push({ inlineData: { mimeType: contentType, data: base64 } });
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

    // 4. Initialize Vertex AI client using service account credentials
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const projectId = process.env.GOOGLE_VERTEX_PROJECT_ID;
    const location = process.env.GOOGLE_VERTEX_LOCATION ?? "us-central1";

    if (!credentialsJson || !projectId) {
      console.error("[AI] Missing Vertex AI environment variables");
      return;
    }

    const credentials = JSON.parse(credentialsJson);

    const ai = new GoogleGenAI({
      vertexai: true,
      project: projectId,
      location,
      googleAuthOptions: {
        credentials,
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      },
    });

    // 5. Call Gemini Flash
    let rawJson: string;
    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }, ...photoParts],
          },
        ],
        config: {
          systemInstruction: ANALYSIS_SYSTEM_PROMPT,
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      });
      rawJson = result.text ?? "";
    } catch (err) {
      console.error("[AI] Gemini API call failed:", err);
      return;
    }

    // 6. Parse JSON response (strip any markdown fences)
    let parsed: {
      verificationStatus: "CONFIRMED" | "UNCONFIRMED" | "NEEDS_REVIEW" | "RESUBMIT_REQUIRED";
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

    // 7. Persist result via internal mutation (in aiData.ts — default runtime)
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
      `[AI] Analysis complete — ${args.milestoneId}: ${parsed.verificationStatus} @ ${parsed.confidenceScore}%`
    );
  },
});
