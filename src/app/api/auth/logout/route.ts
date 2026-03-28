import { clearAuthCookies } from "@/lib/auth";
import { successResponse, withErrorHandling } from "@/lib/api-utils";

// POST /api/auth/logout
export const POST = withErrorHandling(async () => {
  await clearAuthCookies();
  return successResponse({ message: "Logged out" });
});
