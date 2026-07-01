"use client";

import { useState } from "react";
import { Wallet, TrendingDown, ArrowRight, Pencil, Check, X } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";

interface EscrowBalanceProps {
  projectId: Id<"projects">;
  totalValueKobo: number;
  escrowBalanceKobo: number;
  totalMilestonesKobo: number;
  projectStatus: string;
  onFundEscrow?: (amountKobo: number) => void;
  isFunding?: boolean;
}

export function EscrowBalance({
  projectId,
  totalValueKobo,
  escrowBalanceKobo,
  totalMilestonesKobo,
  projectStatus,
  onFundEscrow,
  isFunding = false,
}: EscrowBalanceProps) {
  const fundedPercentage =
    totalValueKobo > 0
      ? Math.round((escrowBalanceKobo / totalValueKobo) * 100)
      : 0;
  const disbursed = totalValueKobo - escrowBalanceKobo;
  const needsFunding = escrowBalanceKobo < totalValueKobo;

  const [editingTotal, setEditingTotal] = useState(false);
  const [totalInput, setTotalInput] = useState("");
  const [totalError, setTotalError] = useState<string | null>(null);
  const [savingTotal, setSavingTotal] = useState(false);

  const [fundingOpen, setFundingOpen] = useState(false);
  const [fundInput, setFundInput] = useState("");
  const [fundError, setFundError] = useState<string | null>(null);

  const updateTotal = useMutation(api.projects.updateProjectTotalValue);

  const handleEditTotal = () => {
    setTotalInput(String(totalValueKobo / 100));
    setTotalError(null);
    setEditingTotal(true);
  };

  const handleSaveTotal = async () => {
    const naira = parseFloat(totalInput);
    if (isNaN(naira) || naira <= 0) {
      setTotalError("Enter a valid amount");
      return;
    }
    const kobo = Math.round(naira * 100);
    if (kobo < escrowBalanceKobo) {
      setTotalError(`Cannot be less than funded amount (${formatNaira(escrowBalanceKobo)})`);
      return;
    }
    if (kobo < totalMilestonesKobo) {
      setTotalError(`Cannot be less than milestone sum (${formatNaira(totalMilestonesKobo)})`);
      return;
    }

    setSavingTotal(true);
    try {
      await updateTotal({ projectId, totalValueKobo: kobo });
      toast.success("Project total updated");
      setEditingTotal(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update";
      setTotalError(msg);
    } finally {
      setSavingTotal(false);
    }
  };

  const handleFundClick = () => {
    const remaining = totalValueKobo - escrowBalanceKobo;
    setFundInput(String(remaining / 100));
    setFundError(null);
    setFundingOpen(true);
  };

  const handleFundConfirm = () => {
    const naira = parseFloat(fundInput);
    if (isNaN(naira) || naira <= 0) {
      setFundError("Enter a valid amount");
      return;
    }
    const kobo = Math.round(naira * 100);
    setFundingOpen(false);
    onFundEscrow?.(kobo);
  };

  return (
    <div className="border-2 border-border-strong bg-background flex flex-col w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      {/* Header Area */}
      <div className="p-5 border-b-2 border-border-strong flex items-center align-center gap-1 bg-surface">
        <div className={cn(
          "font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-1 border-2",
          !needsFunding ? "border-success text-success bg-success/10" : "border-text-primary text-text-primary bg-background"
        )}>
          {!needsFunding ? "Fully Funded" : "Accepting Funds"}
        </div>
      </div>

      {/* Main Balance Block */}
      <div className="p-6 bg-primary text-primary-foreground border-b-2 border-border-strong">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">
          Current Balance
        </p>
        <p className="font-display text-4xl xl:text-5xl font-bold tracking-tighter leading-none break-all">
          {formatNaira(escrowBalanceKobo)}
        </p>
      </div>

      {/* Stats Block */}
      <div className="grid grid-cols-2 divide-x-2 divide-border-strong bg-surface">
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Total Value
            </p>
            {!editingTotal && (
              <button
                onClick={handleEditTotal}
                className="text-text-muted hover:text-primary transition-colors"
                title="Edit total value"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
          {editingTotal ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs text-text-muted">₦</span>
                <input
                  type="number"
                  value={totalInput}
                  onChange={(e) => { setTotalInput(e.target.value); setTotalError(null); }}
                  className="w-full font-mono text-sm font-bold bg-background border border-border-strong px-2 py-1 text-text-primary"
                  min="0"
                  step="1000"
                  autoFocus
                />
              </div>
              {totalError && <p className="font-mono text-[9px] text-danger">{totalError}</p>}
              <div className="flex gap-1">
                <button
                  onClick={handleSaveTotal}
                  disabled={savingTotal}
                  className="p-1 text-success hover:bg-success/10 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingTotal(false)}
                  className="p-1 text-danger hover:bg-danger/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="font-mono text-base font-bold text-text-primary break-all">
              {formatNaira(totalValueKobo)}
            </p>
          )}
        </div>
        <div className="p-4 flex flex-col justify-between">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-1.5">
            <TrendingDown className="w-3 h-3 text-danger" />
            Disbursed
          </p>
          <p className="font-mono text-base font-bold text-text-primary break-all">
            {formatNaira(disbursed > 0 ? disbursed : 0)}
          </p>
        </div>
      </div>

      {/* Fund Escrow Action */}
      {fundingOpen ? (
        <div className="p-4 bg-background border-t-2 border-border-strong space-y-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Amount to Fund (₦)
          </p>
          <input
            type="number"
            value={fundInput}
            onChange={(e) => { setFundInput(e.target.value); setFundError(null); }}
            className="w-full font-mono text-sm font-bold bg-surface border-2 border-border-strong px-3 py-2 text-text-primary"
            min="0"
            step="1000"
            autoFocus
          />
          {fundError && <p className="font-mono text-[9px] text-danger">{fundError}</p>}
          <div className="flex gap-2">
            <Button
              onClick={handleFundConfirm}
              className="flex-1 h-10 bg-text-primary hover:bg-primary text-text-inverse hover:text-primary-foreground rounded-none border-2 border-text-primary font-mono text-xs font-bold uppercase tracking-widest"
            >
              Proceed to Pay
            </Button>
            <Button
              variant="ghost"
              onClick={() => setFundingOpen(false)}
              className="h-10 rounded-none font-mono text-xs font-bold uppercase tracking-widest"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : needsFunding && onFundEscrow ? (
        <div className="p-4 bg-background border-t-2 border-border-strong">
          <Button
            onClick={handleFundClick}
            disabled={isFunding}
            className="w-full h-14 bg-text-primary hover:bg-primary text-text-inverse hover:text-primary-foreground rounded-none border-2 border-text-primary hover:border-border-strong transition-all duration-200 flex items-center justify-between px-4 font-mono text-xs font-bold uppercase tracking-widest group"
          >
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {isFunding ? "Generating..." : "Allocate Capital"}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
