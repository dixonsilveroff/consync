"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const roles = [
  { value: "CLIENT", label: "Client", desc: "I'm funding a construction project", icon: "💼" },
  { value: "CONTRACTOR", label: "Contractor", desc: "I execute construction work", icon: "🏗️" },
  { value: "SUPPLIER", label: "Supplier", desc: "I supply materials", icon: "🚚" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) { setError("Please select a role"); return; }
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password, role, phone: phone || undefined });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div className="glass-card animate-in" style={{ width: "100%", maxWidth: 480, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: "0 auto 16px",
            background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "1.25rem",
          }}>C</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Create your account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 4 }}>
            Join ConSync and start building trust
          </p>
        </div>

        {error && (
          <div style={{
            padding: "10px 16px", borderRadius: 10, marginBottom: 16,
            background: "rgba(239,68,68,0.1)", color: "var(--accent-red)",
            fontSize: "0.85rem", border: "1px solid rgba(239,68,68,0.2)",
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Role selection */}
          <div>
            <label className="label-text">I am a...</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  style={{
                    padding: "12px 8px", borderRadius: 12, textAlign: "center",
                    cursor: "pointer", transition: "all 0.2s",
                    background: role === r.value ? "rgba(59,130,246,0.15)" : "var(--bg-secondary)",
                    border: `1px solid ${role === r.value ? "var(--accent-blue)" : "var(--border-color)"}`,
                    color: "var(--text-primary)",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text">Full Name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
          </div>
          <div>
            <label className="label-text">Email</label>
            <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label-text">Phone (optional)</label>
            <input className="input-field" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8, width: "100%" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent-blue)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
