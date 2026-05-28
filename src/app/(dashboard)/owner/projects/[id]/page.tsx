"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { MilestoneList } from "@/components/milestone-list";
import { EscrowBalance } from "@/components/escrow-balance";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Building2, Calendar, Loader2, Copy, CheckCircle2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getStatusConfig, formatDate, formatNaira } from "@/lib/utils";
import { toast } from "sonner";

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

  // Watch for successful funding to close modal and show toast
  useEffect(() => {
    if (dvaDetails && project?.status === "ACTIVE") {
      setDvaDetails(null);
      toast.success("Project funding was successful!");
    }
  }, [project?.status, dvaDetails]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glassmorphic-widget w-full max-w-md rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-border/50 bg-background/50">
              <h3 className="font-heading text-headline-sm text-foreground">Fund Escrow</h3>
              <button
                onClick={() => setDvaDetails(null)}
                className="p-2 hover:bg-surface-raised rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <p className="text-body-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">Transfer Exactly</p>
                <p className="font-mono text-4xl font-bold tracking-tight text-primary">
                  {formatNaira(dvaDetails.expectedAmountKobo)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="label-blueprint mb-1">Bank Name</p>
                  <p className="font-medium text-foreground text-lg">{dvaDetails.bankName}</p>
                </div>

                <div>
                  <p className="label-blueprint mb-1">Virtual Account Number</p>
                  <div className="flex items-center justify-between bg-primary/10 p-4 rounded-xl border border-primary/20 group hover:border-primary/40 transition-colors">
                    <span className="font-mono text-2xl font-bold tracking-widest text-primary">
                      {dvaDetails.virtualAccountNumber}
                    </span>
                    <button
                      onClick={handleCopy}
                      className={`p-3 rounded-lg flex items-center gap-2 transition-all duration-300 ${copied ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground hover:bg-primary-dark shadow-md hover:shadow-lg'}`}
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm font-medium">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="label-blueprint mb-1">Expires In</p>
                  <p className={`text-body-md font-medium flex items-center gap-2 ${timeLeft === "Expired" ? "text-destructive font-bold" : "text-foreground"}`}>
                    <Calendar className={`w-4 h-4 ${timeLeft === "Expired" ? "text-destructive" : "text-muted-foreground"}`} />
                    {timeLeft === "Expired" ? "Expired" : `${timeLeft} minutes`}
                  </p>
                </div>
              </div>

              <div className="bg-warning/10 text-warning p-4 rounded-xl text-sm leading-relaxed border border-warning/20">
                <strong className="font-semibold block mb-1">⚠️ Important:</strong>
                Send the <b>exact amount</b> shown above in a single transaction. Any other amount will be automatically refunded.
              </div>

              {timeLeft !== "Expired" && (
                <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium pt-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="animate-pulse-subtle">Listening for secure transfer...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
      <div className="flex items-start justify-between mb-12 border-b border-border-strong pb-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="font-display text-5xl font-bold tracking-tighter text-text-primary uppercase">
              {project.name}
            </h1>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs tracking-widest text-text-secondary uppercase">
            <span className="bg-primary/10 text-primary px-3 py-1 font-bold">{project.projectType}</span>
            {project.location && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {project.location}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(project.createdAt)}
            </span>
          </div>
        </div>
        <span className={cn(statusConfig.className, "rounded-none border border-border-strong text-sm px-4 py-2")}>{statusConfig.label}</span>
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
              {project.squadVirtualAccountNumber && (
                <div>
                  <p className="font-mono text-xs tracking-widest text-text-muted mb-2">ESCROW VAULT ID</p>
                  <div className="bg-primary/5 border border-primary/20 p-3 flex justify-between items-center group">
                    <p className="text-base text-primary font-mono font-bold tracking-widest">
                      {project.squadVirtualAccountNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
