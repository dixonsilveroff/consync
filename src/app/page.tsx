import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Building2, Shield, Brain, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ─── Nav ─── */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-7 h-7 text-primary" />
            <span className="font-display text-h3 text-text-primary">
              ConSync
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="default" className="gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/owner/projects">
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <UserButton
                appearance={{
                  elements: { avatarBox: "w-8 h-8" },
                }}
              />
            </Show>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="max-w-7xl mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-small font-semibold text-primary uppercase tracking-wider mb-4">
            AI-Powered Construction Verification
          </p>
          <h1 className="font-display text-display text-text-primary mb-6">
            Verify Milestones.{" "}
            <span className="text-primary">Release Payments.</span>
          </h1>
          <p className="text-body text-text-secondary max-w-2xl mb-10 leading-relaxed">
            ConSync uses Gemini Vision AI to analyze construction site photos
            against pre-defined acceptance criteria, giving project owners
            confidence to release milestone payments through secure Squad escrow.
          </p>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <Button variant="default" size="lg" className="gap-2">
                  Start a Project
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="secondary" size="lg">Sign In</Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/owner/projects/new">
                <Button variant="default" size="lg" className="gap-2">
                  New Project
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/owner/projects">
                <Button variant="secondary" size="lg">My Projects</Button>
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="bg-surface py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-small font-semibold text-primary uppercase tracking-wider mb-3">HOW IT WORKS</p>
          <h2 className="font-display text-h1 text-text-primary mb-12">
            The Trust Loop
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-6 h-6" />,
                title: "AI Verification",
                description:
                  "Upload site photos. Gemini Vision AI evaluates each acceptance criterion and returns a structured verdict with confidence scoring.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure Escrow",
                description:
                  "Project funds are held in Squad Virtual Accounts. Payments are only released when milestones pass AI verification and owner approval.",
              },
              {
                icon: <Wallet className="w-6 h-6" />,
                title: "Instant Release",
                description:
                  "Approved milestones trigger instant bank transfers to contractors via Squad Transfer API. Full audit trail for every transaction.",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-background rounded-lg border border-border p-6 shadow-sm hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary-faint rounded-md flex items-center justify-center text-primary mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-display text-h3 text-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-small text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-micro text-text-muted">
            © 2026 ConSync — Squad Hackathon 3.0
          </p>
          <p className="text-micro text-text-muted">
            Powered by Gemini Vision AI & Squad API
          </p>
        </div>
      </footer>
    </div>
  );
}
