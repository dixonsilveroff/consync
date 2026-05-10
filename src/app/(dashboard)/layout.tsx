"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderPlus,
  HardHat,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const ownerNavItems: NavItem[] = [
  {
    label: "Projects",
    href: "/owner/projects",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: "New Project",
    href: "/owner/projects/new",
    icon: <FolderPlus className="w-4 h-4" />,
  },
];

const contractorNavItems: NavItem[] = [
  {
    label: "My Projects",
    href: "/contractor/projects",
    icon: <HardHat className="w-4 h-4" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine role from current path
  const isContractor = pathname.startsWith("/contractor");
  const navItems = isContractor ? contractorNavItems : ownerNavItems;

  return (
    <div className="min-h-screen bg-surface flex">
      {/* ─── Sidebar (Desktop) ─── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-surface-container-low border-r border-outline-variant/15">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <Building2 className="w-7 h-7 text-primary" />
            <span className="font-heading text-headline-sm text-on-surface">
              ConSync
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-label-lg font-body transition-all duration-200",
                  isActive
                    ? "bg-primary-container text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Role Switch */}
        <div className="px-3 py-2">
          <Link
            href={isContractor ? "/owner/projects" : "/contractor/projects"}
            className="btn-tertiary flex items-center gap-2 text-body-sm w-full justify-center"
          >
            {isContractor ? (
              <>
                <LayoutDashboard className="w-3 h-3" />
                Switch to Owner
              </>
            ) : (
              <>
                <HardHat className="w-3 h-3" />
                Switch to Contractor
              </>
            )}
          </Link>
        </div>

        {/* User */}
        <div className="p-4 border-t border-outline-variant/15">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-label-lg text-on-surface truncate">
                {user?.firstName || "User"}
              </p>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider truncate">
                {isContractor ? "Contractor" : "Project Owner"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Header ─── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-container-low border-b border-outline-variant/15">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-heading text-headline-sm text-on-surface">
              ConSync
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: { avatarBox: "w-7 h-7" },
              }}
            />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="px-3 py-2 bg-surface-container-low border-t border-outline-variant/15 animate-slide-up">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-label-lg font-body",
                    isActive
                      ? "bg-primary-container text-primary"
                      : "text-on-surface-variant"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* ─── Main Content ─── */}
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
