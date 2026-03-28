import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, withErrorHandling } from "@/lib/api-utils";

// POST /api/projects/[id]/milestones — add milestone to project
export const POST = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = requireAuth(req);
  const { id: projectId } = await params;
  const body = await req.json();
  const { title, description, amount, dueDate, order } = body;

  if (!title || amount === undefined || order === undefined) {
    return errorResponse("Title, amount, and order are required");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { milestones: true },
  });

  if (!project) return errorResponse("Project not found", 404);
  if (project.clientId !== auth.id) return errorResponse("Only the client can add milestones", 403);

  // Check milestone count limit (MVP: max 5)
  if (project.milestones.length >= 5) {
    return errorResponse("Maximum 5 milestones per project for MVP");
  }

  // Check total milestone amounts don't exceed budget
  const currentTotal = project.milestones.reduce((sum, m) => sum + m.amount, 0);
  if (currentTotal + amount > project.totalBudget) {
    return errorResponse(
      `Milestone amount would exceed budget. Remaining: ₦${(project.totalBudget - currentTotal).toLocaleString()}`
    );
  }

  const milestone = await prisma.milestone.create({
    data: {
      title,
      description,
      amount,
      order,
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
    },
  });

  return successResponse(milestone, 201);
});

// GET /api/projects/[id]/milestones — list milestones
export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  requireAuth(req);
  const { id: projectId } = await params;

  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    include: {
      verifications: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return successResponse(milestones);
});
