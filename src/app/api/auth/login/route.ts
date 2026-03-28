import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, setAuthCookies } from "@/lib/auth";
import { successResponse, errorResponse, withErrorHandling } from "@/lib/api-utils";

// POST /api/auth/login
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse("Email and password are required");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return errorResponse("Invalid credentials", 401);
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return errorResponse("Invalid credentials", 401);
  }

  await setAuthCookies(user.id, user.role);

  return successResponse({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
  });
});
