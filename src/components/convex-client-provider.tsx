"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { dark } from "@clerk/themes";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Lazily initialize the client only if URL is available
let convex: ConvexReactClient | null = null;
if (convexUrl) {
  convex = new ConvexReactClient(convexUrl);
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#adc8f5",
          colorBackground: "#1a1c1f",
          colorInputBackground: "#111316",
          colorText: "#e2e2e5",
          borderRadius: "0px",
        },
      }}
    >
      {convex ? (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      ) : (
        // Render children without Convex when URL not configured
        <>{children}</>
      )}
    </ClerkProvider>
  );
}
