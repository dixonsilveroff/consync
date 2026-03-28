"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

interface Project {
  id: string;
  title: string;
  status: string;
  totalBudget: number;
  escrowBalance: number;
  milestones: { id: string; status: string; delayFlag: string }[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!user) return;

    fetch("/api/projects", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => { if (data.success) setProjects(data.data); })
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || !user) return <div className="skeleton" style={{ height: "100vh" }} />;

  const totalBudget = projects.reduce((s, p) => s + p.totalBudget, 0);
  const totalEscrow = projects.reduce((s, p) => s + p.escrowBalance, 0);
  const allMilestones = projects.flatMap((p) => p.milestones);
  const pendingApproval = allMilestones.filter((m) => m.status === "SUBMITTED").length;
  const delayedCount = allMilestones.filter((m) => m.delayFlag !== "ON_TRACK").length;

  const formatCurrency = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <>
      <Navbar />
      <div className="page-container animate-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {user.role === "CLIENT" ? "Client" : user.role === "CONTRACTOR" ? "Contractor" : "Supplier"} Dashboard
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>Welcome back, {user.name}</p>
          </div>
          {user.role === "CLIENT" && (
            <Link href="/projects?new=1" className="btn-primary">+ New Project</Link>
          )}
        </div>

        {/* KPI Stats */}
        <div className="stats-grid">
          <div className="glass-card stat-card glow-effect">
            <span className="stat-label">Active Projects</span>
            <span className="stat-value blue">{projects.filter((p) => p.status === "ACTIVE").length}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Total Budget</span>
            <span className="stat-value green">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">In Escrow</span>
            <span className="stat-value purple">{formatCurrency(totalEscrow)}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Awaiting Review</span>
            <span className="stat-value amber">{pendingApproval}</span>
          </div>
        </div>

        {/* Delay Alert */}
        {delayedCount > 0 && (
          <div style={{
            padding: "14px 20px", borderRadius: 12, marginBottom: 24,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--accent-red)", fontSize: "0.9rem",
          }}>
            ⚠️ <strong>{delayedCount}</strong> milestone{delayedCount > 1 ? "s" : ""} flagged as delayed or stalled
          </div>
        )}

        {/* Recent Projects */}
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 16 }}>Recent Projects</h2>
        {loading ? (
          <div className="cards-grid">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
              {user.role === "CLIENT" ? "You haven't created any projects yet." : "No projects assigned to you yet."}
            </p>
            {user.role === "CLIENT" && (
              <Link href="/projects?new=1" className="btn-primary">Create Your First Project</Link>
            )}
          </div>
        ) : (
          <div className="cards-grid">
            {projects.slice(0, 6).map((project) => {
              const completed = project.milestones.filter((m) => m.status === "APPROVED").length;
              const total = project.milestones.length;
              const progress = total > 0 ? (completed / total) * 100 : 0;

              return (
                <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="glass-card" style={{ padding: 20, cursor: "pointer", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                      <h3 style={{ fontWeight: 600, fontSize: "1.05rem" }}>{project.title}</h3>
                      <span className={`badge badge-${project.status.toLowerCase()}`}>{project.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: 20, marginBottom: 12, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      <span>Budget: {formatCurrency(project.totalBudget)}</span>
                      <span>Escrow: {formatCurrency(project.escrowBalance)}</span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>
                        <span>Milestones</span>
                        <span>{completed}/{total}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: "var(--bg-secondary)" }}>
                        <div style={{
                          height: "100%", borderRadius: 2, transition: "width 0.5s ease",
                          width: `${progress}%`,
                          background: "linear-gradient(90deg, var(--accent-blue), var(--accent-green))",
                        }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
