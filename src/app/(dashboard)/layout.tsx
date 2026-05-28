"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useAction, useQuery } from "convex/react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { formatNairaShort } from "@/lib/utils";

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

import { BANKS } from "@/lib/banks";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useQuery(
    api.users.currentUser,
    isLoaded && isSignedIn ? {} : "skip"
  );
  const bankStatus = useQuery(
    api.users.contractorBankStatus,
    isLoaded && isSignedIn ? {} : "skip"
  );

  const isOwner = user?.role === "owner";

  // Fetch owner projects to calculate total escrow balance
  const ownerProjects = useQuery(
    api.projects.getOwnerProjects,
    isOwner ? {} : "skip"
  );

  const totalEscrowKobo = ownerProjects
    ? ownerProjects.reduce((sum, project) => sum + (project.escrowBalanceKobo || 0), 0)
    : 0;

  const verifyBankDetails = useAction(api.squad.verifyAndSaveBankDetails);

  const isOwnerPath = pathname.startsWith("/owner");
  const isContractorPath = pathname.startsWith("/contractor");
  const shouldPromptBankDetails =
    isSignedIn &&
    user?.role === "contractor" &&
    bankStatus?.hasBankDetails === false &&
    isContractorPath;

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankCode, setBankCode] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankSaving, setBankSaving] = useState(false);

  const filteredBanks = BANKS.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearch.trim().toLowerCase())
  );

  // Close dropdown when clicking outside could be added here, but for simplicity
  // we'll rely on selection and explicit UI interactions for now.

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

  useEffect(() => {
    if (shouldPromptBankDetails) {
      setBankModalOpen(true);
    }
  }, [shouldPromptBankDetails]);

  const handleBankAction = async () => {
    if (!bankCode.trim() || !accountNumber.trim()) {
      setBankError("Bank code and account number are required");
      return;
    }

    setBankError(null);
    setBankSaving(true);
    try {
      await verifyBankDetails({
        bankCode: bankCode.trim(),
        bankAccountNumber: accountNumber.trim(),
      });
      setBankModalOpen(false);
      toast.success("Bank details saved successfully");
    } catch (error) {
      console.error("verifyBankDetails failed:", error);
      const message = error instanceof Error ? error.message : "Unable to save bank details";
      setBankError(message);
    } finally {
      setBankSaving(false);
    }
  };

  if (!isLoaded || user === undefined || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative flex items-center justify-center w-16 h-16 bg-surface-container-high rounded-2xl border border-border shadow-sm overflow-hidden">
            <Image src="/logo.png" alt="ConSync Logo" width={40} height={40} className="rounded-lg absolute z-10" />
            <Loader2 className="w-16 h-16 animate-spin text-primary/20 absolute" strokeWidth={2} />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-xl font-heading font-semibold text-on-surface tracking-tight">
              Loading ConSync
            </h2>
            <p className="text-sm text-on-surface-variant animate-pulse-subtle">
              Preparing your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8 text-center">
        <div className="max-w-md space-y-4">
          <ShieldAlert className="w-12 h-12 text-critical-red mx-auto" />
          <h2 className="text-h2 text-text-primary">Please sign in</h2>
          <p className="text-body text-text-secondary">
            Sign in to access your dashboard.
          </p>
          <Link href="/">
            <Button className="mt-4">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = isOwner ? ownerNav : contractorNav;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row selection:bg-text-primary selection:text-bg">
      {/* ─── Mobile Header ─── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border-strong">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-5 h-5 bg-text-primary"></span>
          <span className="font-display text-lg font-bold tracking-tighter text-text-primary">
            CONSYNC
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-none border border-border-strong",
              },
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-text-primary rounded-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* ─── Sidebar ─── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border-strong transform transition-transform duration-base ease-in-out md:relative md:translate-x-0 flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 items-center gap-3 border-b border-border-strong hidden md:flex h-20">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-full">
            <span className="w-6 h-6 bg-text-primary"></span>
            <span className="font-display text-2xl font-bold tracking-tighter text-text-primary">
              CONSYNC
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-8 px-6 space-y-6 overflow-y-auto">
          <span className="font-mono text-xs font-semibold tracking-widest text-text-muted mb-2 block uppercase">
            {isOwner ? "OWNER DIRECTORY" : "CONTRACTOR DIRECTORY"}
          </span>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 font-mono text-sm tracking-wider transition-all group",
                  isActive
                    ? "text-primary font-bold"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                <div className={cn("w-1.5 h-1.5", isActive ? "bg-success" : "bg-transparent group-hover:bg-border-strong")} />
                {item.label.toUpperCase()}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Widget (e.g. Escrow Summary) */}
        {isOwner && (
          <div className="p-6 border-t border-border-strong bg-surface">
            <p className="font-mono text-xs font-semibold tracking-widest text-text-muted mb-2">
              ESCROW VAULT
            </p>
            <p className="font-mono text-2xl text-success font-semibold tracking-tight">
              {ownerProjects === undefined ? "..." : formatNairaShort(totalEscrowKobo)}
            </p>
          </div>
        )}
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-10 py-0 h-20 bg-background border-b border-border-strong sticky top-0 z-30">
          <h2 className="font-mono text-sm font-semibold tracking-widest text-text-secondary uppercase">
            {isOwner ? "Owner Portal" : "Contractor Portal"} / {pathname.split('/').pop()?.toUpperCase()}
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-text-primary uppercase tracking-wide">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 rounded-none border-2 border-text-primary",
                  userButtonPopoverCard: "rounded-none border border-border-strong shadow-none",
                },
              }}
            />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-12 overflow-y-auto">
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

      {bankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-surface w-full max-w-md rounded-xl border border-border p-6 shadow-lg">
            <h3 className="font-display text-h3 text-text-primary mb-2">
              Add payout bank details
            </h3>
            <p className="text-body text-text-secondary mb-6">
              Provide your bank details once so owners can release milestone payments instantly.
            </p>
            <div className="space-y-4">
              <div className="relative">
                <label className="text-small font-medium text-text-primary">Bank</label>
                <input
                  value={bankSearch}
                  onChange={(event) => {
                    setBankSearch(event.target.value);
                    setDropdownOpen(true);
                    setBankCode("");
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search and select your bank"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-body text-text-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-shadow"
                />
                {dropdownOpen && (
                  <ul className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto bg-surface border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    {filteredBanks.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-text-muted text-center">No banks found matching "{bankSearch}"</li>
                    ) : (
                      filteredBanks.map((bank) => (
                        <li
                          key={bank.code}
                          onClick={() => {
                            setBankCode(bank.code);
                            setBankSearch(bank.name);
                            setDropdownOpen(false);
                          }}
                          className="px-4 py-3 text-sm text-text-primary hover:bg-primary-faint hover:text-primary cursor-pointer border-b border-border/40 last:border-0 transition-colors"
                        >
                          {bank.name}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              <div>
                <label className="text-small font-medium text-text-primary">Account number</label>
                <input
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                  placeholder="0123456789"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-body text-text-primary"
                />
              </div>

              {bankError && (
                <p className="text-small text-red-500">{bankError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleBankAction}
                  disabled={bankSaving}
                  className="flex-1"
                >
                  {bankSaving ? "Saving..." : "Save details"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
