"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { MilestoneList } from "@/components/milestone-list";
import { EscrowBalance } from "@/components/escrow-balance";
import { ArrowLeft, MapPin, Building2, Calendar, Loader2, Copy, CheckCircle2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getStatusConfig, formatDate, formatNaira } from "@/lib/utils";

type DvaDetails = {
  virtualAccountNumber: string;
  bankName: string;
  expectedAmountKobo: number;
  expiresAt: number;
};

export default function OwnerProjectDashboard() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as Id<"projects">;

  const project = useQuery(api.projects.getProject, { projectId });
  const milestones = useQuery(api.milestones.getMilestones, { projectId });
  const initiateEscrow = useAction(api.squad.initiateEscrowViaDva);

  const [funding, setFunding] = useState(false);
  const [dvaDetails, setDvaDetails] = useState<DvaDetails | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!dvaDetails) return;

    const updateTimer = () => {
      const now = Date.now();
      const difference = dvaDetails.expiresAt - now;

      if (difference <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer(); // Initial call
    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [dvaDetails]);

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
        setDvaDetails({
          virtualAccountNumber: result.virtualAccountNumber,
          bankName: result.bankName,
          expectedAmountKobo: result.expectedAmountKobo,
          expiresAt: result.expiresAt
        });
      }
    } catch (e) {
      console.error(e);
      alert("Failed to initiate escrow funding.");
    } finally {
      setFunding(false);
    }
  };

  const handleCopy = () => {
    if (dvaDetails) {
      navigator.clipboard.writeText(dvaDetails.virtualAccountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="animate-fade-in relative">
      {/* DVA Modal */}
      {dvaDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-border bg-surface-container-low">
              <h3 className="font-heading text-headline-sm text-on-surface">Fund Escrow</h3>
              <button
                onClick={() => setDvaDetails(null)}
                className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <p className="text-body-sm text-on-surface-variant mb-1">Transfer Exactly</p>
                <p className="font-heading text-display-sm text-primary">
                  {formatNaira(dvaDetails.expectedAmountKobo)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="label-blueprint mb-1">Bank Name</p>
                  <p className="font-medium text-on-surface">{dvaDetails.bankName}</p>
                </div>

                <div>
                  <p className="label-blueprint mb-1">Account Number</p>
                  <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-lg border border-border">
                    <span className="font-mono text-lg text-on-surface tracking-wider">
                      {dvaDetails.virtualAccountNumber}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-surface hover:bg-surface-container border border-border rounded-md transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="label-blueprint mb-1">Expires In</p>
                  <p className={`text-body-md flex items-center gap-2 ${timeLeft === "Expired" ? "text-red-500 font-bold" : "text-on-surface"}`}>
                    <Calendar className={`w-4 h-4 ${timeLeft === "Expired" ? "text-red-500" : "text-on-surface-variant"}`} />
                    {timeLeft === "Expired" ? "Expired" : `${timeLeft} minutes`}
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/10 text-amber-600 p-4 rounded-lg text-sm leading-relaxed border border-amber-500/20">
                <strong className="font-semibold block mb-1">⚠️ Important:</strong>
                Send the <b>exact amount</b> shown above in a single transaction. Any other amount will be automatically refunded by Squad.
              </div>
            </div>
          </div>
        </div>
      )}

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
