"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ProjectCard } from "@/components/project-card";
import { FolderPlus, Building2 } from "lucide-react";
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
          <Button variant="default" className="gap-2">
            <FolderPlus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {projects === undefined && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-xl border border-border h-64 animate-pulse-subtle"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {projects !== undefined && projects.length === 0 && (
        <div className="bg-surface rounded-xl border border-border text-center py-16 px-6">
          <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="font-display text-h2 text-text-primary mb-2">
            No projects yet
          </h2>
          <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
            Create your first construction project to start tracking milestones
            and managing payments.
          </p>
          <Link href="/owner/projects/new">
            <Button variant="default" className="gap-2">
              <FolderPlus className="w-4 h-4" />
              Create Project
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
