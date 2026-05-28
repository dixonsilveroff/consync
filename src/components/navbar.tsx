import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="bg-background border-b border-border-strong sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="w-5 h-5 bg-text-primary"></span>
          <span className="font-display text-xl font-bold tracking-tighter text-text-primary">
            CONSYNC
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#problem" className="font-mono text-xs font-semibold tracking-widest text-text-secondary hover:text-primary-light link-hover-fx">
            PROTOCOL
          </Link>
          <Link href="#features" className="font-mono text-xs font-semibold tracking-widest text-text-secondary hover:text-primary-light link-hover-fx">
            INFRASTRUCTURE
          </Link>
          <Link href="#how-it-works" className="font-mono text-xs font-semibold tracking-widest text-text-secondary hover:text-primary-light link-hover-fx">
            ECONOMICS
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" className="font-mono text-xs font-semibold tracking-widest rounded-none">SIGN IN</Button>
            </SignInButton>
            <SignUpButton mode="modal"><Button variant="default" className="gap-2 bg-text-primary hover:bg-text-primary/90 text-text-inverse rounded-none h-10 px-6 font-mono text-xs tracking-widest">INITIALIZE<ArrowRight className="w-4 h-4" /></Button></SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-none border-border-strong font-mono text-xs tracking-widest">DASHBOARD</Button>
            </Link>
            <UserButton
              appearance={{
                elements: { avatarBox: "w-8 h-8 rounded-none border border-border-strong" },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}
