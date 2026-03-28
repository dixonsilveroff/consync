import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRefreshToken, setAuthCookies, clearAuthCookies } from "@/lib/auth";
import { successResponse, errorResponse, withErrorHandling } from "@/lib/api-utils";

// POST /api/auth/refresh
export const POST = withErrorHandling(async (req: NextRequest) => {
  const token = req.cookies.get("refreshToken")?.value;
  if (!token) {
    return errorResponse("No refresh token", 401);
  }

  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    if (!user) {
      return errorResponse("User not found", 401);
    }

    await setAuthCookies(user.id, user.role);

    return successResponse({ user });
  } catch {
    await clearAuthCookies();
    return errorResponse("Invalid refresh token", 401);
  }
});
