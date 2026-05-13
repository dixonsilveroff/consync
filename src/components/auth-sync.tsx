"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect } from "react";

/**
 * A hidden component that synchronizes the Clerk user session with the Convex database.
 * It must be placed inside an <Authenticated> boundary.
 */
export function AuthSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    // Only run if the user is fully loaded and signed in
    if (!isLoaded || !isSignedIn || !user) return;

    // We only need the primary email address
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return; // Rare, but possible depending on auth config

    // Fallback if the user hasn't set a first name yet
    const firstName = user.firstName || email.split("@")[0];
    const lastName = user.lastName || undefined;

    // Call the sync mutation
    syncUser({
      email,
      firstName,
      lastName,
    }).catch((err) => {
      console.error("Failed to sync user to Convex:", err);
    });
  }, [isLoaded, isSignedIn, user, syncUser]);

  return null; // This component does not render anything
}
