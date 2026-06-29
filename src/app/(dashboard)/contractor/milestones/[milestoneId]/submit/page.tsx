"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { VideoUpload } from "@/components/video-upload";
import { AiVerdictPanel } from "@/components/ai-verdict-panel";
import { ArrowLeft, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MilestoneSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const milestoneId = params.milestoneId as Id<"milestones">;

  const detail = useQuery(
    api.milestones.getMilestoneDetail,
    isLoaded && isSignedIn ? { milestoneId } : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-on-surface-variant font-medium animate-pulse">Loading auth...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        Please sign in to view this milestone.
      </div>
    );
  }

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
        Milestone not found.
      </div>
    );
  }

  const { milestone, submission, analysis } = detail;

  const handleBack = () => {
    if (milestone?.projectId) {
      router.push(`/contractor/projects/${milestone.projectId}`);
    } else {
      router.push("/contractor/projects");
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Back */}
      <Button
        variant="ghost"
        onClick={handleBack}
        className="flex items-center gap-1 mb-6 -ml-4 text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Project
      </Button>

      {/* Milestone header */}
      <div className="mb-8 sm:mb-10 pb-6 border-b border-border-strong">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tighter text-text-primary uppercase mb-2">{milestone.name}</h1>
        <p className="font-mono text-xs sm:text-sm text-text-secondary">{milestone.description}</p>
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
          {milestone.acceptanceCriteria.map((c: string, i: number) => (
            <span key={i} className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 bg-background border border-border-strong text-text-secondary">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Main content — depends on current milestone status */}

      {/* Pending: show upload form */}
      {(milestone.status === "PENDING" || milestone.status === "REJECTED") && (
        <div className="bg-surface border border-border-strong p-6 rounded-none">
          <VideoUpload
            milestoneId={milestoneId}
            milestoneName={milestone.name}
            onSuccess={handleBack}
          />
        </div>
      )}

      {/* Analysis in progress */}
      {milestone.status === "SUBMITTED" && (
        <div className="space-y-6 animate-pulse-subtle">
          <div className="bg-surface border border-border-strong flex flex-col items-center justify-center py-12 gap-6 rounded-none px-4 text-center">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="font-display text-lg sm:text-xl text-primary font-bold uppercase tracking-tight">AI Verification in Progress</p>
              <p className="font-mono text-xs tracking-widest text-text-muted uppercase">
                ANALYZING EVIDENCE...
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

      {/* Analysis done / Approved / Rejected — show verdict */}
      {(milestone.status === "ANALYSIS_DONE" ||
        milestone.status === "APPROVED" ||
        milestone.status === "REJECTED") && analysis && (
        <AiVerdictPanel
          analysis={analysis}
          milestoneId={milestoneId}
          milestoneStatus={milestone.status}
          role="contractor"
          rejectionReason={submission?.rejectionReason}
        />
      )}

      {/* Analysis done but no result yet (race condition) */}
      {milestone.status === "ANALYSIS_DONE" && !analysis && (
        <div className="card-enforcer flex items-center gap-3 text-on-surface-variant">
          <Clock className="w-5 h-5" />
          <p className="text-body-md">Loading verdict…</p>
        </div>
      )}

      {/* Submission history */}
      {submission && milestone.status !== "PENDING" && (
        <div className="mt-8 bg-background border border-border-strong p-6 rounded-none">
          <h3 className="font-mono text-xs font-bold tracking-widest text-text-muted mb-4 uppercase border-b border-border-strong pb-2">Submission Log</h3>
          <p className="font-mono text-sm text-text-secondary">
            {submission.frameCount || 0} KEY FRAME{submission.frameCount !== 1 ? "S" : ""} 
            {submission.videoDurationSeconds ? ` | DURATION: ${Math.floor(submission.videoDurationSeconds / 60)}:${(Math.floor(submission.videoDurationSeconds) % 60).toString().padStart(2, '0')}` : ''}
            {' '} | TIMESTAMP:{" "}
            {new Date(submission.submittedAt).toLocaleDateString("en-NG", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
          {submission.contractorNote && (
            <div className="mt-4 p-3 bg-surface border-l-2 border-primary">
              <p className="font-mono text-xs text-text-primary">
                "{submission.contractorNote}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
