"use client";

import { Wallet, TrendingDown, ArrowRight } from "lucide-react";
import { formatNaira } from "@/lib/utils";

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
    <div className="card-enforcer">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-container flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-heading text-headline-sm text-on-surface">
            Escrow Account
          </h3>
          <p className="label-blueprint mt-0.5">
            {needsFunding ? "AWAITING FUNDING" : "ACTIVE"}
          </p>
        </div>
      </div>

      {/* Balance Display */}
      <div className="mb-6">
        <p className="label-blueprint mb-1">Current Balance</p>
        <p className="font-heading text-display-sm text-primary">
          {formatNaira(escrowBalanceKobo)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="label-blueprint">Funded</p>
          <p className="text-label-sm text-on-surface-variant">
            {fundedPercentage}%
          </p>
        </div>
        <div className="h-2 bg-surface-container-low w-full">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(fundedPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="label-blueprint">Project Value</p>
          <p className="text-label-lg text-on-surface font-body mt-1">
            {formatNaira(totalValueKobo)}
          </p>
        </div>
        <div>
          <p className="label-blueprint flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Disbursed
          </p>
          <p className="text-label-lg text-on-surface font-body mt-1">
            {formatNaira(disbursed > 0 ? disbursed : 0)}
          </p>
        </div>
      </div>

      {/* Fund Button */}
      {needsFunding && onFundEscrow && (
        <button
          onClick={onFundEscrow}
          disabled={isFunding}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isFunding ? "Redirecting..." : "Fund Escrow"}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
