"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { dark } from "@clerk/themes";
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
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthSync />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
