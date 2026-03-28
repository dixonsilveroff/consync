import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth, requireRole, withErrorHandling } from "@/lib/api-utils";

// GET /api/projects — list user's projects
export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = requireAuth(req);

  const where =
    auth.role === "CLIENT"
      ? { clientId: auth.id }
      : auth.role === "CONTRACTOR"
        ? { contractorId: auth.id }
        : {};

  const projects = await prisma.project.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true } },
      contractor: { select: { id: true, name: true, email: true } },
      milestones: { orderBy: { order: "asc" } },
      _count: { select: { transactions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(projects);
});

// POST /api/projects — create project (client only)
export const POST = withErrorHandling(async (req: NextRequest) => {
  const auth = requireRole(req, "CLIENT");
  const body = await req.json();
  const { title, description, totalBudget, contractorId } = body;

  if (!title || totalBudget === undefined) {
    return errorResponse("Title and totalBudget are required");
  }

  if (totalBudget <= 0) {
    return errorResponse("Budget must be greater than zero");
  }

  // Validate contractor exists if provided
  if (contractorId) {
    const contractor = await prisma.user.findUnique({
      where: { id: contractorId, role: "CONTRACTOR" },
    });
    if (!contractor) {
      return errorResponse("Contractor not found", 404);
    }
  }

  const project = await prisma.project.create({
    data: {
      title,
      description,
      totalBudget,
      clientId: auth.id,
      contractorId: contractorId || null,
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      contractor: { select: { id: true, name: true, email: true } },
    },
  });

  return successResponse(project, 201);
});
