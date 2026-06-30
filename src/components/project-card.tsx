"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatNairaShort, getStatusConfig, formatDate, cn } from "@/lib/utils";
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
    <Link href={href} className="block group h-full">
      <div className="bg-surface rounded-none border-2 border-border-strong shadow-none transition-all hover:border-primary flex flex-col h-full relative overflow-hidden">
        {/* Status & Date Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-border-strong bg-background">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-primary rounded-none animate-pulse" />
             <span className="font-mono text-[10px] sm:text-xs tracking-widest uppercase text-text-secondary">{formatDate(project.createdAt)}</span>
           </div>
           <span className={cn(statusConfig.className, "rounded-none text-[10px] px-2 py-1 font-bold border border-border-strong")}>{statusConfig.label}</span>
        </div>

        {/* Main Content */}
        <div className="p-5 flex-grow flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="font-display text-2xl font-bold text-text-primary uppercase leading-none mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="font-mono text-xs tracking-widest text-primary uppercase">
              {project.projectType}
            </p>
            {project.location && (
              <p className="font-mono text-[10px] sm:text-xs text-text-muted mt-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{project.location}</span>
              </p>
            )}
          </div>

          {/* Financials & Progress */}
          <div className="space-y-4 pt-4 border-t border-border-strong border-dashed mt-auto">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
              <div>
                <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-1">Escrow Balance</p>
                <p className="font-mono text-lg sm:text-xl font-bold text-escrow">
                  {formatNairaShort(project.escrowBalanceKobo)}
                </p>
              </div>
              <div className="sm:text-right mt-2 sm:mt-0">
                <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase mb-1">Total Value</p>
                <p className="font-mono text-xs sm:text-sm font-bold text-text-secondary">
                  {formatNairaShort(project.totalValueKobo)}
                </p>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase">Milestones</p>
                <p className="font-mono text-[10px] sm:text-xs font-bold text-primary">
                  {approvedCount}/{milestoneCount}
                </p>
              </div>
              <div className="h-1.5 bg-background border border-border-strong rounded-none w-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-release"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
