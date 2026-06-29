"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { MilestoneList } from "@/components/milestone-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Building2, Calendar, Loader2 } from "lucide-react";
import { getStatusConfig, formatDate, cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

export default function ContractorProjectDashboard() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.projects.getProject, { projectId });
  const milestones = useQuery(api.milestones.getMilestones, { projectId });

  const [demoBypass, setDemoBypass] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("consync_demo_bypass");
    if (saved === "true") setDemoBypass(true);
  }, []);

  const handleBypassChange = (val: boolean) => {
    setDemoBypass(val);
    localStorage.setItem("consync_demo_bypass", val ? "true" : "false");
  };

  // Loading state
  if (project === undefined || milestones === undefined) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-on-surface-variant font-medium animate-pulse">Loading project...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-surface-container-high animate-pulse-subtle" />
          <div className="h-64 bg-surface-container-high animate-pulse-subtle" />
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="animate-fade-in p-8 text-center text-on-surface-variant">
        Project not found or access denied.
      </div>
    );
  }

  const statusConfig = getStatusConfig(project.status);

  return (
    <div className="animate-fade-in">
      {/* Back Link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/contractor/projects")}
        className="flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Projects
      </Button>

      {/* Project Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="font-heading text-display-sm text-on-surface">
              {project.name}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-body-md text-on-surface-variant">
            <span className="label-blueprint">{project.projectType}</span>
            {project.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {project.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(project.createdAt)}
            </span>
          </div>
        </div>
        <span className={statusConfig.className}>{statusConfig.label}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milestone List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-headline-sm text-on-surface">
              Milestones
            </h2>
            <p className="text-label-sm text-on-surface-variant">
              {milestones.filter((m: { status: string }) => m.status === "APPROVED").length}/
              {milestones.length} completed
            </p>
          </div>
          <div className="bg-surface-container-high">
            <MilestoneList
              milestones={milestones}
              projectId={projectId}
              role="contractor"
              demoBypass={demoBypass}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="card-enforcer">
            <h3 className="label-blueprint mb-4">Project Details</h3>
            {project.description ? (
              <p className="text-body-md text-on-surface-variant mb-4">
                {project.description}
              </p>
            ) : (
              <p className="text-body-md text-text-muted italic mb-4">
                No additional description provided for this project.
              </p>
            )}
          </div>

          <div className={cn("card-enforcer border transition-colors", demoBypass ? "border-primary bg-primary/5" : "")}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="label-blueprint text-text-primary">Demo Bypass</h3>
              <Switch checked={demoBypass} onCheckedChange={handleBypassChange} />
            </div>
            <p className="text-[10px] text-text-muted font-mono leading-tight">
              Enable Developer Mode to bypass milestone dependency locks and submit to any milestone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
