"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ShieldQuestion,
  Brain,
} from "lucide-react";

type AnalysisResult = Doc<"analysisResults">;

interface AiVerdictPanelProps {
  analysis: AnalysisResult;
  milestoneId: Doc<"milestones">["_id"];
  milestoneStatus: Doc<"milestones">["status"];
  role: "owner" | "contractor";
}

const statusConfig = {
  CONFIRMED: {
    label: "AI Verdict: Confirmed",
    icon: ShieldCheck,
    className: "bg-success-bg border-success-border text-success",
    iconClass: "text-success",
    barClass: "bg-success",
  },
  NEEDS_REVIEW: {
    label: "AI Verdict: Needs Review",
    icon: ShieldAlert,
    className: "bg-warning-bg border-warning-border text-warning",
    iconClass: "text-warning",
    barClass: "bg-warning",
  },
  UNCONFIRMED: {
    label: "AI Verdict: Unconfirmed",
    icon: ShieldX,
    className: "bg-danger-bg border-danger-border text-danger",
    iconClass: "text-danger",
    barClass: "bg-danger",
  },
  RESUBMIT_REQUIRED: {
    label: "AI Verdict: Resubmit Required",
    icon: ShieldQuestion,
    className: "bg-danger-bg border-danger-border text-danger",
    iconClass: "text-danger",
    barClass: "bg-danger",
  },
};

const criterionStatusConfig = {
  MET: { icon: CheckCircle2, className: "text-primary", label: "Met" },
  NOT_MET: { icon: XCircle, className: "text-destructive", label: "Not Met" },
  CANNOT_VERIFY: { icon: AlertTriangle, className: "text-amber-500", label: "Cannot Verify" },
};

const anomalySeverityConfig = {
  LOW: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  CRITICAL: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AiVerdictPanel({ analysis, milestoneId, milestoneStatus, role }: AiVerdictPanelProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isActing, setIsActing] = useState(false);

  const approveMilestone = useMutation(api.milestones.approveMilestone);
  const rejectMilestone = useMutation(api.milestones.rejectMilestone);

  const statusCfg = statusConfig[analysis.verificationStatus];
  const StatusIcon = statusCfg.icon;

  const handleApprove = async () => {
    setIsActing(true);
    try {
      await approveMilestone({ milestoneId });
      toast.success("Milestone approved. Payment released.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to approve milestone";
      toast.error(message);
    } finally {
      setIsActing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsActing(true);
    try {
      await rejectMilestone({ milestoneId, reason: rejectReason.trim() });
      setShowRejectInput(false);
      toast.success("Milestone rejected.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reject milestone";
      toast.error(message);
    } finally {
      setIsActing(false);
    }
  };

  const canAct = role === "owner" && milestoneStatus === "ANALYSIS_DONE";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status Banner */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${statusCfg.className}`}>
        <StatusIcon className={`w-6 h-6 ${statusCfg.iconClass} flex-shrink-0`} />
        <div className="flex-1">
          <p className="font-heading text-headline-sm">{statusCfg.label}</p>
          <p className="text-body-sm opacity-80 mt-0.5">{analysis.plainSummary}</p>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="card-enforcer bg-background border-none shadow-none p-0 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="label-blueprint flex items-center gap-1.5 text-primary">
             <Brain className="w-4 h-4" /> AI Confidence Score
          </h3>
          <span className="font-mono text-headline-sm text-text-primary font-semibold">
            {analysis.confidenceScore}%
          </span>
        </div>
        <div className="h-2 bg-surface-container-high border border-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${statusCfg.barClass}`}
            style={{ width: `${analysis.confidenceScore}%` }}
          />
        </div>
      </div>

      {/* Criterion Assessments */}
      <div className="card-enforcer">
        <h3 className="label-blueprint mb-4 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Acceptance Criteria Review</h3>
        <div className="space-y-3">
          {analysis.criterionAssessments.map((c, i) => {
            const cfg = criterionStatusConfig[c.status];
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex gap-3 py-3 border-b border-outline/10 last:border-0">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.className}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-on-surface">{c.criterionText}</p>
                  <p className="text-body-sm text-on-surface-variant mt-1">{c.observation}</p>
                </div>
                <span className={`text-label-sm flex-shrink-0 ${cfg.className}`}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anomalies */}
      {analysis.anomalies.length > 0 && (
        <div className="card-enforcer">
          <h3 className="label-blueprint mb-4">Anomalies Detected</h3>
          <div className="space-y-3">
            {analysis.anomalies.map((a, i) => (
              <div
                key={i}
                className={`rounded-lg border px-4 py-3 ${anomalySeverityConfig[a.severity]}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-body-sm font-medium">{a.description}</p>
                  <span className="label-blueprint text-xs px-2 py-0.5 rounded-full border ml-2 flex-shrink-0">
                    {a.severity}
                  </span>
                </div>
                <p className="text-body-sm opacity-80">{a.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visibility Notes */}
      {analysis.visibilityNotes && (
        <div className="flex gap-3 px-4 py-3 bg-surface-container-high rounded-lg">
          <Clock className="w-4 h-4 text-on-surface-variant flex-shrink-0 mt-0.5" />
          <p className="text-body-sm text-on-surface-variant">{analysis.visibilityNotes}</p>
        </div>
      )}

      {/* Owner Actions */}
      {canAct && (
        <div className="card-enforcer border-2 border-primary/20">
          <h3 className="label-blueprint mb-4">Owner Decision</h3>

          {!showRejectInput ? (
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={isActing}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isActing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ThumbsUp className="w-4 h-4" />
                )}
                Approve & Release Payment
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectInput(true)}
                disabled={isActing}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="label-blueprint block">Rejection Reason (required)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain what needs to be corrected before resubmission..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-outline/40 bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isActing}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                  Confirm Rejection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed / Rejected final states */}
      {milestoneStatus === "APPROVED" && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-body-md font-medium">Milestone approved — payment release initiated.</p>
        </div>
      )}
      {milestoneStatus === "REJECTED" && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
          <RefreshCw className="w-4 h-4" />
          <p className="text-body-md font-medium">Milestone rejected — awaiting contractor resubmission.</p>
        </div>
      )}
    </div>
  );
}
