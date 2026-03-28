import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireRole, withErrorHandling } from "@/lib/api-utils";

// POST /api/verification/submit — contractor submits proof
export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = requireRole(req, "CONTRACTOR");
  const body = await req.json();
  const { milestoneId, mediaUrls, notes } = body;

  if (!milestoneId || !mediaUrls || !Array.isArray(mediaUrls) || mediaUrls.length === 0) {
    return errorResponse("milestoneId and at least one mediaUrl are required");
  }

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });

  if (!milestone) return errorResponse("Milestone not found", 404);
  if (milestone.project.contractorId !== auth.id) {
    return errorResponse("You are not assigned to this project", 403);
  }

  if (milestone.status === "APPROVED") {
    return errorResponse("Milestone already approved");
  }

  // Create verification and update milestone status
  const [verification] = await prisma.$transaction([
    prisma.verification.create({
      data: {
        milestoneId,
        mediaUrls,
        notes,
        submittedById: auth.id,
      },
    }),
    prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: "SUBMITTED" },
    }),
  ]);

  return successResponse(verification, 201);
});
