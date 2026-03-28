import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, withErrorHandling } from "@/lib/api-utils";

// PUT /api/milestones/[id]/delay — flag milestone delay status
export const PUT = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = requireAuth(req);
  const { id } = await params;
  const body = await req.json();
  const { delayFlag } = body;

  if (!delayFlag || !["ON_TRACK", "DELAYED", "STALLED"].includes(delayFlag)) {
    return errorResponse("delayFlag must be ON_TRACK, DELAYED, or STALLED");
  }

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!milestone) return errorResponse("Milestone not found", 404);

  // Only project client or contractor can flag delays
  if (milestone.project.clientId !== auth.id && milestone.project.contractorId !== auth.id) {
    return errorResponse("Access denied", 403);
  }

  const updated = await prisma.milestone.update({
    where: { id },
    data: { delayFlag },
  });

  return successResponse(updated);
});
