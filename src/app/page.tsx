import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, Box, ShieldCheck, Activity, Layers, ArrowUpRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FadeIn } from "@/components/fade-in";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-body selection:bg-text-primary selection:text-bg">
      <Navbar />
      <main className="flex-1">
        {/* HERO - Stark, Centered, High Contrast */}
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface text-xs font-semibold uppercase tracking-widest mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(76,175,80,0.6)]" />
              Construction Verification Protocol
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-[7rem] font-display font-semibold tracking-tighter leading-[0.95] mb-8 max-w-5xl">
              Automate trust. <br className="hidden sm:block" />
              <span className="text-text-muted">Release capital.</span>
            </h1>
            <p className="text-lg sm:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12">
              The digital escrow platform that uses visual AI to verify on-site milestones before automatically releasing payments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Show when="signed-out">
                <SignUpButton mode="modal"><Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-text-primary text-text-inverse hover:bg-text-primary/90 rounded-none">Start Building<ArrowRight className="w-5 h-5 ml-2" /></Button></SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 text-lg bg-text-primary text-text-inverse hover:bg-text-primary/90 rounded-none">
                    Enter Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </Show>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-none border-border-strong text-text-primary hover:bg-surface">
                View Documentation
              </Button>
            </div>
          </FadeIn>
        </section>

        {/* FULL WIDTH ABSTRACT WIREFRAME PREVIEW */}
        <section className="px-6 pb-32 max-w-7xl mx-auto">
          <FadeIn delay={200}>
            <div className="w-full aspect-[4/3] md:aspect-[21/9] bg-surface border border-border flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-border)_1px,_transparent_1px)] [background-size:24px_24px] opacity-50" />
              <div className="z-10 bg-background border border-border-strong p-8 max-w-md w-full shadow-2xl transition-transform duration-700 group-hover:scale-105">
                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                  <span className="font-mono text-sm font-semibold tracking-wider">MILESTONE 04</span>
                  <span className="text-xs bg-success text-white px-2 py-1 font-semibold">VERIFIED</span>
                </div>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">Analysis:</span><span className="font-bold text-success">Pass</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Confidence:</span><span>99.2%</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Escrow Release:</span><span className="font-mono font-semibold text-success text-base">₦12,500,000</span></div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* BENTO GRID FEATURES */}
        <section className="py-32 bg-primary-dark text-text-inverse">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn>
              <h2 className="text-5xl md:text-7xl font-display font-semibold tracking-tighter mb-16 leading-[1]">
                Infrastructure for<br/>deterministic building.
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Large Card */}
              <FadeIn delay={100} className="md:col-span-2 bg-primary p-10 lg:p-14 border border-primary-light/30 flex flex-col justify-between min-h-[400px] group hover:border-primary-light transition-colors">
                <div>
                  <Activity className="w-10 h-10 mb-8 text-primary-faint opacity-80" />
                  <h3 className="text-3xl lg:text-4xl font-display font-medium mb-4 tracking-tight">Computer Vision Validation</h3>
                  <p className="text-primary-faint opacity-80 text-lg lg:text-xl max-w-lg leading-relaxed">
                    Our proprietary models analyze site imagery against structural blueprints, flagging discrepancies down to the millimeter before authorizing payouts.
                  </p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-primary-faint opacity-50 group-hover:opacity-100 group-hover:text-success transition-all duration-300 mt-8" />
              </FadeIn>

              {/* Small Card 1 */}
              <FadeIn delay={200} className="bg-primary p-10 border border-primary-light/30 flex flex-col justify-between min-h-[400px] group hover:border-primary-light transition-colors">
                <div>
                  <Lock className="w-10 h-10 mb-8 text-primary-faint opacity-80" />
                  <h3 className="text-2xl font-display font-medium mb-4 tracking-tight">Programmatic Escrow</h3>
                  <p className="text-primary-faint opacity-80 leading-relaxed">
                    Funds are locked in secure digital vaults, releasing instantly only upon proof of milestone completion.
                  </p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-primary-faint opacity-50 group-hover:opacity-100 group-hover:text-success transition-all duration-300 mt-8" />
              </FadeIn>

              {/* Small Card 2 */}
              <FadeIn delay={300} className="bg-primary p-10 border border-primary-light/30 flex flex-col justify-between min-h-[400px] group hover:border-primary-light transition-colors">
                <div>
                  <Layers className="w-10 h-10 mb-8 text-primary-faint opacity-80" />
                  <h3 className="text-2xl font-display font-medium mb-4 tracking-tight">Immutable Audit Trail</h3>
                  <p className="text-primary-faint opacity-80 leading-relaxed">
                    Every image upload, AI verdict, and capital transfer is permanently logged.
                  </p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-primary-faint opacity-50 group-hover:opacity-100 group-hover:text-success transition-all duration-300 mt-8" />
              </FadeIn>

              {/* Large Card 2 */}
              <FadeIn delay={400} className="md:col-span-2 bg-primary p-10 lg:p-14 border border-primary-light/30 flex flex-col justify-between min-h-[400px] group hover:border-primary-light transition-colors">
                <div>
                  <ShieldCheck className="w-10 h-10 mb-8 text-primary-faint opacity-80" />
                  <h3 className="text-3xl lg:text-4xl font-display font-medium mb-4 tracking-tight">Eliminate the Trust Deficit</h3>
                  <p className="text-primary-faint opacity-80 text-lg lg:text-xl max-w-lg leading-relaxed">
                    With over 88% of projects facing delays globally, subjective reporting is obsolete. Switch to deterministic, visual-proof-based project management.
                  </p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-primary-faint opacity-50 group-hover:opacity-100 group-hover:text-success transition-all duration-300 mt-8" />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* STICKY SCROLL WORKFLOW */}
        <section className="py-32 bg-surface">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-20">
            <div className="md:w-1/3">
              <div className="sticky top-32">
                <h2 className="text-4xl md:text-6xl font-display font-semibold tracking-tighter mb-6">
                  The Protocol
                </h2>
                <p className="text-text-secondary text-lg mb-8">
                  A rigid, four-phase sequence designed to remove human bias from construction finance.
                </p>
                <Button className="rounded-none bg-text-primary text-text-inverse w-full md:w-auto h-12 px-6">
                  Read the Specs
                </Button>
              </div>
            </div>
            <div className="md:w-2/3 space-y-32 py-16">
              {[
                { step: "01", title: "Capital Allocation", desc: "Project owners deposit the full milestone value into an isolated, ConSync-managed escrow vault." },
                { step: "02", title: "Visual Submission", desc: "Upon phase completion, contractors submit high-resolution, geolocated visual evidence through the portal." },
                { step: "03", title: "Algorithmic Verification", desc: "The ConSync engine parses imagery, comparing as-built reality against specified architectural milestones." },
                { step: "04", title: "Automated Disbursement", desc: "A positive verdict triggers an irreversible, instant transfer of the allocated capital to the contractor." }
              ].map((s, i) => (
                <FadeIn key={i} className="flex gap-10 border-l border-border-strong pl-10 relative">
                  <div className="absolute w-3 h-3 bg-text-primary -left-[6.5px] top-2" />
                  <div>
                    <span className="font-mono text-sm text-text-muted tracking-widest block mb-4">PHASE {s.step}</span>
                    <h3 className="text-3xl font-display font-medium mb-4 tracking-tight">{s.title}</h3>
                    <p className="text-xl text-text-secondary leading-relaxed">{s.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING - Minimalist */}
        <section className="py-32 border-y border-border">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <FadeIn>
              <h2 className="text-5xl md:text-6xl font-display font-semibold tracking-tighter mb-6">
                Transparent Economics
              </h2>
              <p className="text-xl text-text-secondary mb-16">
                We align our success with yours. You only pay when a milestone is verified and capital is securely deployed.
              </p>
              <div className="bg-background border border-border-strong p-12 lg:p-16 relative overflow-hidden text-left shadow-2xl">
                <div className="absolute top-0 right-0 p-8">
                  <Box className="w-16 h-16 text-border-strong opacity-10" />
                </div>
                <span className="font-mono text-sm tracking-widest text-text-muted mb-4 block">STANDARD TIER</span>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-6xl sm:text-7xl lg:text-8xl font-display font-semibold tracking-tighter">1.5%</span>
                  <span className="text-text-secondary text-lg">/ transaction</span>
                </div>
                <ul className="space-y-6 mb-14">
                  {["Unlimited active projects", "Full AI verification engine access", "Automated escrow management", "Real-time immutable audit logs"].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-text-primary text-lg">
                      <div className="w-2 h-2 bg-success rounded-none" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button size="lg" className="w-full rounded-none bg-text-primary text-text-inverse h-16 text-xl hover:bg-text-primary/90">
                  Initialize Project
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
