import { NextRequest } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { uploadFileToDrive } from '@/lib/googleDrive';
import { assertAllowedDocumentFile, errorResponse, isUuid } from '@/lib/outsourcingApi';
import ReceiptTemplate from '@/components/pdf/ReceiptTemplate';

/**
 * @swagger
 * /api/receipts/{id}/document:
 *   get:
 *     summary: Render and view a receipt PDF document
 *     tags: [Receipts]
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
 *       404: { description: Receipt not found }
 *   post:
 *     summary: Upload a receipt PDF to the project Google Drive folder
 *     description: Uploads the generated/approved receipt PDF and stores its Google Drive reference. The receipt document is not overwritten.
 *     tags: [Receipts]
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
 *       200: { description: Receipt document uploaded successfully }
 *       400: { description: Invalid file }
 *       404: { description: Receipt not found }
 *       409: { description: Receipt already has a document or Drive folder is missing }
 */

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid receipt UUID is required', 400);

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        project: true,
        items: true,
        payment: {
          include: {
            invoice: {
              include: {
                participant: true,
              },
            },
          },
        },
      },
    });

    if (!receipt) return jsonError('Receipt not found', 404);

    const protocol = _request.headers.get('x-forwarded-proto') || 'http';
    const host = _request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    const logoUrl = `${baseUrl}/Logo.png`;
    const stampUrl = `${baseUrl}/Stamp.png`;

    const receiptDataForPdf = {
      ...receipt,
      logoUrl,
      stampUrl,
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(ReceiptTemplate, { receipt: receiptDataForPdf as any }) as any
    );

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Receipt-${receipt.receiptNo}.pdf"`,
      },
    });
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to generate receipt document');
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid receipt UUID is required', 400);

    const receipt = await prisma.receipt.findUnique({ where: { id }, include: { project: true } });
    if (!receipt) return jsonError('Receipt not found', 404);
    if (receipt.driveFileId) return jsonError('Receipt document has already been uploaded', 409);
    if (!receipt.project.driveFolderId) throw new Error('NO_DRIVE_FOLDER');

    const formData = await request.formData();
    const entry = formData.get('file');
    if (!entry || typeof entry !== 'object' || !('arrayBuffer' in entry)) throw new Error('FILE_REQUIRED');
    const file = entry as File;
    assertAllowedDocumentFile(file);
    if (file.type !== 'application/pdf') return jsonError('Receipt document must be a PDF file', 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const driveResult = await uploadFileToDrive(buffer, `${receipt.receiptNo}.pdf`, file.type, receipt.project.driveFolderId);
    const updated = await prisma.receipt.update({ where: { id }, data: { driveFileId: driveResult.fileId, driveFileUrl: driveResult.fileUrl } });
    return jsonSuccess(updated, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to upload receipt document');
  }
}

export const runtime = 'nodejs';
