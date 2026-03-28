import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, comparePassword, setAuthCookies, clearAuthCookies } from "@/lib/auth";
import { successResponse, errorResponse, withErrorHandling } from "@/lib/api-utils";

// POST /api/auth/register
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { name, email, password, role, phone } = body;

  if (!name || !email || !password || !role) {
    return errorResponse("Name, email, password, and role are required");
  }

  if (!["CLIENT", "CONTRACTOR", "SUPPLIER"].includes(role)) {
    return errorResponse("Role must be CLIENT, CONTRACTOR, or SUPPLIER");
  }

  if (password.length < 6) {
    return errorResponse("Password must be at least 6 characters");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse("Email already in use", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, phone },
    select: { id: true, name: true, email: true, role: true, phone: true },
  });

  await setAuthCookies(user.id, user.role);

  return successResponse({ user }, 201);
});
