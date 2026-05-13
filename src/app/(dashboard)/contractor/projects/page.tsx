"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ProjectCard } from "@/components/project-card";
import { Building2, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContractorProjectsPage() {
  const projects = useQuery(api.projects.getContractorProjects);

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h1 text-text-primary">
            Assigned Projects
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Projects where you are the assigned contractor
          </p>
        </div>
      </div>

      {/* Loading State */}
      {projects === undefined && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-on-surface-variant font-medium animate-pulse">Loading projects...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface rounded-xl border border-border h-64 animate-pulse-subtle"
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {projects !== undefined && projects.length === 0 && (
        <div className="bg-surface rounded-xl border border-border text-center py-16 px-6">
          <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="font-display text-h2 text-text-primary mb-2">
            No projects assigned
          </h2>
          <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
            You haven't been assigned to any construction projects yet. 
            Once an owner invites you via email, projects will appear here.
          </p>
        </div>
      )}

      {/* Project Grid */}
      {projects !== undefined && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <ProjectCard
              key={project._id}
              project={project}
              role="contractor"
            />
          ))}
        </div>
      )}
    </div>
  );
}
