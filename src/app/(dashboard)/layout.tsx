"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import {
  FolderPlus,
  HardHat,
  Building2,
  Menu,
  X,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const ownerNav: NavItem[] = [
  { label: "Projects", href: "/owner/projects", icon: <Building2 className="w-5 h-5" /> },
  { label: "New Project", href: "/owner/projects/new", icon: <FolderPlus className="w-5 h-5" /> },
];

const contractorNav: NavItem[] = [
  { label: "My Contracts", href: "/contractor/projects", icon: <HardHat className="w-5 h-5" /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useQuery(api.users.currentUser);

  const isOwnerPath = pathname.startsWith("/owner");
  const isContractorPath = pathname.startsWith("/contractor");

  useEffect(() => {
    if (user === undefined) return;

    if (user === null) {
      // Not logged in or not synced
      return;
    }

    // RBAC: If on owner path but user is contractor, redirect to contractor dashboard
    if (isOwnerPath && user.role !== "owner") {
      router.replace("/contractor/projects");
    }

    // RBAC: If on contractor path but user is owner, redirect to owner dashboard
    if (isContractorPath && user.role !== "contractor") {
      router.replace("/owner/projects");
    }
  }, [user, isOwnerPath, isContractorPath, router]);

  // Loading state
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-on-surface-variant font-medium animate-pulse">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Not synced state
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8 text-center">
        <div className="max-w-md space-y-4">
          <ShieldAlert className="w-12 h-12 text-critical-red mx-auto" />
          <h2 className="text-h2 text-text-primary">Account Not Found</h2>
          <p className="text-body text-text-secondary">
            We couldn't find your profile in our system. If you just signed up, 
            it might take a moment to synchronize.
          </p>
          <Link href="/">
            <button className="btn-primary mt-4">Return Home</button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user.role === "owner";
  const navItems = isOwner ? ownerNav : contractorNav;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* ─── Mobile Header ─── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          <span className="font-display text-h4 text-text-primary">ConSync</span>
        </div>
        <div className="flex items-center gap-4">
          <UserButton
            appearance={{
              elements: { avatarBox: "w-8 h-8" },
            }}
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-text-secondary"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ─── Sidebar ─── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform duration-base ease-in-out md:relative md:translate-x-0 flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center gap-3 border-b border-border hidden md:flex">
          <Building2 className="w-6 h-6 text-primary" />
          <span className="font-display text-h3 text-text-primary">ConSync</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-small font-medium transition-colors",
                  isActive
                    ? "bg-primary-faint text-primary"
                    : "text-text-secondary hover:bg-background hover:text-text-primary"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Widget (e.g. Escrow Summary) */}
        {isOwner && (
          <div className="p-4 m-4 bg-background border border-border rounded-lg shadow-sm">
            <p className="text-micro font-medium text-text-muted uppercase tracking-wide mb-1">
              Total Escrow
            </p>
            <p className="font-mono text-h4 text-escrow">₦0.00</p>
          </div>
        )}
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-surface border-b border-border sticky top-0 z-30">
          <h2 className="font-display text-h4 text-text-primary">
            {isOwner ? "Owner Portal" : "Contractor Portal"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="text-small font-medium text-text-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-micro text-text-muted">
                {user?.email}
              </p>
            </div>
            <UserButton
              appearance={{
                elements: { avatarBox: "w-9 h-9" },
              }}
            />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-text-primary/50 z-30 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
