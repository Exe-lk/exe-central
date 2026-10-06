import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { Prisma } from '@prisma/client';
import { errorResponse, isUuid } from '@/lib/outsourcingApi';

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project and outsourcing summary
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Project retrieved successfully }
 *       404: { description: Project not found }
 *   patch:
 *     summary: Update project information
 *     description: Updates project master information only. Financial workflow entities are managed through their dedicated APIs.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectNo: { type: string }
 *               name: { type: string }
 *               clientName: { type: string }
 *               clientCompany: { type: string, nullable: true }
 *               clientEmail: { type: string, nullable: true }
 *               clientPhone: { type: string, nullable: true }
 *               clientAddress: { type: string, nullable: true }
 *               country: { type: string, nullable: true }
 *               status: { type: string, enum: [DRAFT, IN_PROGRESS, PENDING_REVIEW, COMPLETED, CANCELLED] }
 *               startDate: { type: string, format: date, nullable: true }
 *               endDate: { type: string, format: date, nullable: true }
 *               projectManager: { type: string, nullable: true }
 *               description: { type: string, nullable: true }
 *     responses:
 *       200: { description: Project updated successfully }
 *       400: { description: Validation error }
 *       404: { description: Project not found }
 *   delete:
 *     summary: Delete a project
 *     description: Deletes only projects that do not have financial records. Financial records are protected by database restrictions.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Project deleted successfully }
 *       404: { description: Project not found }
 *       409: { description: Project has financial records and cannot be deleted }
 */

const validStatuses = ['DRAFT', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED'];

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid project UUID is required', 400);

    // const project = await prisma.project.findUnique({
    //   where: { id },
    //   include: {
    //     outsourcingProject: {
    //       include: {
    //         participants: true,
    //         package: { include: { milestones: { orderBy: { order: 'asc' } } } },
    //         additionalCosts: { include: { participant: true } },
    //       },
    //     },
    //     invoices: { orderBy: { createdAt: 'desc' }, include: { participant: true, milestone: true, payments: { include: { receipt: true } } } },
    //     payments: { orderBy: { createdAt: 'desc' }, include: { invoice: true, proof: true, receipt: true } },
    //     receipts: { orderBy: { generatedAt: 'desc' }, include: { items: true, payment: true } },
    //   },
    // });
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        outsourcingProject: {
          include: {
            participants: true,
            package: {                 // Add this entire package block
              include: {
                milestones: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        },
        invoices: true,
        payments: true,                // Crucial for the Receipts Tab later
        receipts: true,
        documentSeries: true
      },
    });


    if (!project) return jsonError('Project not found', 404);
    return jsonSuccess(project, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch project');
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid project UUID is required', 400);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError('Invalid or missing JSON request body', 400);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return jsonError('Project not found', 404);

    const b = body as Record<string, unknown>;
    const hasInvoices = await prisma.invoice.count({ where: { projectId: id } }) > 0;
    const lockedAfterInvoice = ['projectNo', 'name', 'clientName', 'clientCompany', 'country'];
    if (hasInvoices && lockedAfterInvoice.some((field) => b[field] !== undefined)) {
      return jsonError('Project identity/client fields cannot be changed after an invoice has been created', 409);
    }
    const data: Prisma.ProjectUpdateInput = {};

    if (b.projectNo !== undefined) {
      if (typeof b.projectNo !== 'string' || !b.projectNo.trim()) return jsonError('projectNo cannot be empty', 400);
      data.projectNo = b.projectNo.trim();
    }
    if (b.name !== undefined) {
      if (typeof b.name !== 'string' || !b.name.trim()) return jsonError('name cannot be empty', 400);
      data.name = b.name.trim();
    }
    if (b.clientName !== undefined) {
      if (typeof b.clientName !== 'string' || !b.clientName.trim()) return jsonError('clientName cannot be empty', 400);
      data.clientName = b.clientName.trim();
    }
    for (const field of ['clientCompany', 'clientEmail', 'clientPhone', 'clientAddress', 'country', 'projectManager', 'description'] as const) {
      if (b[field] !== undefined) data[field] = b[field] === null || b[field] === '' ? null : String(b[field]).trim();
    }
    if (b.status !== undefined) {
      if (typeof b.status !== 'string' || !validStatuses.includes(b.status)) return jsonError('Invalid project status', 400);
      data.status = b.status as any;
    }
    if (b.startDate !== undefined) data.startDate = b.startDate ? new Date(String(b.startDate)) : null;
    if (b.endDate !== undefined) data.endDate = b.endDate ? new Date(String(b.endDate)) : null;

    if (data.startDate instanceof Date && Number.isNaN(data.startDate.getTime())) return jsonError('Invalid startDate', 400);
    if (data.endDate instanceof Date && Number.isNaN(data.endDate.getTime())) return jsonError('Invalid endDate', 400);
    if (Object.keys(data).length === 0) return jsonError('No fields supplied for update', 400);

    const updated = await prisma.project.update({ where: { id }, data });
    return jsonSuccess(updated, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') return jsonError('Project number already exists', 409, { target: error.meta?.target });
      if (error.code === 'P2025') return jsonError('Project not found', 404);
    }
    return errorResponse(jsonError, error, 'Failed to update project');
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid project UUID is required', 400);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return jsonError('Project not found', 404);

    await prisma.project.delete({ where: { id } });
    return jsonSuccess({ message: 'Project deleted successfully', id }, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') return jsonError('Project cannot be deleted because it has financial records', 409);
      if (error.code === 'P2025') return jsonError('Project not found', 404);
    }
    return errorResponse(jsonError, error, 'Failed to delete project');
  }
}
