"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { amazonBedrock } from "@ai-sdk/amazon-bedrock";
import { generateObject } from "ai";
import { z } from "zod";
import {
  buildSystemPrompt,
  buildBaselinePrompt,
  buildMilestoneDeltaPrompt,
  buildProjectProgressPrompt,
  PromptContext,
  PriorAnalysisContext
} from "./prompts";

export const runMilestoneAnalysis = internalAction({
  args: {
    submissionId: v.id("submissions"),
    milestoneId: v.id("milestones"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Fetch current submission data
      const data = await ctx.runQuery(internal.aiData.fetchSubmissionData, {
        submissionId: args.submissionId,
      });

      if (!data) {
        console.error("[AI] Submission data not found:", args.submissionId);
        return;
      }

      // 2. Determine mode and get prior analyses
      const priorContextData = await ctx.runQuery(internal.aiData.getPriorAnalyses, {
        projectId: args.projectId,
        milestoneId: args.milestoneId,
      });

      const mode = priorContextData.mode;
      console.log(`[AI] Running analysis in mode: ${mode}`);

      // 3. Fetch current key frames
      const currentUrls = await Promise.all(
        (data.keyFrameStorageIds || []).map(async (id: string) => {
          const url = await ctx.storage.getUrl(id as import("./_generated/dataModel").Id<"_storage">);
          return url ? { id, url } : null;
        })
      );
      const validCurrentUrls = currentUrls.filter((item): item is { id: string; url: string } => item !== null);

      const fetchPromises = validCurrentUrls.map(async ({ id, url }) => {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          return {
            type: "file" as const,
            data: new Uint8Array(arrayBuffer),
            mediaType: response.headers.get("content-type") || "image/jpeg",
          };
        } catch (err) {
          console.warn("[AI] Failed to fetch current frame:", id, err);
          return null;
        }
      });

      const currentParts = (await Promise.all(fetchPromises)).flatMap(part => part ? [part] : []);

      if (currentParts.length === 0) {
        console.error("[AI] No current frames could be fetched.");
        return;
      }

      // 4. Build Context
      const promptCtx: PromptContext = {
        projectName: data.projectName,
        projectType: data.projectType,
        projectLocation: data.projectLocation,
        milestoneName: data.milestoneName,
        milestoneDescription: data.milestoneDescription,
        boqReference: data.boqReference,
        acceptanceCriteria: data.acceptanceCriteria,
        contractorNote: data.contractorNote,
        frameCount: currentParts.length,
      };

      let userPromptText = "";
      const priorParts: any[] = [];
      let priorAnalysisIds: string[] = [];

      if (mode === "BASELINE") {
        userPromptText = buildBaselinePrompt(promptCtx);
      } else if (mode === "MILESTONE_DELTA") {
        const prior = priorContextData.sameMilestonePrior;
        if (prior) {
          priorAnalysisIds.push(prior._id);
          const priorCtx: PriorAnalysisContext = {
            analysisDate: new Date(prior.analyzedAt).toISOString().split('T')[0],
            milestoneName: data.milestoneName,
            status: prior.verificationStatus,
            plainSummary: prior.plainSummary,
            priorFrameCount: 0, // Will be updated below
            unresolvedAnomalies: prior.anomalies.filter(a => a.severity === "HIGH" || a.severity === "CRITICAL").map(a => a.description)
          };

          // Fetch prior frames (up to 3 to save tokens)
          // Since prior submissions might use old photoStorageIds, we must find the prior submission
          const priorSub = await ctx.runQuery(internal.aiData.fetchSubmissionData, { submissionId: prior.submissionId });
          if (priorSub && priorSub.keyFrameStorageIds && priorSub.keyFrameStorageIds.length > 0) {
            const priorIds = priorSub.keyFrameStorageIds.slice(0, 3);
            priorCtx.priorFrameCount = priorIds.length;
            const pUrls = await Promise.all(
              priorIds.map(async (id: string) => {
                const url = await ctx.storage.getUrl(id as import("./_generated/dataModel").Id<"_storage">);
                return url;
              })
            );
            for (const pUrl of pUrls) {
              if (pUrl) {
                const pRes = await fetch(pUrl);
                const pBuf = await pRes.arrayBuffer();
                priorParts.push({
                  type: "file" as const,
                  data: new Uint8Array(pBuf),
                  mediaType: pRes.headers.get("content-type") || "image/jpeg",
                });
              }
            }
          }
          userPromptText = buildMilestoneDeltaPrompt(promptCtx, priorCtx);
        } else {
          userPromptText = buildBaselinePrompt(promptCtx);
        }
      } else if (mode === "PROJECT_PROGRESS") {
        const priorContexts: PriorAnalysisContext[] = [];
        for (const p of priorContextData.projectPriors) {
          priorAnalysisIds.push(p._id);
          // Get milestone name
          const pSub = await ctx.runQuery(internal.aiData.fetchSubmissionData, { submissionId: p.submissionId });
          priorContexts.push({
            analysisDate: new Date(p.analyzedAt).toISOString().split('T')[0],
            milestoneName: pSub?.milestoneName || "Previous Milestone",
            status: p.verificationStatus,
            plainSummary: p.plainSummary,
            priorFrameCount: 0,
            unresolvedAnomalies: []
          });
        }
        userPromptText = buildProjectProgressPrompt(promptCtx, priorContexts);
      }

      console.log("[AI] Starting Vercel AI SDK generateObject call...");
      const modelName = "us.amazon.nova-2-lite-v1:0";

      // 5. Call AI
      const { object: parsed } = await generateObject({
        model: amazonBedrock(modelName),
        instructions: buildSystemPrompt(),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: userPromptText },
              ...priorParts,
              ...currentParts,
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
          comparativeObservations: z.object({
            progressionConsistent: z.boolean().nullable().optional(),
            priorAnomaliesResolved: z.array(z.string()).optional(),
            regressionFlags: z.array(z.string()).optional(),
            newSincePrior: z.string().optional()
          }).optional(),
          visibilityNotes: z.string().nullable().optional(),
          plainSummary: z.string().describe("2-3 sentence plain English summary of the overall assessment"),
          routingRecommendation: z.enum(["APPROVE", "REVIEW", "REJECT"])
        }),
      });

      console.log("[AI] Response received and strictly parsed.");

      // 6. Persist result
      await ctx.runMutation(internal.aiData.saveAnalysisResult, {
        submissionId: args.submissionId,
        milestoneId: args.milestoneId,
        projectId: args.projectId,
        analysisMode: mode,
        verificationStatus: parsed.verificationStatus,
        confidenceScore: parsed.confidenceScore,
        criterionAssessments: parsed.criterionAssessments,
        anomalies: parsed.anomalies,
        comparativeObservations: parsed.comparativeObservations ? {
          ...parsed.comparativeObservations,
          progressionConsistent: parsed.comparativeObservations.progressionConsistent ?? undefined,
        } : undefined,
        visibilityNotes: parsed.visibilityNotes ?? undefined,
        plainSummary: parsed.plainSummary,
        routingRecommendation: parsed.routingRecommendation,
        modelUsed: modelName,
        priorAnalysisIds: priorAnalysisIds.length > 0 ? priorAnalysisIds as import("./_generated/dataModel").Id<"analysisResults">[] : undefined,
      });

      console.log(`[AI] ✅ Analysis complete — ${parsed.verificationStatus} @ ${parsed.confidenceScore}%`);
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
