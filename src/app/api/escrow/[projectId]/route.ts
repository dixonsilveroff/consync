import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, withErrorHandling } from "@/lib/api-utils";

// GET /api/escrow/[projectId] — get escrow balance + transaction history
export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  requireAuth(req);
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, totalBudget: true, escrowBalance: true },
  });

  if (!project) return errorResponse("Project not found", 404);

  const transactions = await prisma.transaction.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  const totalDeposited = transactions
    .filter((t) => t.type === "DEPOSIT" && t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReleased = transactions
    .filter((t) => t.type === "RELEASE" && t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  return successResponse({
    projectId,
    totalBudget: project.totalBudget,
    escrowBalance: project.escrowBalance,
    totalDeposited,
    totalReleased,
    transactions,
  });
});
