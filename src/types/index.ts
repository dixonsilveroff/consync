// ─── API Response Types ───────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── User Types ───────────────────────────────────────────

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "CONTRACTOR" | "SUPPLIER";
  phone?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: "CLIENT" | "CONTRACTOR" | "SUPPLIER";
  phone?: string;
}

// ─── Project Types ────────────────────────────────────────

export interface CreateProjectData {
  title: string;
  description?: string;
  totalBudget: number;
  contractorId?: string;
}

// ─── Milestone Types ──────────────────────────────────────

export interface CreateMilestoneData {
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  order: number;
}

// ─── Escrow Types ─────────────────────────────────────────

export interface DepositData {
  projectId: string;
  amount: number;
}

// ─── Verification Types ───────────────────────────────────

export interface SubmitVerificationData {
  milestoneId: string;
  mediaUrls: string[];
  notes?: string;
}
