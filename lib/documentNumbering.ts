import { DocumentType, Prisma } from '@prisma/client';

export async function getOrCreateProjectDocumentSeries(
  tx: Prisma.TransactionClient,
  projectId: string,
  documentType: DocumentType,
) {
  const existing = await tx.projectDocumentSeries.findUnique({
    where: { projectId_documentType: { projectId, documentType } },
  });
  if (existing) return existing;

  const sequence = await tx.globalDocumentSequence.findUnique({ where: { type: documentType } });
  if (!sequence) throw new Error(`${documentType}_SEQUENCE_NOT_CONFIGURED`);

  const rootNumber = `${sequence.prefix}${String(sequence.nextValue).padStart(2, '0')}`;
  await tx.globalDocumentSequence.update({
    where: { type: documentType },
    data: { nextValue: { increment: 1 } },
  });

  return tx.projectDocumentSeries.create({
    data: { projectId, documentType, rootNumber },
  });
}

export async function getNextUniqueInvoiceNumber(tx: Prisma.TransactionClient, baseNumber: string) {
  let candidate = baseNumber;
  let counter = 1;
  while (await tx.invoice.findUnique({ where: { invoiceNo: candidate }, select: { id: true } })) {
    counter += 1;
    candidate = `${baseNumber}-${counter}`;
  }
  return candidate;
}

export function buildReceiptNumber(
  rootNumber: string,
  milestoneOrder: number | null,
  participantCode: string | null,
  paymentSequence: number,
) {
  const milestonePart = milestoneOrder ? `-M${milestoneOrder}` : '';
  const participantPart = participantCode ? `-${participantCode}` : '';
  return `${rootNumber}${milestonePart}${participantPart}-P${paymentSequence}`;
}
