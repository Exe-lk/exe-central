import { NextRequest } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { uploadFileToDrive } from '@/lib/googleDrive';
import { assertAllowedDocumentFile, errorResponse, isUuid } from '@/lib/outsourcingApi';
import InvoiceTemplate from '@/components/pdf/InvoiceTemplate';

/**
 * @swagger
 * /api/invoices/{id}/document:
 *   get:
 *     summary: Render and view an invoice PDF document
 *     description: Renders the invoice PDF document dynamically, including all related base milestones and dynamic additional cost line items.
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: PDF binary document stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404: { description: Invoice not found }
 *   post:
 *     summary: Upload an invoice PDF to the project Google Drive folder
 *     description: The endpoint stores the uploaded invoice document in the project's Drive folder and saves its Drive reference on the invoice. An invoice document cannot be overwritten through this endpoint.
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200: { description: Invoice document uploaded successfully }
 *       400: { description: Invalid file }
 *       404: { description: Invoice not found }
 *       409: { description: Invoice already has a document or Drive folder is missing }
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid invoice UUID is required', 400);

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    const logoUrl = `${baseUrl}/Logo.png`;

    // 1. Fetch the Base Invoice with Outsourcing Project details
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        project: {
          include: { outsourcingProject: true } // Required to securely link the costs
        },
        participant: true,
        milestone: true,
      },
    });

    if (!invoice) return jsonError('Invoice not found', 404);

    // 2. Dynamically Fetch the Additional Costs for this specific participant
    let additionalCosts: any[] = [];
    
    if (invoice.project.type === 'OUTSOURCING' && invoice.project.outsourcingProject) {
      additionalCosts = await prisma.outsourcingAdditionalCost.findMany({
        where: {
          outsourcingProjectId: invoice.project.outsourcingProject.id,
          participantId: invoice.participantId,
        },
        orderBy: {
          description: 'asc' // Keeps line items organized alphabetically
        }
      });
    }

    // 3. Hydrate Smart Ledger (billingHistory) for Industrial projects
    let billingHistory: any[] = [];
    if (invoice.project.type === 'INDUSTRIAL') {
      const pastInvoices = await prisma.invoice.findMany({
        where: {
          projectId: invoice.projectId,
          status: { not: 'CANCELLED' },
        },
        orderBy: { createdAt: 'asc' },
      });

      billingHistory = pastInvoices.map((inv) => ({
        description: inv.paymentNote || 'Invoice',
        status: inv.status,
        date: inv.issuedDate || inv.createdAt,
        amount: Number(inv.subtotal),
      }));
    }

    // 4. Attach costs, billingHistory, and logoUrl to the payload expected by the InvoiceTemplate
    const invoiceDataForPdf = {
      ...invoice,
      additionalCosts,
      billingHistory,
      logoUrl,
    };

    // 5. Render the PDF buffer in-memory
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoiceTemplate, { invoice: invoiceDataForPdf as any }) as any
    );

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Invoice-${invoice.invoiceNo}.pdf"`,
      },
    });
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to generate invoice document');
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid invoice UUID is required', 400);

    const invoice = await prisma.invoice.findUnique({ where: { id }, include: { project: true } });
    if (!invoice) return jsonError('Invoice not found', 404);
    if (invoice.driveFileId) return jsonError('Invoice document has already been uploaded', 409);
    if (!invoice.project.driveFolderId) throw new Error('NO_DRIVE_FOLDER');

    const formData = await request.formData();
    const entry = formData.get('file');
    if (!entry || typeof entry !== 'object' || !('arrayBuffer' in entry)) throw new Error('FILE_REQUIRED');
    const file = entry as File;
    assertAllowedDocumentFile(file);
    if (file.type !== 'application/pdf') return jsonError('Invoice document must be a PDF file', 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${invoice.invoiceNo}.pdf`;
    const driveResult = await uploadFileToDrive(buffer, fileName, file.type, invoice.project.driveFolderId);

    const updated = await prisma.invoice.update({
      where: { id },
      data: { driveFileId: driveResult.fileId, driveFileUrl: driveResult.fileUrl },
    });

    return jsonSuccess(updated, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to upload invoice document');
  }
}

export const runtime = 'nodejs';