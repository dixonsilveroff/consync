import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format kobo amount to Naira string
 * e.g. 850000000 → "₦8,500,000"
 */
export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(naira);
}

/**
 * Format kobo to abbreviated Naira
 * e.g. 850000000 → "₦8.5M"
 */
export function formatNairaShort(kobo: number): string {
  const naira = kobo / 100;
  if (naira >= 1_000_000) {
    return `₦${(naira / 1_000_000).toFixed(1)}M`;
  }
  if (naira >= 1_000) {
    return `₦${(naira / 1_000).toFixed(0)}K`;
  }
  return `₦${naira.toFixed(0)}`;
}

/**
 * Format a timestamp to a readable date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a timestamp to relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

/**
 * Generate a unique transaction reference for Squad API
 */
export function generateTransactionRef(prefix: string, projectId: string): string {
  const timestamp = Date.now();
  return `CSYNC_${prefix}_${projectId}_${timestamp}`;
}

/**
 * Calculate milestone progress percentage
 */
export function getMilestoneProgress(
  milestones: { status: string }[]
): number {
  if (milestones.length === 0) return 0;
  const approved = milestones.filter((m) => m.status === "APPROVED").length;
  return Math.round((approved / milestones.length) * 100);
}

/**
 * Get status display config
 */
export function getStatusConfig(status: string): {
  label: string;
  className: string;
} {
  const configs: Record<string, { label: string; className: string }> = {
    // Project statuses
    PENDING_FUNDING: { label: "PENDING FUNDING", className: "chip-pending" },
    ACTIVE: { label: "ACTIVE", className: "chip-approved" },
    COMPLETED: { label: "COMPLETED", className: "chip-approved" },
    SUSPENDED: { label: "SUSPENDED", className: "chip-rejected" },
    // Milestone statuses
    PENDING: { label: "PENDING", className: "chip-pending" },
    SUBMITTED: { label: "SUBMITTED", className: "chip-review" },
    ANALYSIS_DONE: { label: "ANALYSIS DONE", className: "chip-review" },
    APPROVED: { label: "APPROVED", className: "chip-approved" },
    REJECTED: { label: "REJECTED", className: "chip-rejected" },
    // Submission statuses
    PENDING_ANALYSIS: { label: "ANALYZING", className: "chip-pending" },
    ANALYSIS_COMPLETE: { label: "ANALYSIS COMPLETE", className: "chip-review" },
    // Verification statuses
    CONFIRMED: { label: "CONFIRMED", className: "chip-approved" },
    UNCONFIRMED: { label: "UNCONFIRMED", className: "chip-rejected" },
    NEEDS_REVIEW: { label: "NEEDS REVIEW", className: "chip-review" },
    RESUBMIT_REQUIRED: { label: "RESUBMIT REQUIRED", className: "chip-rejected" },
    // Payment statuses
    INITIATED: { label: "INITIATED", className: "chip-pending" },
    SUCCESS: { label: "SUCCESS", className: "chip-approved" },
    FAILED: { label: "FAILED", className: "chip-rejected" },
  };
  return configs[status] || { label: status, className: "chip-pending" };
}
