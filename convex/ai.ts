"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { amazonBedrock } from "@ai-sdk/amazon-bedrock";
import { generateObject } from "ai";
import { z } from "zod";

// ─── AI SDK SYSTEM PROMPT ────────────────────────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `You are ConSync AI, an expert construction milestone verification system specializing in Nigerian construction projects. Your role is to analyze photo evidence submitted by contractors to determine if a construction milestone has been completed according to specified acceptance criteria.

Verification status rules:
- CONFIRMED: All criteria met, confidence >= 80%, no HIGH/CRITICAL anomalies
- UNCONFIRMED: Major criteria not met or confidence < 50%
- NEEDS_REVIEW: Mixed results, some criteria unclear, confidence 50-79%
- RESUBMIT_REQUIRED: Photos are too blurry, too dark, or do not show the work area

Routing rules:
- APPROVE: verificationStatus is CONFIRMED
- REVIEW: verificationStatus is NEEDS_REVIEW
- REJECT: verificationStatus is UNCONFIRMED or RESUBMIT_REQUIRED`;

// ─── MAIN ACTION: Run AI analysis ──────────────────────────────────

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

      // 2. Fetch photos from Convex storage
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
          const uint8Array = new Uint8Array(arrayBuffer);
          const contentType = response.headers.get("content-type") || "image/jpeg";
          return {
            type: "file" as const,
            data: uint8Array,
            mediaType: contentType,
          };
        } catch (err) {
          console.warn("[AI] Failed to fetch photo:", id, err);
          return null;
        }
      });

      const photoResults = await Promise.all(fetchPromises);
      const photoParts = photoResults.flatMap(part => part ? [part] : []);

      if (photoParts.length === 0) {
        console.error("[AI] No photos could be fetched:", args.submissionId);
        return;
      }

      const totalKB = photoParts.reduce(
        (acc, p) => acc + p.data.length,
        0,
      ) / 1024;
      console.log(
        `[AI] ${photoParts.length} photo(s) loaded. Total size: ${totalKB.toFixed(1)} KB`,
      );

      // 3. Build user prompt
      const criteriaText = data.acceptanceCriteria
        .map((c: string, i: number) => `${i + 1}. ${c}`)
        .join("\n");

      const userPromptText = `Milestone: "${data.milestoneName}"
Project Type: ${data.projectType}
${data.projectLocation ? `Location: ${data.projectLocation}` : ""}

Acceptance Criteria to verify:
${criteriaText}

${data.contractorNote ? `Contractor's note: "${data.contractorNote}"` : ""}

Analyze the ${photoParts.length} attached photo(s) and determine whether this milestone has been completed.`;

      console.log("[AI] Starting Vercel AI SDK generateObject call...");
      
      // 4. Call Vercel AI SDK with Amazon Bedrock Nova 2 Lite
      const { object: parsed } = await generateObject({
        model: amazonBedrock("us.amazon.nova-2-lite-v1:0"),
        instructions: ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: userPromptText },
              ...photoParts,
            ],
          },
        ],
        schema: z.object({
          verificationStatus: z.enum(["CONFIRMED", "UNCONFIRMED", "NEEDS_REVIEW", "RESUBMIT_REQUIRED"]),
          confidenceScore: z.number().min(0).max(100),
          criterionAssessments: z.array(z.object({
            criterionText: z.string(),
            status: z.enum(["MET", "NOT_MET", "CANNOT_VERIFY"]),
            observation: z.string()
          })),
          anomalies: z.array(z.object({
            description: z.string(),
            severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            recommendation: z.string()
          })),
          visibilityNotes: z.string().nullable().optional(),
          plainSummary: z.string().describe("2-3 sentence plain English summary of the overall assessment"),
          routingRecommendation: z.enum(["APPROVE", "REVIEW", "REJECT"])
        }),
      });

      console.log("[AI] Response received and strictly parsed via Zod.");

      // 5. Persist result
      await ctx.runMutation(internal.aiData.saveAnalysisResult, {
        submissionId: args.submissionId,
        milestoneId: args.milestoneId,
        projectId: args.projectId,
        verificationStatus: parsed.verificationStatus,
        confidenceScore: parsed.confidenceScore,
        criterionAssessments: parsed.criterionAssessments,
        anomalies: parsed.anomalies,
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
