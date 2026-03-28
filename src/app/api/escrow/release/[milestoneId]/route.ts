import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireRole, withErrorHandling } from "@/lib/api-utils";

// POST /api/escrow/release/[milestoneId] — release funds for approved milestone
export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) => {
  const auth = requireRole(req, "CLIENT");
  const { milestoneId } = await params;

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });

  if (!milestone) return errorResponse("Milestone not found", 404);
  if (milestone.project.clientId !== auth.id) return errorResponse("Not your project", 403);
  if (milestone.status !== "APPROVED") {
    return errorResponse("Milestone must be approved before releasing funds");
  }

  // Check sufficient escrow balance
  if (milestone.project.escrowBalance < milestone.amount) {
    return errorResponse("Insufficient escrow balance");
  }

  // Check no existing release for this milestone
  const existingRelease = await prisma.transaction.findFirst({
    where: { milestoneId, type: "RELEASE", status: "COMPLETED" },
  });
  if (existingRelease) {
    return errorResponse("Funds already released for this milestone");
  }

  // Atomically create release transaction and deduct from escrow
  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        type: "RELEASE",
        amount: milestone.amount,
        status: "COMPLETED",
        note: `Release for milestone: ${milestone.title}`,
        projectId: milestone.projectId,
        milestoneId,
      },
    }),
    prisma.project.update({
      where: { id: milestone.projectId },
      data: { escrowBalance: { decrement: milestone.amount } },
    }),
  ]);

  return successResponse(transaction, 201);
});
