"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid var(--border-color)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "1rem",
          }}>C</div>
          <span style={{ fontWeight: 700, fontSize: "1.25rem" }}>ConSync</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {user ? (
            <Link href="/dashboard" className="btn-primary">Dashboard →</Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">Log In</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "60px 20px",
      }}>
        <div className="animate-in" style={{ maxWidth: 720 }}>
          <div className="badge badge-active" style={{ marginBottom: 24, fontSize: "0.8rem" }}>
            🔒 Transaction-Driven Trust Engine
          </div>

          <h1 style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800,
            lineHeight: 1.1, marginBottom: 20,
            background: "linear-gradient(135deg, #fff, var(--accent-blue), var(--accent-purple))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Stop paying for unfinished construction.
          </h1>

          <p style={{
            fontSize: "1.15rem", color: "var(--text-secondary)",
            lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px",
          }}>
            ConSync holds funds in escrow and only releases payment when milestones are verified.
            No more trust issues between clients and contractors.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1.05rem" }}>
              Start a Project →
            </Link>
            <a href="#how-it-works" className="btn-secondary" style={{ padding: "14px 32px" }}>
              How it works
            </a>
          </div>
        </div>

        {/* How it works */}
        <div id="how-it-works" style={{
          marginTop: 80, maxWidth: 900, width: "100%",
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 40 }}>
            How ConSync Works
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 24,
          }}>
            {[
              { step: "01", title: "Fund Project", desc: "Client deposits into secure escrow", icon: "💰" },
              { step: "02", title: "Set Milestones", desc: "Break work into verifiable phases", icon: "📋" },
              { step: "03", title: "Submit Proof", desc: "Contractor uploads photo/video evidence", icon: "📸" },
              { step: "04", title: "Release Payment", desc: "Client approves, funds auto-release", icon: "✅" },
            ].map((item) => (
              <div key={item.step} className="glass-card" style={{ padding: 24, textAlign: "left" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-blue)", fontWeight: 700, marginBottom: 4 }}>
                  STEP {item.step}
                </div>
                <div style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "24px 20px",
        borderTop: "1px solid var(--border-color)",
        color: "var(--text-muted)", fontSize: "0.85rem",
      }}>
        © 2026 ConSync — Construction Trust Engine
      </footer>
    </div>
  );
}
