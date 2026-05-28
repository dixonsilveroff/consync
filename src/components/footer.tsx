import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border-strong pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="w-6 h-6 bg-text-primary"></span>
              <span className="font-display text-2xl font-bold tracking-tighter text-text-primary">
                CONSYNC
              </span>
            </Link>
            <p className="text-base text-text-secondary leading-relaxed">
              Construction payments, automated via deterministic AI verification.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-mono text-sm tracking-widest text-text-muted mb-6">PROTOCOL</h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-base text-text-secondary hover:text-text-primary transition-colors">Visual AI</Link></li>
              <li><Link href="#features" className="text-base text-text-secondary hover:text-text-primary transition-colors">Digital Escrow</Link></li>
              <li><Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">Owner Portal</Link></li>
              <li><Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">Contractor Portal</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-mono text-sm tracking-widest text-text-muted mb-6">RESOURCES</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">Case Studies</Link></li>
              <li><Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">API Reference</Link></li>
              <li><Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="font-mono text-sm tracking-widest text-text-muted mb-6">LEGAL</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs tracking-widest text-text-muted">
            © 2026 CONSYNC. ALL RIGHTS RESERVED.
          </p>
          <p className="font-mono text-xs tracking-widest text-text-muted">
            SECURE INFRASTRUCTURE
          </p>
        </div>
      </div>
    </footer>
  );
}
