import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireRole, requireAuth, withErrorHandling } from "@/lib/api-utils";

// POST /api/verification/[id]/approve — client approves proof
export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = requireRole(req, "CLIENT");
  const { id } = await params;

  const verification = await prisma.verification.findUnique({
    where: { id },
    include: { milestone: { include: { project: true } } },
  });

  if (!verification) return errorResponse("Verification not found", 404);
  if (verification.milestone.project.clientId !== auth.id) {
    return errorResponse("Not your project", 403);
  }
  if (verification.status !== "PENDING") {
    return errorResponse("Verification already reviewed");
  }

  await prisma.$transaction([
    prisma.verification.update({
      where: { id },
      data: { status: "APPROVED", reviewedById: auth.id },
    }),
    prisma.milestone.update({
      where: { id: verification.milestoneId },
      data: { status: "APPROVED" },
    }),
  ]);

  return successResponse({ message: "Verification approved. You can now release funds." });
});

// GET /api/verification/[id] — get verification details
export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  requireAuth(req);
  const { id } = await params;

  const verification = await prisma.verification.findUnique({
    where: { id },
    include: {
      submittedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      milestone: { select: { id: true, title: true, amount: true } },
    },
  });

  if (!verification) return errorResponse("Verification not found", 404);

  return successResponse(verification);
});
