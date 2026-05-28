"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";
import { PhotoUpload } from "@/components/photo-upload";
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
      <div className="mb-8">
        <h1 className="font-heading text-display-sm text-on-surface">{milestone.name}</h1>
        <p className="text-body-md text-on-surface-variant mt-1">{milestone.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {milestone.acceptanceCriteria.map((c: string, i: number) => (
            <span key={i} className="label-blueprint text-xs px-2 py-1 bg-primary/8 rounded-md">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Main content — depends on current milestone status */}

      {/* Pending: show upload form */}
      {(milestone.status === "PENDING" || milestone.status === "REJECTED") && (
        <div className="card-enforcer">
          <PhotoUpload
            milestoneId={milestoneId}
            milestoneName={milestone.name}
            onSuccess={handleBack}
          />
        </div>
      )}

      {/* Analysis in progress */}
      {milestone.status === "SUBMITTED" && (
        <div className="space-y-6 animate-pulse-subtle">
          <div className="card-enforcer flex flex-col items-center justify-center py-8 gap-4 border-primary/20 bg-primary/5">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="font-heading text-xl text-primary font-medium">AI Verification in Progress</p>
              <p className="text-sm text-muted-foreground">
                Our AI engine is reviewing your photos. This usually takes 15–30 seconds.
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
        <div className="mt-6 card-enforcer">
          <h3 className="label-blueprint mb-3">Submitted Photos</h3>
          <p className="text-body-sm text-on-surface-variant">
            {submission.photoCount} photo{submission.photoCount !== 1 ? "s" : ""} submitted on{" "}
            {new Date(submission.submittedAt).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {submission.contractorNote && (
            <p className="text-body-sm text-on-surface mt-2 italic">
              &ldquo;{submission.contractorNote}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
