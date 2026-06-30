"use client";

import { Wallet, TrendingDown, ArrowRight, ShieldCheck } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EscrowBalanceProps {
  totalValueKobo: number;
  escrowBalanceKobo: number;
  projectStatus: string;
  onFundEscrow?: () => void;
  isFunding?: boolean;
}

export function EscrowBalance({
  totalValueKobo,
  escrowBalanceKobo,
  projectStatus,
  onFundEscrow,
  isFunding = false,
}: EscrowBalanceProps) {
  const fundedPercentage =
    totalValueKobo > 0
      ? Math.round((escrowBalanceKobo / totalValueKobo) * 100)
      : 0;
  const disbursed = totalValueKobo - escrowBalanceKobo;
  const needsFunding = projectStatus === "PENDING_FUNDING";

  return (
    <div className="border-2 border-border-strong bg-background flex flex-col w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
      {/* Header Area */}
      <div className="p-5 border-b-2 border-border-strong flex items-center align-center gap-1 bg-surface">
        <div className={cn(
          "font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-1 border-2",
          needsFunding ? "border-text-primary text-text-primary bg-background" : "border-success text-success bg-success/10"
        )}>
          {needsFunding ? "Awaiting Capital" : "Secured"}
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
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
            Total Value
          </p>
          <p className="font-mono text-base font-bold text-text-primary break-all">
            {formatNaira(totalValueKobo)}
          </p>
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

      {/* Action Row */}
      {needsFunding && onFundEscrow && (
        <div className="p-4 bg-background border-t-2 border-border-strong">
          <Button
            onClick={onFundEscrow}
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
      )}
    </div>
  );
}
