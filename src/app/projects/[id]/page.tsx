"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

interface Verification {
  id: string;
  mediaUrls: string[];
  notes?: string;
  status: string;
  rejectReason?: string;
  createdAt: string;
  submittedBy: { id: string; name: string };
  reviewedBy?: { id: string; name: string } | null;
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: string;
  delayFlag: string;
  dueDate?: string;
  order: number;
  verifications: Verification[];
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  note?: string;
  milestoneId?: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  totalBudget: number;
  escrowBalance: number;
  client: { id: string; name: string; email: string };
  contractor?: { id: string; name: string; email: string } | null;
  milestones: Milestone[];
  transactions: Transaction[];
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"milestones" | "escrow">("milestones");

  // Modals
  const [showMilestone, setShowMilestone] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showSubmitProof, setShowSubmitProof] = useState<string | null>(null);

  // Forms
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", amount: "", dueDate: "" });
  const [depositAmount, setDepositAmount] = useState("");
  const [proofForm, setProofForm] = useState({ mediaUrl: "", notes: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`, { credentials: "include" });
    const data = await res.json();
    if (data.success) setProject(data.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!user) return;
    fetchProject();
  }, [user, authLoading, router, fetchProject]);

  const fmt = (n: number) => `₦${n.toLocaleString()}`;
  const isClient = user?.role === "CLIENT";
  const isContractor = user?.role === "CONTRACTOR";

  // ─── Handlers ────────────────────────────────────────

  const addMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...milestoneForm,
          amount: parseFloat(milestoneForm.amount),
          order: (project?.milestones.length || 0) + 1,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setShowMilestone(false);
      setMilestoneForm({ title: "", description: "", amount: "", dueDate: "" });
      fetchProject();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setActionLoading(false); }
  };

  const deposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/escrow/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id, amount: parseFloat(depositAmount) }),
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setShowDeposit(false);
      setDepositAmount("");
      fetchProject();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setActionLoading(false); }
  };

  const submitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubmitProof) return;
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verification/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: showSubmitProof,
          mediaUrls: [proofForm.mediaUrl],
          notes: proofForm.notes || undefined,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setShowSubmitProof(null);
      setProofForm({ mediaUrl: "", notes: "" });
      fetchProject();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setActionLoading(false); }
  };

  const approveVerification = async (verificationId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/verification/${verificationId}/approve`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      fetchProject();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally { setActionLoading(false); }
  };

  const rejectVerification = async (verificationId: string) => {
    const reason = prompt("Reason for rejection:");
    if (reason === null) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/verification/${verificationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      fetchProject();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally { setActionLoading(false); }
  };

  const releaseFunds = async (milestoneId: string) => {
    if (!confirm("Release funds for this milestone?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/escrow/release/${milestoneId}`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      fetchProject();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally { setActionLoading(false); }
  };

  const flagDelay = async (milestoneId: string, flag: string) => {
    await fetch(`/api/milestones/${milestoneId}/delay`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delayFlag: flag }),
      credentials: "include",
    });
    fetchProject();
  };

  if (authLoading || loading || !project) return (
    <><Navbar /><div className="page-container"><div className="skeleton" style={{ height: 400 }} /></div></>
  );

  const milestoneTotal = project.milestones.reduce((s, m) => s + m.amount, 0);
  const budgetRemaining = project.totalBudget - milestoneTotal;

  return (
    <>
      <Navbar />
      <div className="page-container animate-in">
        {/* Header */}
        <div className="page-header">
          <div>
            <button onClick={() => router.push("/projects")} className="btn-secondary" style={{ marginBottom: 12, padding: "4px 12px", fontSize: "0.8rem" }}>
              ← Back to Projects
            </button>
            <h1 className="page-title">{project.title}</h1>
            {project.description && <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>{project.description}</p>}
          </div>
          <span className={`badge badge-${project.status.toLowerCase()}`}>{project.status}</span>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <span className="stat-label">Total Budget</span>
            <span className="stat-value green">{fmt(project.totalBudget)}</span>
          </div>
          <div className="glass-card stat-card glow-effect">
            <span className="stat-label">Escrow Balance</span>
            <span className="stat-value purple">{fmt(project.escrowBalance)}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Allocated to Milestones</span>
            <span className="stat-value blue">{fmt(milestoneTotal)}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Unallocated</span>
            <span className="stat-value amber">{fmt(budgetRemaining)}</span>
          </div>
        </div>

        {/* Participants */}
        <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: "flex", gap: 32, fontSize: "0.9rem", flexWrap: "wrap" }}>
          <span><strong>Client:</strong> {project.client.name}</span>
          <span><strong>Contractor:</strong> {project.contractor?.name || <em style={{ color: "var(--text-muted)" }}>Not assigned</em>}</span>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {isClient && <button className="btn-primary" onClick={() => setShowDeposit(true)}>💰 Deposit Funds</button>}
          {isClient && <button className="btn-secondary" onClick={() => setShowMilestone(true)}>📋 Add Milestone</button>}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {(["milestones", "escrow"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 20px", borderRadius: 10, fontSize: "0.9rem", fontWeight: 500, cursor: "pointer",
              border: "1px solid", transition: "all 0.2s",
              ...(activeTab === tab
                ? { background: "rgba(59,130,246,0.15)", borderColor: "var(--accent-blue)", color: "var(--accent-blue)" }
                : { background: "transparent", borderColor: "var(--border-color)", color: "var(--text-secondary)" }),
            }}>{tab === "milestones" ? `Milestones (${project.milestones.length})` : `Transactions (${project.transactions.length})`}</button>
          ))}
        </div>

        {/* Milestones Tab */}
        {activeTab === "milestones" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {project.milestones.length === 0 ? (
              <div className="glass-card" style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
                No milestones yet. {isClient && "Click 'Add Milestone' to create one."}
              </div>
            ) : project.milestones.map((m) => {
              const latestVerification = m.verifications[0];
              const hasRelease = project.transactions.some(
                (t) => t.milestoneId === m.id && t.type === "RELEASE" && t.status === "COMPLETED"
              );

              return (
                <div key={m.id} className="glass-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>#{m.order}</span>
                        <h3 style={{ fontWeight: 600 }}>{m.title}</h3>
                      </div>
                      {m.description && <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{m.description}</p>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className={`badge badge-${m.status.toLowerCase().replace("_", "-")}`}>{m.status.replace("_", " ")}</span>
                      {m.delayFlag !== "ON_TRACK" && (
                        <span className={`badge badge-${m.delayFlag.toLowerCase()}`}>⚠ {m.delayFlag}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 20, fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16, flexWrap: "wrap" }}>
                    <span>💰 {fmt(m.amount)}</span>
                    {m.dueDate && <span>📅 {new Date(m.dueDate).toLocaleDateString()}</span>}
                    {hasRelease && <span className="badge badge-completed">💸 Funds Released</span>}
                  </div>

                  {/* Verification display */}
                  {latestVerification && (
                    <div style={{
                      padding: 16, borderRadius: 12, marginBottom: 12,
                      background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.85rem" }}>
                        <span>Submitted by <strong>{latestVerification.submittedBy.name}</strong></span>
                        <span className={`badge badge-${latestVerification.status.toLowerCase()}`}>{latestVerification.status}</span>
                      </div>
                      {latestVerification.notes && (
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 8 }}>{latestVerification.notes}</p>
                      )}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                        {latestVerification.mediaUrls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
                            📎 Evidence {i + 1}
                          </a>
                        ))}
                      </div>
                      {latestVerification.rejectReason && (
                        <div style={{ fontSize: "0.8rem", color: "var(--accent-red)", marginTop: 4 }}>
                          Rejection reason: {latestVerification.rejectReason}
                        </div>
                      )}

                      {/* Client review actions */}
                      {isClient && latestVerification.status === "PENDING" && (
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button className="btn-success" onClick={() => approveVerification(latestVerification.id)} disabled={actionLoading}>✓ Approve</button>
                          <button className="btn-danger" onClick={() => rejectVerification(latestVerification.id)} disabled={actionLoading}>✗ Reject</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions row */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {/* Contractor: submit proof */}
                    {isContractor && ["PENDING", "IN_PROGRESS", "REJECTED"].includes(m.status) && (
                      <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                        onClick={() => setShowSubmitProof(m.id)}>📸 Submit Proof</button>
                    )}

                    {/* Client: release funds */}
                    {isClient && m.status === "APPROVED" && !hasRelease && (
                      <button className="btn-success" onClick={() => releaseFunds(m.id)} disabled={actionLoading}>
                        💸 Release {fmt(m.amount)}
                      </button>
                    )}

                    {/* Delay flagging */}
                    {m.delayFlag === "ON_TRACK" && (
                      <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        onClick={() => flagDelay(m.id, "DELAYED")}>⚠ Flag Delay</button>
                    )}
                    {m.delayFlag === "DELAYED" && (
                      <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        onClick={() => flagDelay(m.id, "ON_TRACK")}>✓ Mark On Track</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Escrow/Transactions Tab */}
        {activeTab === "escrow" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {project.transactions.length === 0 ? (
              <div className="glass-card" style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
                No transactions yet. {isClient && "Deposit funds to get started."}
              </div>
            ) : project.transactions.map((t) => (
              <div key={t.id} className="glass-card" style={{
                padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.2rem" }}>{t.type === "DEPOSIT" ? "📥" : t.type === "RELEASE" ? "📤" : "🔒"}</span>
                    <strong>{t.type}</strong>
                  </div>
                  {t.note && <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 4 }}>{t.note}</p>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontWeight: 700, fontSize: "1.1rem",
                    color: t.type === "DEPOSIT" ? "var(--accent-green)" : "var(--accent-blue)",
                  }}>
                    {t.type === "DEPOSIT" ? "+" : "-"}{fmt(t.amount)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Modals ──────────────────────────────────────── */}

        {/* Deposit Modal */}
        {showDeposit && (
          <Modal onClose={() => setShowDeposit(false)} title="Deposit to Escrow">
            {error && <ErrorMsg msg={error} />}
            <form onSubmit={deposit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                Max deposit: {fmt(project.totalBudget - project.escrowBalance)}
              </p>
              <div>
                <label className="label-text">Amount (₦)</label>
                <input className="input-field" type="number" value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)} required min="1"
                  max={project.totalBudget - project.escrowBalance} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowDeposit(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={actionLoading} style={{ flex: 1 }}>
                  {actionLoading ? "Processing..." : "Deposit (Simulated)"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Add Milestone Modal */}
        {showMilestone && (
          <Modal onClose={() => setShowMilestone(false)} title="Add Milestone">
            {error && <ErrorMsg msg={error} />}
            <form onSubmit={addMilestone} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label-text">Title</label>
                <input className="input-field" value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea className="input-field" value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                  rows={2} style={{ resize: "vertical" }} />
              </div>
              <div>
                <label className="label-text">Amount (₦) — Remaining: {fmt(budgetRemaining)}</label>
                <input className="input-field" type="number" value={milestoneForm.amount}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })}
                  required min="1" max={budgetRemaining} />
              </div>
              <div>
                <label className="label-text">Due Date (optional)</label>
                <input className="input-field" type="date" value={milestoneForm.dueDate}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowMilestone(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={actionLoading} style={{ flex: 1 }}>
                  {actionLoading ? "Adding..." : "Add Milestone"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Submit Proof Modal */}
        {showSubmitProof && (
          <Modal onClose={() => setShowSubmitProof(null)} title="Submit Proof of Work">
            {error && <ErrorMsg msg={error} />}
            <form onSubmit={submitProof} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label-text">Evidence URL (image/video link)</label>
                <input className="input-field" value={proofForm.mediaUrl}
                  onChange={(e) => setProofForm({ ...proofForm, mediaUrl: e.target.value })}
                  placeholder="https://..." required />
              </div>
              <div>
                <label className="label-text">Notes</label>
                <textarea className="input-field" value={proofForm.notes}
                  onChange={(e) => setProofForm({ ...proofForm, notes: e.target.value })}
                  placeholder="Describe what was completed..." rows={3} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowSubmitProof(null)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={actionLoading} style={{ flex: 1 }}>
                  {actionLoading ? "Submitting..." : "Submit Proof"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  );
}

// ─── Helper components ─────────────────────────────────

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20,
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-card animate-in" style={{ width: "100%", maxWidth: 480, padding: 32 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 20 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{
      padding: "10px 16px", borderRadius: 10, marginBottom: 16,
      background: "rgba(239,68,68,0.1)", color: "var(--accent-red)",
      fontSize: "0.85rem", border: "1px solid rgba(239,68,68,0.2)",
    }}>{msg}</div>
  );
}
