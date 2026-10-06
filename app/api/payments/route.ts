import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { PaymentStatus } from '@prisma/client';
import { errorResponse, isUuid } from '@/lib/outsourcingApi';
import { uploadFileToDrive } from '@/lib/googleDrive';

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: List payments
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: invoiceId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Payments retrieved successfully }
 *       400: { description: Invalid filter }
 *       500: { description: Internal server error }
 *   post:
 *     summary: Log a payment and upload proof
 *     description: Creates a payment record and uploads the attached bank slip to Google Drive.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [invoiceId, amount, paymentDate, method]
 *             properties:
 *               invoiceId: { type: string, format: uuid }
 *               amount: { type: number }
 *               paymentDate: { type: string, format: date }
 *               method: { type: string }
 *               referenceNo: { type: string }
 *               notes: { type: string }
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: Payment logged successfully }
 *       400: { description: Validation error }
 *       404: { description: Invoice not found }
 *       500: { description: Internal server error }
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const invoiceId = searchParams.get('invoiceId');

    if (projectId && !isUuid(projectId)) return jsonError('projectId must be a valid UUID', 400);
    if (invoiceId && !isUuid(invoiceId)) return jsonError('invoiceId must be a valid UUID', 400);

    const payments = await prisma.payment.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(invoiceId ? { invoiceId } : {}),
      },
      include: {
        invoice: true,
        proof: true,
        receipt: true
      },
      orderBy: { createdAt: 'desc' },
    });

    return jsonSuccess(payments, 200, { total: payments.length });
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch payments');
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData().catch(() => null);
    if (!formData) return jsonError('Invalid FormData request', 400);

    const invoiceId = formData.get('invoiceId') as string;
    const amountStr = formData.get('amount') as string;
    const paymentDateStr = formData.get('paymentDate') as string;
    const method = formData.get('method') as string;
    const referenceNo = formData.get('referenceNo') as string | null;
    const notes = formData.get('notes') as string | null;
    const file = formData.get('file') as File | null;

    if (!invoiceId || !isUuid(invoiceId)) return jsonError('Valid invoiceId is required', 400);
    if (!amountStr || isNaN(parseFloat(amountStr))) return jsonError('Valid amount is required', 400);
    if (!paymentDateStr) return jsonError('paymentDate is required', 400);
    if (!method) return jsonError('Payment method is required', 400);

    // 1. Fetch Invoice Details (Outside Transaction)
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { project: true }
    });

    if (!invoice) return jsonError('Target invoice not found', 404);

    // 2. Create the Database Record Safely
    const newPayment = await prisma.payment.create({
      data: {
        projectId: invoice.projectId,
        invoiceId: invoice.id,
        amount: parseFloat(amountStr),
        paymentDate: new Date(paymentDateStr),
        method: method.trim(),
        referenceNo: referenceNo?.trim() || null,
        notes: notes?.trim() || null,
        status: PaymentStatus.PENDING,
      }
    });

    let driveWarning: string | undefined = undefined;

    // 3. Handle Drive Upload AFTER Database Save to prevent timeouts
    if (file && invoice.project.driveFolderId) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        const driveData = await uploadFileToDrive(
          buffer, 
          file.name, 
          file.type, 
          invoice.project.driveFolderId
        );

        await prisma.paymentProof.create({
          data: {
            paymentId: newPayment.id,
            driveFileId: driveData.fileId,
            fileName: file.name,
            mimeType: file.type,
            url: driveData.fileUrl,
          }
        });

      } catch (uploadError: any) {
        console.error('\n⚠️ [DRIVE UPLOAD FAILED]:', uploadError.message);
        driveWarning = 'Payment logged successfully, but the bank slip failed to upload due to Google Drive restrictions.';
      }
    }

    const finalPayment = await prisma.payment.findUnique({
      where: { id: newPayment.id },
      include: { proof: true }
    });

    return jsonSuccess(finalPayment, 201, driveWarning ? { warning: driveWarning } : undefined);

  } catch (error: any) {
    console.error('\n🔴 [PAYMENT LOGGING FAILED]:', error);
    return errorResponse(jsonError, error, 'Failed to record payment');
  }
}

export const runtime = 'nodejs';