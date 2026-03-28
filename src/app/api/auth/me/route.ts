import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, withErrorHandling } from "@/lib/api-utils";

// GET /api/auth/me
export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = requireAuth(req);

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { id: true, name: true, email: true, role: true, phone: true },
  });

  if (!user) {
    return errorResponse("User not found", 404);
  }

  return successResponse({ user });
});
