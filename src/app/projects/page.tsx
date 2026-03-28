"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  totalBudget: number;
  escrowBalance: number;
  milestones: { id: string; status: string }[];
  client: { name: string };
  contractor?: { name: string } | null;
}

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", totalBudget: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (!user) return;
    fetchProjects();
  }, [user, authLoading, router]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects", { credentials: "include" });
    const data = await res.json();
    if (data.success) setProjects(data.data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, totalBudget: parseFloat(form.totalBudget) }),
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setShowCreate(false);
      setForm({ title: "", description: "", totalBudget: "" });
      router.push(`/projects/${data.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || !user) return <div className="skeleton" style={{ height: "100vh" }} />;

  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <>
      <Navbar />
      <div className="page-container animate-in">
        <div className="page-header">
          <h1 className="page-title">Projects</h1>
          {user.role === "CLIENT" && (
            <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
          )}
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20,
          }} onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
            <div className="glass-card" style={{ width: "100%", maxWidth: 480, padding: 32 }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 20 }}>Create New Project</h2>
              {error && (
                <div style={{ padding: "10px 16px", borderRadius: 10, marginBottom: 16, background: "rgba(239,68,68,0.1)", color: "var(--accent-red)", fontSize: "0.85rem", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>
              )}
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="label-text">Project Title</label>
                  <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 12-Flat Residential Block" required />
                </div>
                <div>
                  <label className="label-text">Description</label>
                  <textarea className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project details..." rows={3} style={{ resize: "vertical" }} />
                </div>
                <div>
                  <label className="label-text">Total Budget (₦)</label>
                  <input className="input-field" type="number" value={form.totalBudget} onChange={(e) => setForm({ ...form, totalBudget: e.target.value })} placeholder="5000000" required min="1" />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>Cancel</button>
                  <button className="btn-primary" type="submit" disabled={creating} style={{ flex: 1 }}>
                    {creating ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project list */}
        {loading ? (
          <div className="cards-grid">{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 140 }} />)}</div>
        ) : projects.length === 0 ? (
          <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: 16 }}>No projects yet</p>
            {user.role === "CLIENT" && (
              <button className="btn-primary" onClick={() => setShowCreate(true)}>Create Your First Project</button>
            )}
          </div>
        ) : (
          <div className="cards-grid">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="glass-card" style={{ padding: 20, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <h3 style={{ fontWeight: 600 }}>{p.title}</h3>
                    <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                  </div>
                  {p.description && (
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
                      {p.description.slice(0, 120)}{p.description.length > 120 ? "..." : ""}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 16, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    <span>💰 {fmt(p.totalBudget)}</span>
                    <span>🔒 {fmt(p.escrowBalance)} in escrow</span>
                    <span>📋 {p.milestones.length} milestones</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
