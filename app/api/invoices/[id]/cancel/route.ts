import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { InvoiceStatus } from '@prisma/client';
import { errorResponse, isUuid } from '@/lib/outsourcingApi';

/**
 * @swagger
 * /api/invoices/{id}/cancel:
 *   post:
 *     summary: Cancel an invoice
 *     description: Cancels an invoice only when no verified payment has been recorded against it. Cancellation is explicit and cannot be reversed through this API.
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Invoice cancelled successfully }
 *       404: { description: Invoice not found }
 *       409: { description: Invoice cannot be cancelled }
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid invoice UUID is required', 400);

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return jsonError('Invoice not found', 404);
    if (invoice.status === InvoiceStatus.PAID) return jsonError('Paid invoices cannot be cancelled', 409);
    if (invoice.status === InvoiceStatus.CANCELLED) return jsonError('Invoice is already cancelled', 409);

    const verifiedPaymentCount = await prisma.payment.count({ where: { invoiceId: id, status: 'VERIFIED' } });
    if (verifiedPaymentCount > 0) return jsonError('Invoice with recorded payments cannot be cancelled', 409);

    const updated = await prisma.invoice.update({ where: { id }, data: { status: InvoiceStatus.CANCELLED } });
    return jsonSuccess(updated, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to cancel invoice');
  }
}
