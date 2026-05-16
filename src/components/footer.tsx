import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="ConSync Logo" width={28} height={28} className="rounded-md" />
              <span className="font-display text-h4 text-text-primary">
                ConSync
              </span>
            </Link>
            <p className="text-small text-text-secondary leading-relaxed">
              AI-powered construction verification and conditional escrow releases for a trustless building environment.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-small text-text-secondary hover:text-primary transition-colors">AI Vision</Link></li>
              <li><Link href="#features" className="text-small text-text-secondary hover:text-primary transition-colors">Squad Escrow</Link></li>
              <li><Link href="#" className="text-small text-text-secondary hover:text-primary transition-colors">For Owners</Link></li>
              <li><Link href="#" className="text-small text-text-secondary hover:text-primary transition-colors">For Contractors</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-small text-text-secondary hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-small text-text-secondary hover:text-primary transition-colors">Hackathon Pitch</Link></li>
              <li><Link href="#" className="text-small text-text-secondary hover:text-primary transition-colors">API Reference</Link></li>
              <li><Link href="#" className="text-small text-text-secondary hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-small text-text-secondary hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-small text-text-secondary hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-small text-text-secondary hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-micro text-text-muted">
            © 2026 ConSync — Built for Squad Hackathon 3.0
          </p>
          <p className="text-micro text-text-muted">
            Powered by Google Gemini 2.0 & Squad API
          </p>
        </div>
      </div>
    </footer>
  );
}
