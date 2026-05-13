"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * RoleRedirect Component
 * 
 * Fetches the current user's profile from Convex and redirects them 
 * to their specific dashboard based on their role.
 */
export function RoleRedirect() {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);

  useEffect(() => {
    if (user === undefined) return; // Loading

    if (!user) {
      // Not in Convex yet? Wait for sync or go home
      return;
    }

    if (user.role === "contractor") {
      router.replace("/contractor/projects");
    } else {
      router.replace("/owner/projects");
    }
  }, [user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-on-surface-variant font-medium animate-pulse">
        Loading dashboard...
      </p>
    </div>
  );
}
