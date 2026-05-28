import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ConSync — Construction Verification & Payments",
  description:
    "Verify construction milestones with advanced AI. Release payments with confidence using our secure escrow platform.",
  keywords: [
    "construction verification",
    "milestone payment",
    "AI construction",
    "escrow",
    "construction management",
    "ConSync",
  ],
  openGraph: {
    title: "ConSync — Construction Verification & Payments",
    description:
      "Verify construction milestones with advanced AI. Release payments with confidence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(geistSans.variable, geistMono.variable, "font-sans")}>
      <body className="font-sans antialiased bg-background text-text-primary">
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
