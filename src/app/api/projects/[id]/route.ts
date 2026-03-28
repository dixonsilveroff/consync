import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, withErrorHandling } from "@/lib/api-utils";

// GET /api/projects/[id]
export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = requireAuth(req);
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      contractor: { select: { id: true, name: true, email: true } },
      milestones: {
        orderBy: { order: "asc" },
        include: {
          verifications: {
            orderBy: { createdAt: "desc" },
            include: {
              submittedBy: { select: { id: true, name: true } },
              reviewedBy: { select: { id: true, name: true } },
            },
          },
        },
      },
      transactions: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) {
    return errorResponse("Project not found", 404);
  }

  // Check access
  if (
    auth.role === "CLIENT" && project.clientId !== auth.id ||
    auth.role === "CONTRACTOR" && project.contractorId !== auth.id
  ) {
    return errorResponse("Access denied", 403);
  }

  return successResponse(project);
});

// PUT /api/projects/[id]
export const PUT = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = requireAuth(req);
  const { id } = await params;
  const body = await req.json();

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return errorResponse("Project not found", 404);
  if (project.clientId !== auth.id) return errorResponse("Only the project client can update", 403);

  const { title, description, status, contractorId } = body;

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(contractorId !== undefined && { contractorId }),
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      contractor: { select: { id: true, name: true, email: true } },
      milestones: { orderBy: { order: "asc" } },
    },
  });

  return successResponse(updated);
});
