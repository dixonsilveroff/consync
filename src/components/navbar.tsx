import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="ConSync Logo" width={32} height={32} className="rounded-md" />
          <span className="font-display text-h3 text-text-primary">
            ConSync
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#problem" className="text-small font-medium text-text-secondary hover:text-primary transition-colors">
            The Problem
          </Link>
          <Link href="#features" className="text-small font-medium text-text-secondary hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-small font-medium text-text-secondary hover:text-primary transition-colors">
            How it Works
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="default" className="gap-2 bg-cta-gradient hover:bg-cta-gradient-hover border-0 text-white">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
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
  );
}
