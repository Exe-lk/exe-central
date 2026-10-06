import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { errorResponse, isUuid } from '@/lib/outsourcingApi';
import { PaymentStatus, InvoiceStatus, MilestoneStatus } from '@prisma/client';

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get a recorded payment
 *     description: Returns the already-verified payment, its proof, linked invoice, and receipt. Payment verification is performed outside the system and there is intentionally no PATCH verification endpoint.
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Payment retrieved successfully }
 *       404: { description: Payment not found }
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid payment UUID is required', 400);

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        project: true,
        invoice: { include: { participant: true, milestone: true } },
        proof: true,
        receipt: { include: { items: true } },
      },
    });
    
    if (!payment) return jsonError('Payment not found', 404);
    return jsonSuccess(payment, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch payment');
  }
}

/**
 * @swagger
 * /api/payments/{id}:
 *   patch:
 *     summary: Update payment status
 *     description: Updates a payment (e.g., to VERIFIED) and dynamically recalculates the parent Invoice and Milestone statuses.
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Invalid payment ID', 400);

    const body = await request.json().catch(() => null);
    if (!body) return jsonError('Invalid request body', 400);

    const { status } = body;
    if (!status || !Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      return jsonError('Invalid or missing payment status', 400);
    }

    // 1. Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: { invoice: true },
    });
    if (!existingPayment) return jsonError('Payment not found', 404);

    // =========================================================================
    // SMART CASCADING FINANCIAL ENGINE
    // =========================================================================
    const updatedPayment = await prisma.$transaction(async (tx) => {
      
      // 1. Update the Target Payment
      const payment = await tx.payment.update({
        where: { id },
        data: { status: status as PaymentStatus },
        include: { invoice: true }
      });

      const invoice = payment.invoice;

      // 2. Fetch all currently VERIFIED payments for this invoice
      const verifiedPayments = await tx.payment.findMany({
        where: { 
          invoiceId: invoice.id, 
          status: PaymentStatus.VERIFIED 
        }
      });

      // 3. Sum total verified cash
      const totalPaid = verifiedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const isFullyPaid = totalPaid >= Number(invoice.totalAmount);

      // 4. Determine target statuses based strictly on the schema
      const targetInvoiceStatus = isFullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PENDING;
      const targetMilestoneStatus = isFullyPaid ? MilestoneStatus.PAID : MilestoneStatus.PENDING;

      // 5. Sync the Invoice
      if (invoice.status !== targetInvoiceStatus) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: targetInvoiceStatus }
        });
      }

      // 6. Sync the Milestone (if it exists)
      if (invoice.milestoneId) {
        await tx.outsourcingMilestone.update({
          where: { id: invoice.milestoneId },
          data: { status: targetMilestoneStatus }
        });
      }

      return payment;
    }, {
      maxWait: 5000,
      timeout: 15000 // Extended timeout to prevent 500 transaction drops
    });

    return jsonSuccess(updatedPayment, 200, { message: 'Payment status and financial cascade updated securely.' });
  } catch (error) {
    console.error('\n🔴 [PAYMENT STATUS UPDATE FAILED]:', error);
    return errorResponse(jsonError, error, 'Failed to update payment status');
  }
}

/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     summary: Delete a payment
 *     description: Deletes an un-receipted payment and automatically recalculates parent financial statuses.
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Invalid payment ID', 400);

    // 1. Pre-fetch to validate business rules
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { receipt: true, invoice: true }
    });

    if (!payment) return jsonError('Payment not found', 404);
    
    // Safety Rule: Cannot delete a payment that already has a receipt
    if (payment.receipt) {
      return jsonError('Cannot delete a payment that has a generated receipt. Delete the receipt first.', 400);
    }

    // =========================================================================
    // SAFE DELETION WITH RECALCULATION
    // =========================================================================
    await prisma.$transaction(async (tx) => {
      
      // 1. Remove the payment
      await tx.payment.delete({ where: { id } });

      const invoice = payment.invoice;

      // 2. Recalculate remaining verified payments
      const remainingVerifiedPayments = await tx.payment.findMany({
        where: { 
          invoiceId: invoice.id, 
          status: PaymentStatus.VERIFIED 
        }
      });

      const totalPaid = remainingVerifiedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const isFullyPaid = totalPaid >= Number(invoice.totalAmount);

      const targetInvoiceStatus = isFullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PENDING;
      const targetMilestoneStatus = isFullyPaid ? MilestoneStatus.PAID : MilestoneStatus.PENDING;

      // 3. Sync statuses backward
      if (invoice.status !== targetInvoiceStatus) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: targetInvoiceStatus }
        });
      }
      
      if (invoice.milestoneId) {
        await tx.outsourcingMilestone.update({
          where: { id: invoice.milestoneId },
          data: { status: targetMilestoneStatus }
        });
      }

    }, {
      maxWait: 5000,
      timeout: 15000
    });

    return jsonSuccess(null, 200, { message: 'Payment deleted and finances recalibrated.' });
  } catch (error) {
    console.error('\n🔴 [PAYMENT DELETION FAILED]:', error);
    return errorResponse(jsonError, error, 'Failed to delete payment');
  }
}

export const runtime = 'nodejs';