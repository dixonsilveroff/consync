"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ProjectCard } from "@/components/project-card";
import { FolderPlus, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OwnerProjectsPage() {
  const projects = useQuery(api.projects.getOwnerProjects);

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h1 text-text-primary">
            Projects
          </h1>
          <p className="text-body text-text-secondary mt-1">
            Manage your construction projects and milestone payments
          </p>
        </div>
        <Link href="/owner/projects/new">
          <Button size="lg" className="gap-2 bg-cta-gradient hover:bg-cta-gradient-hover text-white shadow-sm hover:shadow-md transition-shadow">
            <FolderPlus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
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
        <div className="bg-background rounded-xl border border-border text-center py-20 px-6 shadow-sm">
          <div className="w-16 h-16 bg-surface border border-border shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-h3 text-text-primary mb-3">
            No projects yet
          </h2>
          <p className="text-body text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
            Create your first construction project to start tracking milestones, generating escrow accounts, and releasing payments securely.
          </p>
          <Link href="/owner/projects/new">
            <Button size="lg" className="gap-2 bg-cta-gradient hover:bg-cta-gradient-hover text-white shadow-sm hover:shadow-md transition-shadow">
              <FolderPlus className="w-4 h-4" />
              Start First Project
            </Button>
          </Link>
        </div>
      )}

      {/* Project Grid */}
      {projects !== undefined && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {projects.map((project: any) => (
            <ProjectCard
              key={project._id}
              project={project}
              role="owner"
            />
          ))}
        </div>
      )}
    </div>
  );
}
