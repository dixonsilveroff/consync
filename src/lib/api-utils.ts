import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./auth";

// ─── Standard JSON responses ──────────────────────────────

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// ─── Auth middleware for API routes ───────────────────────

export interface AuthPayload {
  id: string;
  role: string;
}

export function getAuthPayload(req: NextRequest): AuthPayload | null {
  // Check Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      return verifyAccessToken(authHeader.slice(7));
    } catch {
      return null;
    }
  }

  // Fall back to cookie
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return null;

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest) {
  const payload = getAuthPayload(req);
  if (!payload) {
    throw new AuthError("Authentication required", 401);
  }
  return payload;
}

export function requireRole(req: NextRequest, ...roles: string[]) {
  const payload = requireAuth(req);
  if (!roles.includes(payload.role)) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return payload;
}

// ─── Custom error class ──────────────────────────────────

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ─── Wrapper for API route handlers ──────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (req: NextRequest, context: any) => Promise<NextResponse>;

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof AuthError) {
        return errorResponse(error.message, error.status);
      }
      console.error("API Error:", error);
      return errorResponse("Internal server error", 500);
    }
  };
}
