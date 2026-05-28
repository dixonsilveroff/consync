"use client";

import { Wallet, TrendingDown, ArrowRight, ShieldCheck } from "lucide-react";
import { formatNaira } from "@/lib/utils";
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
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      {/* High-contrast Header */}
      <div className="bg-cta-gradient p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-white/80" />
            <h3 className="font-display font-medium text-white/90 uppercase tracking-wider text-small">
              Secure Escrow
            </h3>
          </div>
          <span className={`text-micro font-bold uppercase tracking-wider px-2.5 py-1 rounded ${needsFunding ? 'bg-white/20 text-white' : 'bg-success text-white'}`}>
            {needsFunding ? "AWAITING FUNDS" : "ACTIVE"}
          </span>
        </div>

        <div className="mb-2">
          <p className="text-white/70 text-small mb-1">Current Balance</p>
          <p className="font-mono text-display-sm font-semibold tracking-tight">
            {formatNaira(escrowBalanceKobo)}
          </p>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-micro font-medium text-text-secondary uppercase tracking-wider">Funded</p>
            <p className="text-small font-medium text-primary">
              {fundedPercentage}%
            </p>
          </div>
          <div className="h-2 bg-background border border-border rounded-full w-full overflow-hidden">
            <div
              className="h-full bg-cta-gradient transition-all duration-release"
              style={{ width: `${Math.min(fundedPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-background p-3 rounded-lg border border-border">
            <p className="text-micro font-medium text-text-secondary uppercase tracking-wider">Total Value</p>
            <p className="font-mono text-small text-text-primary font-medium mt-1">
              {formatNaira(totalValueKobo)}
            </p>
          </div>
          <div className="bg-background p-3 rounded-lg border border-border">
            <p className="text-micro font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-danger" />
              Disbursed
            </p>
            <p className="font-mono text-small text-text-primary font-medium mt-1">
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
            className="w-full flex items-center justify-center gap-2 bg-cta-gradient hover:bg-cta-gradient-hover border-0 shadow-md text-white"
          >
            <Wallet className="w-4 h-4" />
            {isFunding ? "Generating Account..." : "Fund Project Escrow"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
