import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Building2, Shield, Brain, Wallet, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* ─── Nav ─── */}
      <header className="border-b border-outline-variant/15">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-7 h-7 text-primary" />
            <span className="font-heading text-headline-sm text-on-surface">
              ConSync
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton>
                <button className="btn-tertiary">Sign In</button>
              </SignInButton>
              <SignUpButton>
                <button className="btn-primary flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/owner/projects" className="btn-secondary">
                Dashboard
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
          <p className="label-blueprint mb-4">
            AI-POWERED CONSTRUCTION VERIFICATION
          </p>
          <h1 className="font-heading text-display-lg text-on-surface mb-6">
            Verify Milestones.{" "}
            <span className="text-primary">Release Payments.</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
            ConSync uses Gemini Vision AI to analyze construction site photos
            against pre-defined acceptance criteria, giving project owners
            confidence to release milestone payments through secure Squad escrow.
          </p>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignUpButton>
                <button className="btn-primary flex items-center gap-2">
                  Start a Project
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="btn-secondary">Sign In</button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/owner/projects/new"
                className="btn-primary flex items-center gap-2"
              >
                New Project
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/owner/projects" className="btn-secondary">
                My Projects
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="bg-surface-container-low py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="label-blueprint mb-3">HOW IT WORKS</p>
          <h2 className="font-heading text-display-sm text-on-surface mb-12">
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
              <div key={i} className="card-enforcer">
                <div className="w-12 h-12 bg-primary-container flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-headline-sm text-on-surface mb-2">
                  {feature.title}
                </h3>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-outline-variant/15 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <p className="text-body-sm text-on-surface-variant">
            © 2026 ConSync — Squad Hackathon 3.0
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Powered by Gemini Vision AI & Squad API
          </p>
        </div>
      </footer>
    </div>
  );
}
