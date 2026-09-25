import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { Prisma, ProjectType, ProjectStatus } from '@prisma/client';

const VALID_PROJECT_TYPES = Object.values(ProjectType);
const VALID_PROJECT_STATUSES = Object.values(ProjectStatus);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Retrieve a single project by ID
 *     description: Fetches detailed information for a specific project by its unique UUID identifier.
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique UUID of the project
 *     responses:
 *       200:
 *         description: Project details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     projectNo:
 *                       type: string
 *                     name:
 *                       type: string
 *                     clientName:
 *                       type: string
 *                     clientCompany:
 *                       type: string
 *                       nullable: true
 *                     clientEmail:
 *                       type: string
 *                       nullable: true
 *                     clientPhone:
 *                       type: string
 *                       nullable: true
 *                     clientAddress:
 *                       type: string
 *                       nullable: true
 *                     type:
 *                       type: string
 *                       enum: [OUTSOURCING, INDUSTRIAL]
 *                     status:
 *                       type: string
 *                       enum: [DRAFT, IN_PROGRESS, PENDING_REVIEW, COMPLETED, CANCELLED]
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     projectManager:
 *                       type: string
 *                       nullable: true
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Project not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update an existing project
 *     description: Updates specified fields of an existing project identified by UUID.
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique UUID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectNo:
 *                 type: string
 *                 example: PRJ-2026-001
 *               name:
 *                 type: string
 *                 example: Updated ERP Integration
 *               clientName:
 *                 type: string
 *               clientCompany:
 *                 type: string
 *               clientEmail:
 *                 type: string
 *                 format: email
 *               clientPhone:
 *                 type: string
 *               clientAddress:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [OUTSOURCING, INDUSTRIAL]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, IN_PROGRESS, PENDING_REVIEW, COMPLETED, CANCELLED]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               projectManager:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Invalid fields, enum values, or duplicate project number
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a project
 *     description: Permanently deletes a project from the system by UUID.
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique UUID of the project to delete
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Project deleted successfully
 *                     id:
 *                       type: string
 *                       format: uuid
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return jsonError('Project ID is required', 400);
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return jsonError('Project not found', 404);
    }

    return jsonSuccess(project, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch project';
    return jsonError(message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return jsonError('Project ID is required', 400);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonError('Invalid or missing JSON request body', 400);
    }

    // Check if project exists
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return jsonError('Project not found', 404);
    }

    const updateData: Prisma.ProjectUpdateInput = {};

    if (body.projectNo !== undefined) {
      if (typeof body.projectNo !== 'string' || !body.projectNo.trim()) {
        return jsonError('projectNo cannot be empty', 400);
      }
      updateData.projectNo = body.projectNo.trim();
    }

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return jsonError('name cannot be empty', 400);
      }
      updateData.name = body.name.trim();
    }

    if (body.clientName !== undefined) {
      if (typeof body.clientName !== 'string' || !body.clientName.trim()) {
        return jsonError('clientName cannot be empty', 400);
      }
      updateData.clientName = body.clientName.trim();
    }

    if (body.clientCompany !== undefined) {
      updateData.clientCompany = body.clientCompany ? String(body.clientCompany).trim() : null;
    }

    if (body.clientEmail !== undefined) {
      updateData.clientEmail = body.clientEmail ? String(body.clientEmail).trim() : null;
    }

    if (body.clientPhone !== undefined) {
      updateData.clientPhone = body.clientPhone ? String(body.clientPhone).trim() : null;
    }

    if (body.clientAddress !== undefined) {
      updateData.clientAddress = body.clientAddress ? String(body.clientAddress).trim() : null;
    }

    if (body.type !== undefined) {
      if (!VALID_PROJECT_TYPES.includes(body.type as ProjectType)) {
        return jsonError(`Invalid project type '${body.type}'. Allowed values: ${VALID_PROJECT_TYPES.join(', ')}`, 400);
      }
      updateData.type = body.type as ProjectType;
    }

    if (body.status !== undefined) {
      if (!VALID_PROJECT_STATUSES.includes(body.status as ProjectStatus)) {
        return jsonError(`Invalid project status '${body.status}'. Allowed values: ${VALID_PROJECT_STATUSES.join(', ')}`, 400);
      }
      updateData.status = body.status as ProjectStatus;
    }

    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    }

    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    if (body.projectManager !== undefined) {
      updateData.projectManager = body.projectManager ? String(body.projectManager).trim() : null;
    }

    if (body.description !== undefined) {
      updateData.description = body.description ? String(body.description).trim() : null;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return jsonSuccess(updatedProject, 200);
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return jsonError('Project number already exists', 400, { target: err.meta?.target });
      }
      if (err.code === 'P2025') {
        return jsonError('Project not found', 404);
      }
    }
    const message = err instanceof Error ? err.message : 'Failed to update project';
    return jsonError(message, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return jsonError('Project ID is required', 400);
    }

    // Check if project exists
    const existing = await prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      return jsonError('Project not found', 404);
    }

    await prisma.project.delete({
      where: { id },
    });

    return jsonSuccess({ message: 'Project deleted successfully', id }, 200);
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return jsonError('Project not found', 404);
    }
    const message = err instanceof Error ? err.message : 'Failed to delete project';
    return jsonError(message, 500);
  }
}