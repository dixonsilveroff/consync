import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireRole, withErrorHandling } from "@/lib/api-utils";

// POST /api/escrow/deposit — client deposits funds into project escrow (simulated)
export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = requireRole(req, "CLIENT");
  const body = await req.json();
  const { projectId, amount } = body;

  if (!projectId || !amount || amount <= 0) {
    return errorResponse("Valid projectId and positive amount are required");
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return errorResponse("Project not found", 404);
  if (project.clientId !== auth.id) return errorResponse("Not your project", 403);

  // Check deposit doesn't exceed budget
  if (project.escrowBalance + amount > project.totalBudget) {
    return errorResponse(
      `Deposit would exceed budget. Max deposit: ₦${(project.totalBudget - project.escrowBalance).toLocaleString()}`
    );
  }

  // Create transaction and update balance atomically
  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        type: "DEPOSIT",
        amount,
        status: "COMPLETED",
        note: "Escrow deposit (simulated)",
        projectId,
      },
    }),
    prisma.project.update({
      where: { id: projectId },
      data: {
        escrowBalance: { increment: amount },
        status: "ACTIVE",
      },
    }),
  ]);

  return successResponse(transaction, 201);
});
