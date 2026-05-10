"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ProjectCard } from "@/components/project-card";
import { FolderPlus, Building2 } from "lucide-react";
import Link from "next/link";

export default function OwnerProjectsPage() {
  const projects = useQuery(api.projects.getOwnerProjects);

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-display-sm text-on-surface">
            Projects
          </h1>
          <p className="text-body-lg text-on-surface-variant mt-1">
            Manage your construction projects and milestone payments
          </p>
        </div>
        <Link href="/owner/projects/new" className="btn-primary flex items-center gap-2">
          <FolderPlus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Loading State */}
      {projects === undefined && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-enforcer animate-pulse-subtle h-64"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {projects !== undefined && projects.length === 0 && (
        <div className="card-enforcer text-center py-16">
          <Building2 className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
          <h2 className="font-heading text-headline-md text-on-surface mb-2">
            No projects yet
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-6 max-w-md mx-auto">
            Create your first construction project to start tracking milestones
            and managing payments.
          </p>
          <Link href="/owner/projects/new" className="btn-primary inline-flex items-center gap-2">
            <FolderPlus className="w-4 h-4" />
            Create Project
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
