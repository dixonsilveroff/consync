"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useState } from "react";
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
    label: "Confirmed",
    icon: ShieldCheck,
    className: "bg-emerald-50 border-emerald-200 text-emerald-700",
    iconClass: "text-emerald-500",
    barClass: "bg-emerald-500",
  },
  NEEDS_REVIEW: {
    label: "Needs Review",
    icon: ShieldAlert,
    className: "bg-amber-50 border-amber-200 text-amber-700",
    iconClass: "text-amber-500",
    barClass: "bg-amber-500",
  },
  UNCONFIRMED: {
    label: "Unconfirmed",
    icon: ShieldX,
    className: "bg-red-50 border-red-200 text-red-700",
    iconClass: "text-red-500",
    barClass: "bg-red-500",
  },
  RESUBMIT_REQUIRED: {
    label: "Resubmit Required",
    icon: ShieldQuestion,
    className: "bg-orange-50 border-orange-200 text-orange-700",
    iconClass: "text-orange-500",
    barClass: "bg-orange-400",
  },
};

const criterionStatusConfig = {
  MET: { icon: CheckCircle2, className: "text-emerald-600", label: "Met" },
  NOT_MET: { icon: XCircle, className: "text-red-500", label: "Not Met" },
  CANNOT_VERIFY: { icon: AlertTriangle, className: "text-amber-500", label: "Cannot Verify" },
};

const anomalySeverityConfig = {
  LOW: "bg-blue-50 text-blue-700 border-blue-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
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
      <div className="card-enforcer">
        <div className="flex items-center justify-between mb-3">
          <h3 className="label-blueprint">AI Confidence Score</h3>
          <span className="font-mono text-headline-sm text-on-surface font-semibold">
            {analysis.confidenceScore}%
          </span>
        </div>
        <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${statusCfg.barClass}`}
            style={{ width: `${analysis.confidenceScore}%` }}
          />
        </div>
      </div>

      {/* Criterion Assessments */}
      <div className="card-enforcer">
        <h3 className="label-blueprint mb-4">Acceptance Criteria Review</h3>
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
              <button
                onClick={handleApprove}
                disabled={isActing}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isActing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ThumbsUp className="w-4 h-4" />
                )}
                Approve & Release Payment
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={isActing}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>
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
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isActing}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
                  Confirm Rejection
                </button>
                <button
                  onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed / Rejected final states */}
      {milestoneStatus === "APPROVED" && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-body-md font-medium">Milestone approved — payment release initiated.</p>
        </div>
      )}
      {milestoneStatus === "REJECTED" && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <RefreshCw className="w-4 h-4" />
          <p className="text-body-md font-medium">Milestone rejected — awaiting contractor resubmission.</p>
        </div>
      )}
    </div>
  );
}
