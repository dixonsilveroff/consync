"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { MilestoneList } from "@/components/milestone-list";
import { EscrowBalance } from "@/components/escrow-balance";
import { ArrowLeft, MapPin, Building2, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { getStatusConfig, formatDate } from "@/lib/utils";

export default function OwnerProjectDashboard() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.projects.getProject, { projectId });
  const milestones = useQuery(api.milestones.getMilestones, { projectId });
  const initiateEscrow = useAction(api.squad.initiateEscrowViaDva);
  const [funding, setFunding] = useState(false);

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
      // 1 hour duration for DVA
      const result = await initiateEscrow({
        projectId,
        amountKobo: project.totalValueKobo,
        ownerEmail: project.contractorEmail || "owner@example.com", // Assuming we have owner's email, using fallback for now
        durationSecs: 3600
      });
      if (result) {
        // Here we'd normally show the virtual account details returned from result.
        // E.g. result.virtualAccountNumber, result.bankName, result.expectedAmountKobo.
        // For the sake of the existing UI flow, you might need a modal or state change to show these.
        alert(`Please transfer ${result.expectedAmountKobo / 100} NGN to ${result.bankName} Account: ${result.virtualAccountNumber}. Expires in 1 hour.`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to initiate escrow funding.");
    } finally {
      setFunding(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Back Link */}
      <button
        onClick={() => router.push("/owner/projects")}
        className="btn-tertiary flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        All Projects
      </button>

      {/* Money Bar */}
      {project.status === "ACTIVE" && (
        <div className="money-bar mb-6">
          <div className="flex items-center gap-2">
            <span className="label-blueprint text-primary/70">
              ESCROW BALANCE
            </span>
          </div>
          <span className="font-heading text-headline-sm text-primary">
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 0,
            }).format(project.escrowBalanceKobo / 100)}
          </span>
        </div>
      )}

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
              role="owner"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <EscrowBalance
            totalValueKobo={project.totalValueKobo}
            escrowBalanceKobo={project.escrowBalanceKobo}
            projectStatus={project.status}
            onFundEscrow={handleFundEscrow}
            isFunding={funding}
          />

          {/* Project Info */}
          <div className="card-enforcer">
            <h3 className="label-blueprint mb-4">Project Details</h3>
            {project.description && (
              <p className="text-body-md text-on-surface-variant mb-4">
                {project.description}
              </p>
            )}
            <div className="space-y-3">
              {project.contractorEmail && (
                <div>
                  <p className="label-blueprint">Contractor</p>
                  <p className="text-body-md text-on-surface mt-1">
                    {project.contractorEmail}
                  </p>
                </div>
              )}
              {project.squadVirtualAccountNumber && (
                <div>
                  <p className="label-blueprint">Virtual Account</p>
                  <p className="text-body-md text-primary font-mono mt-1">
                    {project.squadVirtualAccountNumber}
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
