"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { formatNaira, getStatusConfig, cn } from "@/lib/utils";
import { Doc } from "@convex/_generated/dataModel";

interface MilestoneListProps {
  milestones: Doc<"milestones">[];
  projectId: string;
  role: "owner" | "contractor";
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Circle className="w-4 h-4 text-on-surface-variant" />,
  SUBMITTED: <Clock className="w-4 h-4 text-warning-amber" />,
  ANALYSIS_DONE: <AlertTriangle className="w-4 h-4 text-primary" />,
  APPROVED: <CheckCircle2 className="w-4 h-4 text-control-green" />,
  REJECTED: <XCircle className="w-4 h-4 text-critical-red" />,
};

export function MilestoneList({
  milestones,
  projectId,
  role,
}: MilestoneListProps) {
  if (milestones.length === 0) {
    return (
      <div className="border border-border-strong bg-surface text-center py-16">
        <p className="font-mono text-sm tracking-widest text-text-muted uppercase">
          NO MILESTONES ALLOCATED
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-border-strong">
      {milestones.map((milestone, index) => {
        const statusConfig = getStatusConfig(milestone.status);
        const href =
          role === "owner"
            ? `/owner/projects/${projectId}/milestones/${milestone._id}`
            : `/contractor/milestones/${milestone._id}/submit`;

        return (
          <Link key={milestone._id} href={href} className="block group border-b border-border-strong bg-background hover:bg-surface transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-8 py-5 sm:py-6">
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto flex-1 min-w-0">
                {/* Order Index */}
                <div className="font-mono text-xs font-bold text-text-muted tracking-widest uppercase flex-shrink-0 w-6 sm:w-8">
                  {String(milestone.orderIndex).padStart(2, '0')}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-display text-base sm:text-lg font-bold text-text-primary group-hover:text-primary transition-colors truncate uppercase tracking-tight">
                      {milestone.name}
                    </h4>
                    {statusIcons[milestone.status] || statusIcons.PENDING}
                  </div>
                  <p className="font-mono text-[10px] sm:text-xs text-text-secondary truncate">
                    {milestone.description}
                  </p>
                </div>
              </div>

              {/* Value & Status */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-2 mt-2 sm:mt-0 pl-10 sm:pl-0">
                <p className="font-mono text-base sm:text-lg font-bold text-text-primary">
                  {formatNaira(milestone.valueKobo)}
                </p>
                <span className={cn(statusConfig.className, "rounded-none border border-border-strong px-2 py-0.5 text-[10px]")}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
