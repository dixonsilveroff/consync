"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { formatNaira, getStatusConfig } from "@/lib/utils";
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
      <div className="card-enforcer text-center py-12">
        <p className="text-on-surface-variant text-body-lg">
          No milestones defined yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {milestones.map((milestone, index) => {
        const statusConfig = getStatusConfig(milestone.status);
        const href =
          role === "owner"
            ? `/owner/projects/${projectId}/milestones/${milestone._id}`
            : `/contractor/projects/${projectId}`;

        return (
          <Link key={milestone._id} href={href} className="block group">
            <div className="flex items-center gap-4 px-6 py-5 transition-all duration-200 hover:bg-surface-container-high">
              {/* Order Index */}
              <div className="w-8 h-8 flex items-center justify-center bg-surface-container-low text-on-surface-variant text-label-lg font-heading font-semibold flex-shrink-0">
                {milestone.orderIndex}
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {statusIcons[milestone.status] || statusIcons.PENDING}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-label-lg text-on-surface font-body font-medium group-hover:text-primary transition-colors truncate">
                  {milestone.name}
                </h4>
                <p className="text-body-sm text-on-surface-variant mt-0.5 truncate">
                  {milestone.description}
                </p>
              </div>

              {/* Value */}
              <div className="text-right flex-shrink-0">
                <p className="font-heading text-label-lg text-on-surface">
                  {formatNaira(milestone.valueKobo)}
                </p>
                <span className={statusConfig.className}>
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* Separator — tonal shift, not a border */}
            {index < milestones.length - 1 && (
              <div className="h-px bg-surface-container-low mx-6" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
