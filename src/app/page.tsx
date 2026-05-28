import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Shield, Brain, Wallet, ArrowRight, CheckCircle2, AlertTriangle, Image as ImageIcon, CheckSquare, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FadeIn } from "@/components/fade-in";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary-faint),_transparent_50%)]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn className="max-w-2xl">
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
            </FadeIn>

            {/* Abstract Mockup / Visual */}
            <FadeIn delay={200} className="relative hidden lg:block">
              {/* Glowing Background */}
              <div className="absolute inset-0 bg-cta-gradient opacity-30 blur-[100px] rounded-full animate-pulse-subtle" />

              {/* Floating Card */}
              <div className="relative bg-surface/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 rotate-2 hover:rotate-0 transition-transform duration-700 hover:-translate-y-2">
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-display font-medium text-small text-text-primary">Gemini Vision AI Analysis</span>
                  </div>
                  <span className="chip-approved shadow-sm bg-success/10 border-success/20">98.5% Confidence</span>
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
                  <div className="flex items-start gap-3 pt-4 border-t border-border/50">
                    <Wallet className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-small font-medium text-text-primary">Action Required</p>
                      <p className="text-micro text-text-secondary mt-1">Milestone verified. Ready for ₦2,500,000 Squad transfer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── The Problem ─── */}
        <section id="problem" className="py-24 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
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
                 <div className="bg-background p-6 rounded-xl border border-border flex flex-col justify-center shadow-sm">
                   <p className="text-display font-display text-danger mb-2">88%</p>
                   <p className="text-small text-text-secondary font-medium uppercase tracking-wide">Project Delay Rate</p>
                 </div>
                 <div className="bg-background p-6 rounded-xl border border-border flex flex-col justify-center shadow-sm">
                   <p className="text-display font-display text-primary mb-2">₦2.4T</p>
                   <p className="text-small text-text-secondary font-medium uppercase tracking-wide">Sector Value at Risk</p>
                 </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section id="features" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-small font-semibold text-primary uppercase tracking-wider mb-3">HOW WE SOLVE IT</p>
              <h2 className="font-display text-h1 text-text-primary mb-6">
                The Trust Loop
              </h2>
              <p className="text-body text-text-secondary">
                A closed-loop system combining Google's advanced multimodal AI with Squad's robust payment infrastructure.
              </p>
            </FadeIn>
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
                <FadeIn key={i} delay={i * 150} className="bg-surface rounded-xl border border-border p-8 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-primary-faint rounded-lg flex items-center justify-center text-primary mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-h3 text-text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-small text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="py-24 bg-surface border-y border-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <h2 className="font-display text-h2 text-text-primary">
                Four Steps to Secure Building
              </h2>
            </FadeIn>
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
                <FadeIn key={i} delay={i * 200} className="relative flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-full bg-background border-4 border-surface shadow-sm flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="text-micro font-bold text-primary mb-2">STEP {item.step}</span>
                  <h3 className="font-display text-h4 text-text-primary mb-3">{item.title}</h3>
                  <p className="text-small text-text-secondary leading-relaxed">{item.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials / Market Proof ─── */}
        <section id="testimonials" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-small font-semibold text-primary uppercase tracking-wider mb-3">TRUSTED BY LEADERS</p>
              <h2 className="font-display text-h2 text-text-primary">
                Built for Peace of Mind
              </h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FadeIn delay={100} className="bg-surface border border-border p-8 rounded-2xl shadow-sm relative">
                <div className="flex gap-1 text-amber-400 mb-6">
                  <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-body-md text-text-secondary italic mb-8 leading-relaxed">
                  "As an investor based in the UK, I used to lose sleep over the progress of my housing project in Lagos. ConSync's AI verification ensures I only pay for actual, verifiable work. It's completely changed the game for diaspora real estate."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">TA</div>
                  <div>
                    <p className="font-semibold text-text-primary">Tunde Adebayo</p>
                    <p className="text-small text-text-muted">Diaspora Investor</p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={300} className="bg-surface border border-border p-8 rounded-2xl shadow-sm relative">
                <div className="flex gap-1 text-amber-400 mb-6">
                  <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
                </div>
                <p className="text-body-md text-text-secondary italic mb-8 leading-relaxed">
                  "Before ConSync, getting milestone payments released was a nightmare of site visits and endless negotiations. Now, I upload my photos, the AI verifies the work, and the funds hit my Squad account instantly. It's efficient and fair."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-dark flex items-center justify-center text-white font-bold text-lg">PC</div>
                  <div>
                    <p className="font-semibold text-text-primary">Prime Construction Ltd</p>
                    <p className="text-small text-text-muted">Verified Contractor</p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── Business Model / Pricing ─── */}
        <section id="pricing" className="py-24 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
             <FadeIn className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-display text-h2 text-text-primary mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-body text-text-secondary">
                No hidden fees or monthly subscriptions. You only pay when a milestone is successfully verified and completed.
              </p>
            </FadeIn>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Tier */}
              <FadeIn delay={100} className="bg-background border border-border rounded-2xl p-8 flex flex-col">
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 bg-surface-raised border border-border rounded-full text-micro font-medium uppercase tracking-wider text-text-secondary mb-4">Starter</span>
                  <h3 className="text-display-sm font-display text-text-primary">1.5%</h3>
                  <p className="text-small text-text-muted mt-1">per successful milestone transaction</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /><span className="text-body-sm text-text-secondary">Unlimited Projects</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /><span className="text-body-sm text-text-secondary">Standard Gemini Vision AI Analysis</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /><span className="text-body-sm text-text-secondary">Squad DVA Escrow Infrastructure</span></li>
                </ul>
                <Button variant="outline" className="w-full">Get Started</Button>
              </FadeIn>

              {/* Developer Pro Tier */}
              <FadeIn delay={300} className="bg-primary border border-primary-dark rounded-2xl p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-bl-full" />
                <div className="mb-8 relative z-10">
                  <span className="inline-block px-3 py-1 bg-white/20 border border-white/30 rounded-full text-micro font-medium uppercase tracking-wider text-white mb-4">Developer Pro</span>
                  <h3 className="text-display-sm font-display text-white">1.0%</h3>
                  <p className="text-small text-white/70 mt-1">per successful milestone transaction</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-success-border shrink-0" /><span className="text-body-sm text-white/90">Everything in Starter</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-success-border shrink-0" /><span className="text-body-sm text-white/90">Priority AI Verification Queue</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-success-border shrink-0" /><span className="text-body-sm text-white/90">Dedicated Account Manager</span></li>
                </ul>
                <Button className="w-full bg-white text-primary hover:bg-surface-raised relative z-10">Contact Sales</Button>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── FAQ Section ─── */}
        <section id="faq" className="py-24 bg-background">
          <div className="max-w-3xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <h2 className="font-display text-h2 text-text-primary">
                Frequently Asked Questions
              </h2>
            </FadeIn>

            <FadeIn delay={200} className="space-y-4">
              {[
                {
                  q: "How secure are the escrow funds?",
                  a: "Extremely secure. All project funds are held in Dynamic Virtual Accounts (DVAs) powered by Squad, which operates under the regulatory framework of the Central Bank of Nigeria. ConSync only orchestrates the release trigger."
                },
                {
                  q: "What happens if the contractor disagrees with the AI's verdict?",
                  a: "ConSync implements a 'Human-in-the-Loop' system. If the AI rejects a milestone, the contractor receives detailed feedback and can either correct the issue and resubmit, or escalate the milestone for manual dispute resolution by the project owner."
                },
                {
                  q: "Can contractors trick the system with old or stolen photos?",
                  a: "We employ sophisticated metadata and EXIF data extraction to verify the timestamp and, where available, geolocation of all uploaded photos to ensure they represent current, on-site progress."
                },
                {
                  q: "How accurate is the Gemini Vision AI analysis?",
                  a: "Gemini Vision provides industry-leading multimodal analysis. While it is highly accurate at verifying visible structural elements (like reinforcement spacing or foundation presence), it supplements rather than completely replaces human oversight, offering a powerful initial verification layer."
                }
              ].map((faq, i) => (
                <details key={i} className="group bg-surface border border-border rounded-xl [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-6 font-medium text-text-primary">
                    {faq.q}
                    <ChevronDown className="w-5 h-5 text-text-muted transition-transform duration-300 group-open:-rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 text-text-secondary text-body-sm leading-relaxed border-t border-border pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </FadeIn>
          </div>
        </section>

        {/* ─── CTA Banner ─── */}
        <section className="py-24 bg-cta-gradient relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/5" />
          <FadeIn className="relative max-w-4xl mx-auto px-6 text-center">
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
          </FadeIn>
        </section>
      </main>

      <Footer />
    </div>
  );
}