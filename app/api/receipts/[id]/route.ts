import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { errorResponse, isUuid } from '@/lib/outsourcingApi';

/**
 * @swagger
 * /api/receipts/{id}:
 *   get:
 *     summary: Get a receipt
 *     tags: [Receipts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Receipt retrieved successfully }
 *       404: { description: Receipt not found }
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid receipt UUID is required', 400);
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { project: true, payment: { include: { invoice: true, proof: true } }, items: true },
    });
    if (!receipt) return jsonError('Receipt not found', 404);
    return jsonSuccess(receipt, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch receipt');
  }
}
