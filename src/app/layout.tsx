import type { Metadata } from "next";
import { Poppins, Inter, Geist, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ConSync — AI-Powered Construction Verification",
  description:
    "Milestone verification and conditional payment release for construction projects. Powered by AI vision analysis and Squad payment infrastructure.",
  keywords: [
    "construction verification",
    "milestone payment",
    "AI construction",
    "escrow",
    "Nigeria construction",
    "ConSync",
  ],
  openGraph: {
    title: "ConSync — AI-Powered Construction Verification",
    description:
      "Verify construction milestones with AI. Release payments with confidence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(poppins.variable, inter.variable, jetbrainsMono.variable, "font-sans", geist.variable)}>
      <body className="font-body antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
