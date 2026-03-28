"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 24px", borderBottom: "1px solid var(--border-color)",
      background: "rgba(10, 15, 28, 0.85)", backdropFilter: "blur(16px)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "0.85rem",
          }}>C</div>
          <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>ConSync</span>
        </Link>
        <div style={{ display: "flex", gap: 4 }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: "0.9rem",
                textDecoration: "none", fontWeight: 500, transition: "all 0.2s",
                color: pathname === link.href ? "var(--accent-blue)" : "var(--text-secondary)",
                background: pathname === link.href ? "rgba(59,130,246,0.1)" : "transparent",
              }}
            >{link.label}</Link>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user.name}</div>
          <div className="badge" style={{
            fontSize: "0.65rem", padding: "2px 8px",
            background: "rgba(139,92,246,0.15)", color: "var(--accent-purple)",
          }}>{user.role}</div>
        </div>
        <button onClick={handleLogout} className="btn-secondary" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
