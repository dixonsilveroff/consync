"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { MilestoneList } from "@/components/milestone-list";
import { EscrowBalance } from "@/components/escrow-balance";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getStatusConfig, formatDate, formatNaira, cn } from "@/lib/utils";
import { toast } from "sonner";

export default function OwnerProjectDashboard() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.projects.getProject, { projectId });
  const milestones = useQuery(api.milestones.getMilestones, { projectId });
  const initiateEscrow = useAction(api.paystack.initiateEscrowFunding);

  const [funding, setFunding] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("payment") === "success" || url.searchParams.has("trxref")) {
        toast.success("Payment checkout completed! Escrow balance will update shortly.");
        url.searchParams.delete("payment");
        url.searchParams.delete("trxref");
        url.searchParams.delete("reference");
        window.history.replaceState({}, document.title, url.toString());
      }
    }
  }, []);

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

  const handleFundEscrow = async () => {
    setFunding(true);
    try {
      const result = await initiateEscrow({
        projectId,
        amountKobo: project.totalValueKobo,
        ownerEmail: project.contractorEmail || "owner@example.com",
        callbackUrl: window.location.href.split('?')[0] + '?payment=success',
      });
      if (result?.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      }
    } catch (e) {
      console.error(e);
      alert("Failed to initiate escrow funding.");
      setFunding(false);
    }
  };


  return (
    <div className="animate-fade-in relative">
      {/* Back Link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/owner/projects")}
        className="flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Projects
      </Button>

      {/* Project Header */}
      <div className="flex flex-col items-start gap-4 mb-12 border-b-2 border-border-strong pb-8 mt-2">
        <div className="w-full flex flex-col md:flex-row md:items-start justify-between gap-4">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-text-primary uppercase leading-none break-words">
            {project.name}
          </h1>
          <span className={cn(statusConfig.className, "shrink-0 rounded-none border-2 border-border-strong text-sm px-4 py-2 font-bold uppercase tracking-widest")}>
            {statusConfig.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-[10px] sm:text-xs tracking-widest text-text-secondary uppercase mt-2">
          <span className="bg-primary/10 text-primary px-3 py-1 font-bold border border-primary/20">{project.projectType}</span>
          {project.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {project.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(project.createdAt)}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Milestone List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-border-strong">
            <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary">
              VERIFICATION PROTOCOL
            </h2>
            <p className="font-mono text-xs font-bold tracking-widest text-success">
              {milestones.filter((m: { status: string }) => m.status === "APPROVED").length}/
              {milestones.length} COMPLETED
            </p>
          </div>
          <div className="bg-background">
            <MilestoneList
              milestones={milestones}
              projectId={projectId}
              role="owner"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          <EscrowBalance
            totalValueKobo={project.totalValueKobo}
            escrowBalanceKobo={project.escrowBalanceKobo}
            projectStatus={project.status}
            onFundEscrow={handleFundEscrow}
            isFunding={funding}
          />

          {/* Project Info */}
          <div className="bg-surface border border-border-strong p-8 rounded-none">
            <h3 className="font-mono text-xs font-bold tracking-widest text-text-muted mb-6 uppercase border-b border-border-strong pb-2">Technical Specs</h3>
            {project.description && (
              <p className="text-base text-text-secondary mb-8 leading-relaxed">
                {project.description}
              </p>
            )}
            <div className="space-y-6">
              {project.contractorEmail && (
                <div>
                  <p className="font-mono text-xs tracking-widest text-text-muted mb-2">CONTRACTOR IDENTITY</p>
                  <p className="font-mono text-sm text-text-primary font-bold">
                    {project.contractorEmail}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

