"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { AuthSync } from "./auth-sync";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL. Set it in your environment so Convex can initialize.",
  );
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1E4E8C",
          colorText: "#1A1C1E",
          colorBackground: "#FFFFFF",
          colorInputBackground: "#F8FAFC",
          colorInputText: "#1A1C1E",
          colorDanger: "#E63946",
          borderRadius: "12px",
          fontFamily: "var(--font-inter)",
        },
        elements: {
          card: "bg-surface border border-border shadow-md rounded-xl",
          headerTitle: "font-heading text-h3 text-text-primary",
          headerSubtitle: "text-body text-text-secondary",
          socialButtonsBlockButton:
            "border border-border bg-background text-text-primary hover:bg-primary-faint",
          formFieldLabel: "text-small font-medium text-text-primary",
          formFieldInput:
            "h-11 rounded-md border border-border bg-background text-text-primary focus:ring-2 focus:ring-primary/20",
          formButtonPrimary: "btn-primary h-11 w-full rounded-md text-body font-medium",
          footerActionLink: "text-primary hover:text-primary-dark",
          dividerLine: "bg-border",
          dividerText: "text-text-muted",
          userButtonBox: "rounded-full border border-border bg-surface",
          userButtonTrigger: "rounded-full border border-border bg-surface hover:bg-primary-faint",
          userButtonPopoverCard:
            "bg-surface border border-border shadow-md rounded-xl text-text-primary",
          userButtonPopoverMain: "px-2 py-2",
          userButtonPopoverFooter: "border-t border-border bg-background/60",
          userButtonPopoverActions: "gap-1",
          userButtonPopoverActionButton:
            "rounded-md px-3 py-2 text-small text-text-primary hover:bg-primary-faint",
          userButtonPopoverActionButtonText: "text-text-primary",
          userButtonPopoverActionButtonIcon: "text-text-muted",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthSync />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
