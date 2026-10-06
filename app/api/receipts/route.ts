import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { Prisma, DocumentType, PaymentStatus } from '@prisma/client';
import { errorResponse, isUuid } from '@/lib/outsourcingApi';

/**
 * @swagger
 * /api/receipts:
 *   get:
 *     summary: List receipts
 *     tags: [Receipts]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Receipts retrieved successfully }
 *       400: { description: Invalid filter }
 *       500: { description: Internal server error }
 *   post:
 *     summary: Generate a payment receipt
 *     description: Creates an immutable receipt for a verified payment using the global document numbering engine. Appends WYSIWYG additional costs as receipt line items and saves them to the project database.
 *     tags: [Receipts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentId]
 *             properties:
 *               paymentId: { type: string, format: uuid }
 *               description: { type: string, nullable: true }
 *               newAdditionalCosts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description: { type: string }
 *                     amount: { type: number }
 *     responses:
 *       201: { description: Receipt generated successfully }
 *       400: { description: Validation error }
 *       404: { description: Payment not found }
 *       409: { description: Receipt already exists }
 *       500: { description: Internal server error }
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (projectId && !isUuid(projectId)) return jsonError('projectId must be a valid UUID', 400);

    const receipts = await prisma.receipt.findMany({
      where: projectId ? { projectId } : {},
      include: {
        project: true,
        payment: { include: { invoice: true } },
        items: true,
      },
      orderBy: { generatedAt: 'desc' },
    });

    return jsonSuccess(receipts, 200, { total: receipts.length });
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch receipts');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return jsonError('Invalid or missing JSON request body', 400);

    const { paymentId, description, newAdditionalCosts } = body;

    if (!paymentId || !isUuid(String(paymentId))) {
      return jsonError('paymentId is required and must be a valid UUID', 400);
    }

    // =========================================================================
    // STEP 1: CONCURRENT PRE-FETCHING (OUTSIDE THE TRANSACTION)
    // =========================================================================
    const payment = await prisma.payment.findUnique({
      where: { id: String(paymentId) },
      // Include outsourcingProject to link new additional costs to the correct project
      include: { 
        project: { include: { outsourcingProject: true } }, 
        invoice: true 
      }
    });

    if (!payment) return jsonError('Payment not found', 404);
    
    if (payment.status !== PaymentStatus.VERIFIED) {
      return jsonError('Cannot generate a receipt for an unverified payment.', 400);
    }

    const existingReceipt = await prisma.receipt.findUnique({ where: { paymentId: payment.id } });
    if (existingReceipt) return jsonError('A receipt has already been generated for this payment.', 409);

    const validNewCosts = Array.isArray(newAdditionalCosts) ? newAdditionalCosts : [];

    // =========================================================================
    // STEP 2: THE OPTIMIZED TRANSACTION (Strictly for Numbering and Writing)
    // =========================================================================
    const newReceipt = await prisma.$transaction(async (tx) => {
      
      const conflictCheck = await tx.receipt.findUnique({ where: { paymentId: payment.id } });
      if (conflictCheck) throw new Error('RECEIPT_ALREADY_EXISTS');

      // A. Independent Receipt Numbering Engine
      let series = await tx.projectDocumentSeries.findUnique({
        where: {
          projectId_documentType: {
            projectId: payment.projectId,
            documentType: DocumentType.RECEIPT,
          },
        },
      });

      if (!series) {
        const globalSeq = await tx.globalDocumentSequence.findUnique({ where: { type: DocumentType.RECEIPT } });
        if (!globalSeq) throw new Error('Global receipt sequence not found. Please run the seed script.');

        await tx.globalDocumentSequence.update({
          where: { type: DocumentType.RECEIPT },
          data: { nextValue: { increment: 1 } },
        });

        const rootNumberStr = `${globalSeq.prefix}${String(globalSeq.nextValue).padStart(3, '0')}`;

        series = await tx.projectDocumentSeries.create({
          data: {
            projectId: payment.projectId,
            documentType: DocumentType.RECEIPT,
            rootNumber: rootNumberStr,
          },
        });
      }

      // B. Guaranteed Receipt Uniqueness Loop (Checks the RECEIPT table, not Invoice)
      let finalReceiptNo = series.rootNumber;
      let attempt = 1;
      while (await tx.receipt.findUnique({ where: { receiptNo: finalReceiptNo } })) {
        attempt++;
        finalReceiptNo = `${series.rootNumber}-${attempt}`; // e.g., RE074-2
      }

      // C. Create immutable receipt snapshot base
      const receipt = await tx.receipt.create({
        data: {
          projectId: payment.projectId,
          paymentId: payment.id,
          receiptNo: finalReceiptNo,
        }
      });

      // 1. Create Base Payment Item
      await tx.receiptItem.create({
        data: { 
          receiptId: receipt.id, 
          description: description ? String(description).trim() : `Payment for Invoice ${payment.invoice.invoiceNo}`, 
          quantity: 1, 
          amount: payment.amount 
        }
      });

      // 2. Process WYSIWYG Additional Costs
      for (const cost of validNewCosts) {
        if (cost && typeof cost === 'object' && cost.description && cost.amount > 0) {
          const desc = String(cost.description).trim();
          
          // Add to physical receipt items
          await tx.receiptItem.create({
            data: { 
              receiptId: receipt.id, 
              description: desc, 
              quantity: 1, 
              amount: cost.amount 
            }
          });

          // Sync to OutsourcingAdditionalCost Database table
          if (payment.project.outsourcingProject) {
            await tx.outsourcingAdditionalCost.create({
              data: {
                outsourcingProjectId: payment.project.outsourcingProject.id,
                participantId: payment.invoice.participantId || null,
                description: desc,
                amount: cost.amount
              }
            });
          }
        }
      }

      // Return fully assembled object to match the original structure
      return await tx.receipt.findUnique({ 
        where: { id: receipt.id }, 
        include: { project: true, payment: true, items: true } 
      });

    }, { 
      // Removed Serializable lock to stop the 6-second hanging issue
      maxWait: 5000, 
      timeout: 15000 
    });

    return jsonSuccess(newReceipt, 201);
  } catch (error: any) {
    if (error.message === 'RECEIPT_ALREADY_EXISTS') {
      return jsonError('A receipt has already been generated for this payment.', 409);
    }
    console.error('\n🔴 [RECEIPT GENERATION FAILED]:', error);
    return errorResponse(jsonError, error, 'Failed to generate receipt');
  }
}

export const runtime = 'nodejs';