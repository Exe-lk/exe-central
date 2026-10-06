import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { Prisma, ProjectType } from '@prisma/client';
import { errorResponse, parseDateOnly, parseNonNegativeDecimal, isUuid } from '@/lib/outsourcingApi';

/**
 * @swagger
 * /api/projects/{id}/package:
 *   get:
 *     summary: Get the outsourcing payment package
 *     tags: [Project Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Package retrieved successfully }
 *       404: { description: Project not found }
 *       400: { description: Project is not an outsourcing project }
 *   post:
 *     summary: Create or replace an outsourcing payment package
 *     description: Replacement is allowed only before the project has any invoice or payment. Existing milestones are replaced atomically.
 *     tags: [Project Packages]
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
 *             required: [name, totalAmount, milestones]
 *             properties:
 *               name: { type: string, example: 03 Month }
 *               totalAmount: { type: number, example: 75000 }
 *               discountAmount: { type: number, default: 0 }
 *               taxAmount: { type: number, default: 0 }
 *               templateId: { type: string, format: uuid, nullable: true }
 *               milestones:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [name, amount, order]
 *                   properties:
 *                     name: { type: string, example: Advance }
 *                     amount: { type: number, example: 12500 }
 *                     order: { type: integer, example: 1 }
 *                     dueDate: { type: string, format: date, nullable: true }
 *     responses:
 *       201: { description: Package created or replaced successfully }
 *       400: { description: Validation error }
 *       404: { description: Project or template not found }
 *       409: { description: Financial processing has started }
 *       500: { description: Internal server error }
 */

async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { outsourcingProject: true },
  });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid project UUID is required', 400);

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        outsourcingProject: {
          include: {
            package: { include: { milestones: { orderBy: { order: 'asc' } } } },
          },
        },
      },
    });

    if (!project) return jsonError('Project not found', 404);
    if (project.type !== ProjectType.OUTSOURCING || !project.outsourcingProject) {
      return jsonError('Packages are only applicable for OUTSOURCING projects', 400);
    }

    return jsonSuccess(project.outsourcingProject.package ?? null, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch project package');
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid project UUID is required', 400);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return jsonError('Invalid or missing JSON request body', 400);
    }

    const { name, totalAmount, discountAmount = 0, taxAmount = 0, templateId, milestones } = body as Record<string, unknown>;
    if (typeof name !== 'string' || !name.trim()) return jsonError('name is required', 400);
    if (!Array.isArray(milestones) || milestones.length === 0) return jsonError('At least one milestone is required', 400);
    if (templateId !== undefined && templateId !== null && !isUuid(templateId)) return jsonError('templateId must be a valid UUID', 400);

    const project = await getProject(id);
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    if (project.type !== ProjectType.OUTSOURCING || !project.outsourcingProject) throw new Error('OUTSOURCING_ONLY');

    const [invoiceCount, paymentCount] = await prisma.$transaction([
      prisma.invoice.count({ where: { projectId: id } }),
      prisma.payment.count({ where: { projectId: id } }),
    ]);
    if (invoiceCount > 0 || paymentCount > 0) throw new Error('FINANCIAL_LOCK');

    if (templateId) {
      const template = await prisma.packageTemplate.findUnique({ where: { id: String(templateId) } });
      if (!template) throw new Error('TEMPLATE_NOT_FOUND');
    }

    const total = parseNonNegativeDecimal(totalAmount, 'totalAmount');
    const discount = parseNonNegativeDecimal(discountAmount, 'discountAmount');
    const tax = parseNonNegativeDecimal(taxAmount, 'taxAmount');
    if (discount.gt(total)) return jsonError('discountAmount cannot exceed package total', 400);

    const normalizedMilestones: Array<{
      name: string;
      amount: Prisma.Decimal;
      order: number;
      dueDate: Date | null;
    }> = [];

    const seenOrders = new Set<number>();
    let milestoneSum = new Prisma.Decimal(0);

    for (const item of milestones) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return jsonError('Each milestone must be an object', 400);
      const m = item as Record<string, unknown>;
      if (typeof m.name !== 'string' || !m.name.trim()) return jsonError('Each milestone requires a name', 400);
      if (!Number.isInteger(m.order) || Number(m.order) <= 0) return jsonError('Milestone order must be a positive integer', 400);
      if (seenOrders.has(Number(m.order))) return jsonError('Milestone order values must be unique', 400);
      seenOrders.add(Number(m.order));

      const amount = parseNonNegativeDecimal(m.amount, 'milestoneAmount');
      const dueDate = parseDateOnly(m.dueDate, 'dueDate');
      normalizedMilestones.push({ name: m.name.trim(), amount, order: Number(m.order), dueDate });
      milestoneSum = milestoneSum.add(amount);
    }

    if (!milestoneSum.eq(total)) {
      return jsonError(`Milestone total (${milestoneSum.toString()}) must equal package total (${total.toString()})`, 400);
    }

    const created = await prisma.$transaction(async (tx) => {
      const current = await tx.project.findUnique({ where: { id }, include: { outsourcingProject: true } });
      if (!current) throw new Error('PROJECT_NOT_FOUND');
      if (current.type !== ProjectType.OUTSOURCING || !current.outsourcingProject) throw new Error('OUTSOURCING_ONLY');

      const hasFinancialActivity = await tx.invoice.count({ where: { projectId: id } }) > 0 ||
        await tx.payment.count({ where: { projectId: id } }) > 0;
      if (hasFinancialActivity) throw new Error('FINANCIAL_LOCK');

      const oldPackage = await tx.projectPackage.findUnique({ where: { outsourcingProjectId: current.outsourcingProject.id } });
      if (oldPackage) await tx.projectPackage.delete({ where: { id: oldPackage.id } });

      return tx.projectPackage.create({
        data: {
          outsourcingProjectId: current.outsourcingProject.id,
          templateId: templateId ? String(templateId) : null,
          name: name.trim(),
          totalAmount: total,
          discountAmount: discount,
          taxAmount: tax,
          milestones: {
            create: normalizedMilestones.map((m) => ({
              name: m.name,
              amount: m.amount,
              order: m.order,
              dueDate: m.dueDate,
            })),
          },
        },
        include: { milestones: { orderBy: { order: 'asc' } } },
      });
    });

    return jsonSuccess(created, 201);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to create project package');
  }
}

export const runtime = 'nodejs';
