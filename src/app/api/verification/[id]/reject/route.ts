import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireRole, withErrorHandling } from "@/lib/api-utils";

// POST /api/verification/[id]/reject — client rejects proof
export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = requireRole(req, "CLIENT");
  const { id } = await params;
  const body = await req.json();
  const { reason } = body;

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
      data: {
        status: "REJECTED",
        rejectReason: reason || "No reason provided",
        reviewedById: auth.id,
      },
    }),
    prisma.milestone.update({
      where: { id: verification.milestoneId },
      data: { status: "REJECTED" },
    }),
  ]);

  return successResponse({ message: "Verification rejected" });
});
