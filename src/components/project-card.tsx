"use client";

import Link from "next/link";
import { Building2, MapPin, Users } from "lucide-react";
import { formatNairaShort, getStatusConfig, formatDate } from "@/lib/utils";
import { Doc } from "@convex/_generated/dataModel";

interface ProjectCardProps {
  project: Doc<"projects">;
  milestoneCount?: number;
  approvedCount?: number;
  role: "owner" | "contractor";
}

export function ProjectCard({
  project,
  milestoneCount = 0,
  approvedCount = 0,
  role,
}: ProjectCardProps) {
  const statusConfig = getStatusConfig(project.status);
  const progress =
    milestoneCount > 0
      ? Math.round((approvedCount / milestoneCount) * 100)
      : 0;

  const href =
    role === "owner"
      ? `/owner/projects/${project._id}`
      : `/contractor/projects/${project._id}`;

  return (
    <Link href={href} className="block group">
      <div className="bg-surface rounded-xl border border-border shadow-sm p-6 transition-all duration-base hover:border-primary hover:shadow-md">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-faint rounded-md flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-h3 text-text-primary group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-micro font-medium text-text-secondary uppercase tracking-wider mt-0.5">
                {project.projectType}
              </p>
            </div>
          </div>
          <span className={statusConfig.className}>{statusConfig.label}</span>
        </div>

        {/* Location */}
        {project.location && (
          <div className="flex items-center gap-2 mb-4 text-small text-text-muted">
            <MapPin className="w-3.5 h-3.5" />
            {project.location}
          </div>
        )}

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4 pt-2 border-t border-border">
          <div>
            <p className="text-micro font-medium text-text-secondary uppercase tracking-wider">Project Value</p>
            <p className="font-mono text-h4 text-text-primary mt-1">
              {formatNairaShort(project.totalValueKobo)}
            </p>
          </div>
          <div>
            <p className="text-micro font-medium text-text-secondary uppercase tracking-wider">Escrow Balance</p>
            <p className="font-mono text-h4 text-escrow mt-1">
              {formatNairaShort(project.escrowBalanceKobo)}
            </p>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-micro font-medium text-text-secondary uppercase tracking-wider">Milestones</p>
            <p className="text-small text-text-muted">
              {approvedCount}/{milestoneCount}
            </p>
          </div>
          <div className="h-1.5 bg-border rounded-full w-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-release"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="text-small text-text-muted">
            Created {formatDate(project.createdAt)}
          </p>
          {project.contractorEmail && (
            <div className="flex items-center gap-1.5 text-small text-text-muted">
              <Users className="w-3.5 h-3.5" />
              <span className="truncate max-w-[140px]">
                {project.contractorEmail}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
