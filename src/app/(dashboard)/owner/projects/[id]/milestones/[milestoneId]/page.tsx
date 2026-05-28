"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { AiVerdictPanel } from "@/components/ai-verdict-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Clock } from "lucide-react";
import { getStatusConfig, formatDate, formatNaira } from "@/lib/utils";

export default function MilestoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const milestoneId = params.milestoneId as Id<"milestones">;

  const detail = useQuery(api.milestones.getMilestoneDetail, { milestoneId });

  if (detail === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-on-surface-variant font-medium animate-pulse">Loading milestone...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        Milestone not found or access denied.
      </div>
    );
  }

  const { milestone, submission, analysis, photoUrls } = detail;
  const statusCfg = getStatusConfig(milestone.status);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/owner/projects/${params.id}`)}
        className="flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Project
      </Button>

      {/* Milestone Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-display-sm text-on-surface">{milestone.name}</h1>
          <p className="text-body-md text-on-surface-variant mt-1">{milestone.description}</p>
        </div>
        <span className={statusCfg.className}>{statusCfg.label}</span>
      </div>

      {/* Milestone Meta */}
      <div className="card-enforcer mb-6 flex flex-wrap gap-6">
        <div>
          <p className="label-blueprint">Value</p>
          <p className="font-mono text-headline-sm text-primary mt-1">
            {formatNaira(milestone.valueKobo)}
          </p>
        </div>
        <div>
          <p className="label-blueprint">Created</p>
          <p className="text-body-md text-on-surface mt-1">{formatDate(milestone.createdAt)}</p>
        </div>
        <div>
          <p className="label-blueprint">Acceptance Criteria</p>
          <ul className="mt-1 space-y-1">
            {milestone.acceptanceCriteria.map((c: string, i: number) => (
              <li key={i} className="text-body-sm text-on-surface flex gap-2">
                <span className="text-primary">·</span> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* No submission yet */}
      {!submission && (
        <div className="card-enforcer flex items-center gap-3 text-on-surface-variant py-8 justify-center flex-col">
          <Clock className="w-8 h-8" />
          <p className="text-body-md">No submission yet for this milestone.</p>
        </div>
      )}

      {/* Submission photos */}
      {submission && photoUrls.length > 0 && (
        <div className="card-enforcer mb-6">
          <h2 className="label-blueprint mb-3">Submitted Photos</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {(photoUrls.filter(Boolean) as string[]).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`Site photo ${i + 1}`}
                className="aspect-square rounded-lg object-cover w-full"
              />
            ))}
          </div>
          {submission.contractorNote && (
            <p className="text-body-sm text-on-surface-variant mt-3 italic">
              &ldquo;{submission.contractorNote}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Analysis in progress */}
      {milestone.status === "SUBMITTED" && (
        <div className="space-y-6 animate-pulse-subtle">
          <div className="card-enforcer flex flex-col items-center justify-center py-8 gap-4 border-primary/20 bg-primary/5">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="font-heading text-xl text-primary font-medium">Gemini Vision Analysis in Progress</p>
              <p className="text-sm text-muted-foreground">
                Verifying site photos against acceptance criteria...
              </p>
            </div>
          </div>

          {/* Skeleton mimicking the AI Verdict Panel */}
          <div className="card-enforcer bg-background border-none shadow-none p-0 mb-6 space-y-4 opacity-60">
            <div className="h-6 bg-secondary rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-secondary rounded-full w-full"></div>
          </div>

          <div className="card-enforcer opacity-60 space-y-4">
             <div className="h-5 bg-secondary rounded w-1/4 mb-4"></div>
             <div className="h-12 bg-secondary/50 rounded-lg w-full"></div>
             <div className="h-12 bg-secondary/50 rounded-lg w-full"></div>
             <div className="h-12 bg-secondary/50 rounded-lg w-full"></div>
          </div>
        </div>
      )}

      {/* AI Verdict */}
      {analysis && (
        <AiVerdictPanel
          analysis={analysis}
          milestoneId={milestoneId}
          milestoneStatus={milestone.status}
          role="owner"
        />
      )}
    </div>
  );
}
