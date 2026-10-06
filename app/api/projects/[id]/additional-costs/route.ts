import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { ProjectType } from '@prisma/client';
import { errorResponse, isUuid, parsePositiveDecimal } from '@/lib/outsourcingApi';

/**
 * @swagger
 * /api/projects/{id}/additional-costs:
 *   get:
 *     summary: List project additional costs
 *     tags: [Additional Costs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Additional costs retrieved successfully }
 *       404: { description: Project not found }
 *   post:
 *     summary: Add an additional outsourcing project cost
 *     description: Costs are locked once an invoice exists so historical invoice amounts cannot become inconsistent.
 *     tags: [Additional Costs]
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
 *             required: [description, amount]
 *             properties:
 *               description: { type: string, example: UI/UX Design }
 *               amount: { type: number, example: 5000 }
 *               participantId: { type: string, format: uuid, nullable: true }
 *     responses:
 *       201: { description: Cost created successfully }
 *       400: { description: Validation error }
 *       404: { description: Project or participant not found }
 *       409: { description: Project has started financial processing }
 *   patch:
 *     summary: Update an additional outsourcing project cost
 *     tags: [Additional Costs]
 *   delete:
 *     summary: Delete an additional outsourcing project cost
 *     tags: [Additional Costs]
 */

async function getOutsourcingProject(id: string) {
  const project = await prisma.project.findUnique({ where: { id }, include: { outsourcingProject: true } });
  if (!project) throw new Error('PROJECT_NOT_FOUND');
  if (project.type !== ProjectType.OUTSOURCING || !project.outsourcingProject) throw new Error('OUTSOURCING_ONLY');
  return project;
}

async function assertCostUnlocked(projectId: string) {
  const invoiceExists = await prisma.invoice.count({ where: { projectId } }) > 0;
  if (invoiceExists) throw new Error('COST_LOCK');
}

async function validateParticipant(projectId: string, participantId: unknown) {
  if (participantId === undefined || participantId === null || participantId === '') return null;
  if (!isUuid(participantId)) throw new Error('PARTICIPANT_NOT_FOUND');
  const participant = await prisma.outsourcingParticipant.findUnique({ where: { id: String(participantId) } });
  if (!participant) throw new Error('PARTICIPANT_NOT_FOUND');
  const outsourcingProject = await prisma.outsourcingProject.findUnique({ where: { id: participant.outsourcingProjectId } });
  if (!outsourcingProject || outsourcingProject.projectId !== projectId) throw new Error('PARTICIPANT_MISMATCH');
  return participant.id;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid project UUID is required', 400);
    const project = await getOutsourcingProject(id);
    const costs = await prisma.outsourcingAdditionalCost.findMany({
      where: { outsourcingProjectId: project.outsourcingProject!.id },
      include: { participant: true },
      orderBy: { id: 'desc' },
    });
    return jsonSuccess(costs, 200, { total: costs.length });
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch additional costs');
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid project UUID is required', 400);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError('Invalid or missing JSON request body', 400);

    const { description, amount, participantId } = body as Record<string, unknown>;
    if (typeof description !== 'string' || !description.trim()) return jsonError('description is required', 400);

    const project = await getOutsourcingProject(id);
    await assertCostUnlocked(id);
    const normalizedParticipantId = await validateParticipant(id, participantId);
    const amountDec = parsePositiveDecimal(amount, 'amount');

    const cost = await prisma.outsourcingAdditionalCost.create({
      data: {
        outsourcingProjectId: project.outsourcingProject!.id,
        participantId: normalizedParticipantId,
        description: description.trim(),
        amount: amountDec,
      },
      include: { participant: true },
    });

    return jsonSuccess(cost, 201);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to create additional cost');
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid project UUID is required', 400);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError('Invalid or missing JSON request body', 400);

    const { costId, description, amount, participantId } = body as Record<string, unknown>;
    if (!isUuid(costId)) return jsonError('costId is required and must be a valid UUID', 400);
    if (description === undefined && amount === undefined && participantId === undefined) return jsonError('At least one field must be supplied for update', 400);

    const project = await getOutsourcingProject(id);
    await assertCostUnlocked(id);
    const existing = await prisma.outsourcingAdditionalCost.findUnique({ where: { id: String(costId) } });
    if (!existing) throw new Error('ADDITIONAL_COST_NOT_FOUND');
    if (existing.outsourcingProjectId !== project.outsourcingProject!.id) throw new Error('ADDITIONAL_COST_MISMATCH');

    const data: { description?: string; amount?: ReturnType<typeof parsePositiveDecimal>; participantId?: string | null } = {};
    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) return jsonError('description cannot be empty', 400);
      data.description = description.trim();
    }
    if (amount !== undefined) data.amount = parsePositiveDecimal(amount, 'amount');
    if (participantId !== undefined) data.participantId = await validateParticipant(id, participantId);

    const updated = await prisma.outsourcingAdditionalCost.update({ where: { id: String(costId) }, data, include: { participant: true } });
    return jsonSuccess(updated, 200);
  } catch (error) {
    if (error instanceof Error && error.message === 'ADDITIONAL_COST_NOT_FOUND') return jsonError('Additional cost record not found', 404);
    if (error instanceof Error && error.message === 'ADDITIONAL_COST_MISMATCH') return jsonError('Additional cost does not belong to this project', 400);
    return errorResponse(jsonError, error, 'Failed to update additional cost');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid project UUID is required', 400);
    const { searchParams } = new URL(request.url);
    const costId = searchParams.get('costId');
    if (!isUuid(costId)) return jsonError('costId query parameter is required and must be a valid UUID', 400);

    const project = await getOutsourcingProject(id);
    await assertCostUnlocked(id);
    const target = await prisma.outsourcingAdditionalCost.findUnique({ where: { id: costId } });
    if (!target) throw new Error('ADDITIONAL_COST_NOT_FOUND');
    if (target.outsourcingProjectId !== project.outsourcingProject!.id) throw new Error('ADDITIONAL_COST_MISMATCH');

    await prisma.outsourcingAdditionalCost.delete({ where: { id: costId } });
    return jsonSuccess({ message: 'Additional cost deleted successfully', id: costId }, 200);
  } catch (error) {
    if (error instanceof Error && error.message === 'ADDITIONAL_COST_NOT_FOUND') return jsonError('Additional cost record not found', 404);
    if (error instanceof Error && error.message === 'ADDITIONAL_COST_MISMATCH') return jsonError('Additional cost does not belong to this project', 400);
    return errorResponse(jsonError, error, 'Failed to delete additional cost');
  }
}
