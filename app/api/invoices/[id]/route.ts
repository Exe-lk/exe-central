import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { Prisma, InvoiceStatus } from '@prisma/client';
import { errorResponse, isUuid } from '@/lib/outsourcingApi';

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get an invoice with payments and proof
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Invoice retrieved successfully }
 *       404: { description: Invoice not found }
 *   patch:
 *     summary: Update invoice document metadata
 *     description: Allows only safe metadata changes. Financial amounts, invoice number, participant, milestone, and status are not client-editable.
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentNote: { type: string, nullable: true }
 *               dueDate: { type: string, format: date, nullable: true }
 *     responses:
 *       200: { description: Invoice updated successfully }
 *       400: { description: Validation error }
 *       404: { description: Invoice not found }
 *       409: { description: Invoice is locked }
 */

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid invoice UUID is required', 400);

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        project: true,
        participant: true,
        milestone: true,
        payments: { orderBy: { createdAt: 'desc' }, include: { proof: true, receipt: { include: { items: true } } } },
      },
    });
    if (!invoice) return jsonError('Invoice not found', 404);

    return jsonSuccess(invoice, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch invoice');
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid invoice UUID is required', 400);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError('Invalid or missing JSON request body', 400);

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return jsonError('Invoice not found', 404);
    if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELLED) {
      return jsonError('Paid or cancelled invoices cannot be edited', 409);
    }

    const data: Prisma.InvoiceUpdateInput = {};
    const bodyRecord = body as Record<string, unknown>;

    if (bodyRecord.paymentNote !== undefined) {
      data.paymentNote = bodyRecord.paymentNote === null ? null : String(bodyRecord.paymentNote).trim();
    }
    if (bodyRecord.dueDate !== undefined) {
      if (bodyRecord.dueDate === null || bodyRecord.dueDate === '') {
        data.dueDate = null;
      } else if (typeof bodyRecord.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(bodyRecord.dueDate)) {
        const date = new Date(`${bodyRecord.dueDate}T00:00:00.000Z`);
        if (Number.isNaN(date.getTime())) return jsonError('Invalid dueDate', 400);
        data.dueDate = date;
      } else {
        return jsonError('dueDate must use YYYY-MM-DD format', 400);
      }
    }

    if (Object.keys(data).length === 0) return jsonError('No editable fields supplied', 400);

    const updated = await prisma.invoice.update({ where: { id }, data });
    return jsonSuccess(updated, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to update invoice');
  }
}
