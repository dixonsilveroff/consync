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
    <div className="bg-surface border border-border-strong shadow-none overflow-hidden rounded-none">
      {/* High-contrast Header */}
      <div className="bg-text-primary p-5 sm:p-8 text-text-inverse border-b border-border-strong">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-light" />
            <h3 className="font-mono font-bold tracking-widest text-xs sm:text-sm uppercase">
              Secure Escrow
            </h3>
          </div>
          <span className={cn("font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 border", needsFunding ? 'bg-transparent text-text-inverse border-border' : 'bg-success text-white border-success')}>
            {needsFunding ? "AWAITING FUNDS" : "ACTIVE"}
          </span>
        </div>

        <div className="mb-2">
          <p className="font-mono text-[10px] sm:text-xs text-text-muted tracking-widest uppercase mb-1 sm:mb-2">CURRENT VAULT BALANCE</p>
          <p className="font-display text-4xl sm:text-5xl font-semibold tracking-tighter">
            {formatNaira(escrowBalanceKobo)}
          </p>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 sm:p-8 bg-background">
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="font-mono text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-widest">LIQUIDITY RATIO</p>
            <p className="font-mono text-xs sm:text-sm font-bold text-primary">
              {fundedPercentage}%
            </p>
          </div>
          <div className="h-2 sm:h-3 bg-surface border border-border-strong w-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-release"
              style={{ width: `${Math.min(fundedPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-surface p-4 border border-border-strong">
            <p className="font-mono text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest border-b border-border pb-2 mb-2 sm:mb-3">TOTAL VALUE</p>
            <p className="font-mono text-base sm:text-lg text-text-primary font-bold">
              {formatNaira(totalValueKobo)}
            </p>
          </div>
          <div className="bg-surface p-4 border border-border-strong">
            <p className="font-mono text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest border-b border-border pb-2 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
              <TrendingDown className="w-3 h-3 text-danger" />
              DISBURSED
            </p>
            <p className="font-mono text-base sm:text-lg text-text-primary font-bold">
              {formatNaira(disbursed > 0 ? disbursed : 0)}
            </p>
          </div>
        </div>

        {/* Fund Button */}
        {needsFunding && onFundEscrow && (
          <Button
            onClick={onFundEscrow}
            disabled={isFunding}
            size="lg"
            className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-text-primary hover:bg-text-primary/90 rounded-none h-12 sm:h-14 text-text-inverse font-mono text-xs sm:text-sm tracking-widest font-bold"
          >
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            {isFunding ? "GENERATING ACCOUNT..." : "ALLOCATE CAPITAL"}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
