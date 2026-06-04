"use client";

import { useEffect, useRef, useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);
  const navLinks = [
    { href: "#problem", label: "PROTOCOL" },
    { href: "#features", label: "INFRASTRUCTURE" },
    { href: "#how-it-works", label: "ECONOMICS" },
  ];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    lastActiveElement.current = document.activeElement as HTMLElement | null;
    const menu = menuRef.current;
    const focusable = menu
      ? Array.from(
          menu.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        )
      : [];

    const focusFirst = () => {
      const focusTarget = closeButtonRef.current ?? focusable[0];
      focusTarget?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    focusFirst();
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      lastActiveElement.current?.focus();
    };
  }, [isOpen]);

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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs font-semibold tracking-widest text-text-secondary hover:text-primary-light link-hover-fx"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" className="font-mono text-xs font-semibold tracking-widest rounded-none">
                  SIGN IN
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  variant="default"
                  className="gap-2 bg-text-primary hover:bg-text-primary/90 text-text-inverse rounded-none h-10 px-6 font-mono text-xs tracking-widest"
                >
                  START NOW
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button variant="outline" className="rounded-none border-border-strong font-mono text-xs tracking-widest">
                  DASHBOARD
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: { avatarBox: "w-8 h-8 rounded-none border border-border-strong" },
                }}
              />
            </Show>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            className="md:hidden inline-flex items-center gap-2 border border-border-strong rounded-none px-3 py-2 font-mono text-xs font-semibold tracking-widest text-text-primary hover:bg-surface"
          >
            <Menu className="w-4 h-4" />
            MENU
          </button>
        </div>
      </div>
      <div
        id="mobile-nav"
        ref={menuRef}
        aria-hidden={!isOpen}
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-base ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-text-primary/40"
        />
        <div
          role="dialog"
          aria-modal="true"
          className={`absolute right-0 top-0 h-full w-72 bg-background border-l border-border-strong p-6 flex flex-col gap-6 transition-transform duration-base ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-border-strong pb-4">
            <span className="font-mono text-xs font-semibold tracking-widest text-text-secondary">
              NAVIGATION
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              ref={closeButtonRef}
              className="border border-border-strong rounded-none p-2 text-text-primary hover:bg-surface"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-mono text-xs font-semibold tracking-widest text-text-secondary hover:text-primary-light link-hover-fx"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3 border-t border-border-strong pt-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="w-full justify-center font-mono text-xs font-semibold tracking-widest rounded-none border border-border-strong"
                >
                  SIGN IN
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  variant="default"
                  className="w-full justify-center gap-2 bg-text-primary hover:bg-text-primary/90 text-text-inverse rounded-none h-11 font-mono text-xs tracking-widest"
                >
                  START NOW
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-center rounded-none border-border-strong font-mono text-xs tracking-widest"
                >
                  DASHBOARD
                </Button>
              </Link>
              <div className="flex items-center justify-between border border-border-strong p-2">
                <span className="font-mono text-xs tracking-widest text-text-secondary">ACCOUNT</span>
                <UserButton
                  appearance={{
                    elements: { avatarBox: "w-8 h-8 rounded-none border border-border-strong" },
                  }}
                />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}
