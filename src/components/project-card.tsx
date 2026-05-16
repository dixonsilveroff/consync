"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, ArrowRight } from "lucide-react";
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
      <div className="bg-surface rounded-xl border border-border shadow-sm p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-md h-full flex flex-col relative overflow-hidden">
        {/* Subtle decorative background matching landing page */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cta-gradient opacity-[0.03] rounded-bl-full -z-10 group-hover:opacity-10 transition-opacity" />

        {/* Header */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-faint rounded-lg flex items-center justify-center border border-primary/10 overflow-hidden shrink-0">
               <Image src="/logo.png" alt="ConSync" width={24} height={24} className="opacity-80" />
            </div>
            <div>
              <h3 className="font-display text-h4 text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                {project.name}
              </h3>
              <p className="text-micro font-medium text-text-secondary uppercase tracking-wider mt-1 line-clamp-1">
                {project.projectType}
              </p>
            </div>
          </div>
          <span className={`${statusConfig.className} shrink-0 ml-2`}>{statusConfig.label}</span>
        </div>

        {/* Location */}
        {project.location && (
          <div className="flex items-center gap-2 mb-5 text-small text-text-muted">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
        )}

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4 mb-5 p-4 rounded-lg bg-background border border-border mt-auto">
          <div>
            <p className="text-micro font-medium text-text-secondary uppercase tracking-wider mb-1">Project Value</p>
            <p className="font-mono text-body font-semibold text-text-primary">
              {formatNairaShort(project.totalValueKobo)}
            </p>
          </div>
          <div>
            <p className="text-micro font-medium text-text-secondary uppercase tracking-wider mb-1">Escrow Balance</p>
            <p className="font-mono text-body font-semibold text-escrow">
              {formatNairaShort(project.escrowBalanceKobo)}
            </p>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-micro font-medium text-text-secondary uppercase tracking-wider">Milestones</p>
            <p className="text-small font-medium text-primary">
              {approvedCount} <span className="text-text-muted font-normal">/ {milestoneCount}</span>
            </p>
          </div>
          <div className="h-2 bg-background border border-border rounded-full w-full overflow-hidden">
            <div
              className="h-full bg-cta-gradient transition-all duration-release"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
           <div className="flex items-center gap-2 text-micro text-text-muted">
             <span>Created {formatDate(project.createdAt)}</span>
           </div>

           <div className="flex items-center text-primary text-small font-medium group-hover:translate-x-1 transition-transform">
             View Details <ArrowRight className="w-4 h-4 ml-1" />
           </div>
        </div>
      </div>
    </Link>
  );
}
