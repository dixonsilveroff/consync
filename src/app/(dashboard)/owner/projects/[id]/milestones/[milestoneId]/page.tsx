"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { AiVerdictPanel } from "@/components/ai-verdict-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Clock, Pencil, Check, X } from "lucide-react";
import { getStatusConfig, formatDate, formatNaira } from "@/lib/utils";
import { toast } from "sonner";

export default function MilestoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const milestoneId = params.milestoneId as Id<"milestones">;
  const projectId = params.id as Id<"projects">;

  const detail = useQuery(api.milestones.getMilestoneDetail, { milestoneId });
  const milestones = useQuery(api.milestones.getMilestones, { projectId });
  const project = useQuery(api.projects.getProject, { projectId });
  const updateValue = useMutation(api.milestones.updateMilestoneValue);

  const [editing, setEditing] = useState(false);
  const [valueInput, setValueInput] = useState("");
  const [valueError, setValueError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (detail === undefined || milestones === undefined || project === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-on-surface-variant font-medium animate-pulse">Loading milestone...</p>
      </div>
    );
  }

  if (!detail || !project) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        Milestone not found or access denied.
      </div>
    );
  }

  const { milestone, submission, analysis, photoUrls } = detail;
  const statusCfg = getStatusConfig(milestone.status);
  const canEdit = milestone.status !== "APPROVED";

  const sumOtherMilestones = (milestones || [])
    .filter((m) => m._id !== milestoneId)
    .reduce((sum, m) => sum + m.valueKobo, 0);
  const remainingBudget = project.totalValueKobo - sumOtherMilestones;

  const handleEdit = () => {
    setValueInput(String(milestone.valueKobo / 100));
    setValueError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    const naira = parseFloat(valueInput);
    if (isNaN(naira) || naira <= 0) {
      setValueError("Enter a valid amount");
      return;
    }
    const kobo = Math.round(naira * 100);
    if (kobo > remainingBudget) {
      setValueError(`Max allowed: ${formatNaira(remainingBudget)}`);
      return;
    }

    setSaving(true);
    try {
      await updateValue({ milestoneId, valueKobo: kobo });
      toast.success("Milestone value updated");
      setEditing(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update";
      setValueError(msg);
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <p className="label-blueprint">Value</p>
            {canEdit && !editing && (
              <button
                onClick={handleEdit}
                className="text-text-muted hover:text-primary transition-colors"
                title="Edit milestone value"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
          {editing ? (
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs text-text-muted">₦</span>
                <input
                  type="number"
                  value={valueInput}
                  onChange={(e) => { setValueInput(e.target.value); setValueError(null); }}
                  className="w-40 font-mono text-sm font-bold bg-background border border-border-strong px-2 py-1 text-text-primary"
                  min="0"
                  step="1000"
                  autoFocus
                />
              </div>
              <p className="font-mono text-[9px] text-text-muted">
                Budget remaining: {formatNaira(remainingBudget)}
              </p>
              {valueError && <p className="font-mono text-[9px] text-danger">{valueError}</p>}
              <div className="flex gap-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-1 text-success hover:bg-success/10 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="p-1 text-danger hover:bg-danger/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="font-mono text-headline-sm text-primary mt-1">
              {formatNaira(milestone.valueKobo)}
            </p>
          )}
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
