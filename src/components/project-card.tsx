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
      <div className="card-enforcer transition-all duration-200 hover:bg-surface-container-highest">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="label-blueprint mt-0.5">{project.projectType}</p>
            </div>
          </div>
          <span className={statusConfig.className}>{statusConfig.label}</span>
        </div>

        {/* Location */}
        {project.location && (
          <div className="flex items-center gap-2 mb-4 text-body-sm text-on-surface-variant">
            <MapPin className="w-3.5 h-3.5" />
            {project.location}
          </div>
        )}

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="label-blueprint">Project Value</p>
            <p className="font-heading text-headline-sm text-on-surface mt-1">
              {formatNairaShort(project.totalValueKobo)}
            </p>
          </div>
          <div>
            <p className="label-blueprint">Escrow Balance</p>
            <p className="font-heading text-headline-sm text-primary mt-1">
              {formatNairaShort(project.escrowBalanceKobo)}
            </p>
          </div>
        </div>

        {/* Milestone Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label-blueprint">Milestones</p>
            <p className="text-label-sm text-on-surface-variant">
              {approvedCount}/{milestoneCount}
            </p>
          </div>
          <div className="h-1 bg-surface-container-low w-full">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4">
          <p className="text-body-sm text-on-surface-variant">
            Created {formatDate(project.createdAt)}
          </p>
          {project.contractorEmail && (
            <div className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
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
