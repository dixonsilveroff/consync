import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Shield, Brain, Wallet, ArrowRight, CheckCircle2, AlertTriangle, Image as ImageIcon, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary-faint),_transparent_50%)]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-micro font-medium uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Live for Squad Hackathon 3.0
              </div>
              <h1 className="font-display text-display text-text-primary mb-6 text-balance">
                Verify Milestones. <br />
                <span className="text-primary bg-clip-text text-transparent bg-cta-gradient">Release Payments.</span>
              </h1>
              <p className="text-body text-text-secondary mb-10 leading-relaxed text-balance">
                ConSync uses Gemini Vision AI to analyze construction site photos against predefined criteria,
                giving owners the confidence to release milestone payments through secure Squad escrow.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Show when="signed-out">
                  <SignUpButton mode="modal">
                    <Button size="lg" className="w-full sm:w-auto gap-2 bg-cta-gradient hover:bg-cta-gradient-hover text-white border-0 shadow-md hover:shadow-lg transition-all">
                      Start a Project
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-surface hover:bg-background">
                      Sign In
                    </Button>
                  </SignInButton>
                </Show>
                <Show when="signed-in">
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto gap-2 bg-cta-gradient hover:bg-cta-gradient-hover text-white border-0 shadow-md">
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Show>
              </div>
            </div>

            {/* Abstract Mockup / Visual */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-cta-gradient opacity-10 blur-3xl rounded-full" />
              <div className="relative bg-surface border border-border rounded-2xl shadow-xl p-6 rotate-2 hover:rotate-0 transition-transform duration-slow">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-display font-medium text-small text-text-primary">Gemini Vision AI Analysis</span>
                  </div>
                  <span className="chip-approved shadow-sm">98.5% Confidence</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="text-small font-medium text-text-primary">Foundation Depth Verified</p>
                      <p className="text-micro text-text-secondary mt-1">Excavation matches 1.2m specification based on reference markers.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="text-small font-medium text-text-primary">Reinforcement Spacing</p>
                      <p className="text-micro text-text-secondary mt-1">Rebar grid spacing is consistent and aligned with structural plans.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2 border-t border-border">
                    <Wallet className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-small font-medium text-text-primary">Action Required</p>
                      <p className="text-micro text-text-secondary mt-1">Milestone verified. Ready for ₦2,500,000 Squad transfer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── The Problem ─── */}
        <section id="problem" className="py-24 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="w-12 h-12 bg-danger-bg rounded-xl flex items-center justify-center mb-6">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <h2 className="font-display text-h2 text-text-primary mb-6">
                  The Construction Trust Deficit
                </h2>
                <p className="text-body text-text-secondary mb-6 leading-relaxed">
                  In Nigeria, over <strong className="text-text-primary font-semibold">88% of construction projects</strong> face delays or abandonment. Diaspora investors and local project owners constantly battle unverified claims, staged photos, and misappropriated funds.
                </p>
                <p className="text-body text-text-secondary leading-relaxed">
                  Without a reliable way to verify progress remotely, payments become a massive risk. We built ConSync to replace blind trust with irrefutable, AI-analyzed photographic evidence and conditional escrow.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-background p-6 rounded-xl border border-border flex flex-col justify-center">
                   <p className="text-display font-display text-danger mb-2">88%</p>
                   <p className="text-small text-text-secondary font-medium uppercase tracking-wide">Project Delay Rate</p>
                 </div>
                 <div className="bg-background p-6 rounded-xl border border-border flex flex-col justify-center">
                   <p className="text-display font-display text-primary mb-2">₦2.4T</p>
                   <p className="text-small text-text-secondary font-medium uppercase tracking-wide">Sector Value at Risk</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section id="features" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-small font-semibold text-primary uppercase tracking-wider mb-3">HOW WE SOLVE IT</p>
              <h2 className="font-display text-h1 text-text-primary mb-6">
                The Trust Loop
              </h2>
              <p className="text-body text-text-secondary">
                A closed-loop system combining Google's advanced multimodal AI with Squad's robust payment infrastructure.
              </p>
            </div>
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
                <div key={i} className="bg-surface rounded-xl border border-border p-8 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-primary-faint rounded-lg flex items-center justify-center text-primary mb-6">
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

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="py-24 bg-surface border-y border-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-display text-h2 text-text-primary mb-16 text-center">
              Four Steps to Secure Building
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-border-strong -z-10" />

              {[
                {
                  step: "01",
                  title: "Fund Escrow",
                  desc: "Owner transfers milestone funds into a secure Squad Dynamic Virtual Account.",
                  icon: <Wallet className="w-6 h-6" />
                },
                {
                  step: "02",
                  title: "Upload Evidence",
                  desc: "Contractor submits site photos for the specific milestone criteria.",
                  icon: <ImageIcon className="w-6 h-6" />
                },
                {
                  step: "03",
                  title: "AI Analysis",
                  desc: "Gemini Vision evaluates photos, checks anomalies, and grades confidence.",
                  icon: <Brain className="w-6 h-6" />
                },
                {
                  step: "04",
                  title: "Release Payout",
                  desc: "Owner approves the AI verdict. Squad instantly transfers funds to contractor.",
                  icon: <CheckSquare className="w-6 h-6" />
                }
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-full bg-background border-4 border-surface shadow-sm flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="text-micro font-bold text-primary mb-2">STEP {item.step}</span>
                  <h3 className="font-display text-h4 text-text-primary mb-3">{item.title}</h3>
                  <p className="text-small text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Banner ─── */}
        <section className="py-24 bg-cta-gradient relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/5" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-display text-display-sm text-white mb-6">
              Ready to build with confidence?
            </h2>
            <p className="text-body text-primary-faint mb-10 max-w-2xl mx-auto leading-relaxed">
              Join the platform that protects your investments and guarantees payment for honest work. Start your first verified project today.
            </p>
            <div className="flex justify-center">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <Button size="lg" className="bg-white text-primary hover:bg-background border-0 shadow-lg text-body font-semibold px-8 py-6 h-auto transition-transform hover:scale-105">
                    Create Free Account
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-primary hover:bg-background border-0 shadow-lg text-body font-semibold px-8 py-6 h-auto transition-transform hover:scale-105">
                    Go to Dashboard
                  </Button>
                </Link>
              </Show>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
