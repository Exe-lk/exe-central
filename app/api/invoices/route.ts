
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { Prisma, DocumentType, ProjectType, InvoiceStatus } from '@prisma/client';
import { errorResponse, isUuid, parseDateOnly, parseNonNegativeDecimal } from '@/lib/outsourcingApi';
import { getNextUniqueInvoiceNumber, getOrCreateProjectDocumentSeries } from '@/lib/documentNumbering';

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: List invoices
 *     description: Returns invoices in chronological ascending order (oldest first) so the frontend can build a Smart Ledger of past payments.
 *     tags: [Invoices]
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, PENDING, PAID, CANCELLED] }
 *     responses:
 *       200: { description: Invoices retrieved successfully }
 *       400: { description: Invalid filter }
 *       500: { description: Internal server error }
 *   post:
 *     summary: Create an outsourcing or industrial invoice
 *     description: |
 *       Creates an invoice for OUTSOURCING or INDUSTRIAL projects.
 *       - Outsourcing (milestone-based): Requires milestoneId. Calculates totals from the milestone amount plus participant-specific additional costs (including dynamic WYSIWYG costs).
 *       - Industrial (manual entry): Requires subtotal. Uses paymentNote as the manual description (e.g. "Advance Payment"). Optional proposalNo and quotationId. No milestones or participants.
 *       Invoice status is controlled by the server and starts as PENDING; clients cannot mark an invoice PAID.
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId]
 *             properties:
 *               projectId: { type: string, format: uuid }
 *               milestoneId: { type: string, format: uuid, nullable: true, description: Required for OUTSOURCING projects }
 *               participantId: { type: string, format: uuid, nullable: true, description: Required for GROUP outsourcing projects }
 *               subtotal: { type: number, description: Required for INDUSTRIAL projects; manual amount before discount/tax }
 *               paymentNote: { type: string, nullable: true, description: For INDUSTRIAL, the manual description (e.g. Advance Payment) }
 *               proposalNo: { type: string, nullable: true, description: Optional for INDUSTRIAL invoices }
 *               quotationId: { type: string, format: uuid, nullable: true, description: Optional for INDUSTRIAL invoices }
 *               discountAmount: { type: number, default: 0 }
 *               taxAmount: { type: number, default: 0 }
 *               costEstimationNo: { type: string, nullable: true }
 *               issuedDate: { type: string, format: date }
 *               dueDate: { type: string, format: date }
 *               currency: { type: string, default: LKR }
 *               newAdditionalCosts:
 *                 type: array
 *                 description: Outsourcing only — new WYSIWYG additional costs
 *                 items:
 *                   type: object
 *                   properties:
 *                     description: { type: string }
 *                     amount: { type: number }
 *     responses:
 *       201: { description: Invoice created successfully }
 *       400: { description: Validation error }
 *       404: { description: Project, milestone, or participant not found }
 *       409: { description: Invoice cannot be created for the requested state }
 *       500: { description: Internal server error }
 */

const VALID_STATUSES = Object.values(InvoiceStatus);

const TRANSACTION_OPTIONS = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  maxWait: 5000,
  timeout: 15000,
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    if (projectId && !isUuid(projectId)) return jsonError('projectId must be a valid UUID', 400);
    if (status && !VALID_STATUSES.includes(status as InvoiceStatus)) {
      return jsonError(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(status ? { status: status as InvoiceStatus } : {}),
      },
      include: {
        project: true,
        participant: true,
        milestone: true,
        payments: { orderBy: { createdAt: 'desc' }, include: { proof: true, receipt: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return jsonSuccess(invoices, 200, { total: invoices.length });
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch invoices');
  }
}

async function createInvoice(requestBody: Record<string, unknown>) {
  const projectId = requestBody.projectId;
  const milestoneId = requestBody.milestoneId;
  const participantId = requestBody.participantId;

  if (!isUuid(projectId)) throw new Error('PROJECT_ID_REQUIRED');
  if (participantId !== undefined && participantId !== null && !isUuid(participantId)) throw new Error('PARTICIPANT_NOT_FOUND');

  const discount = parseNonNegativeDecimal(requestBody.discountAmount ?? 0, 'discountAmount');
  const tax = parseNonNegativeDecimal(requestBody.taxAmount ?? 0, 'taxAmount');
  const issuedDate = parseDateOnly(requestBody.issuedDate, 'issuedDate') ?? new Date();

  // Default due date to 14 days from now if not explicitly provided
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14);
  const dueDate = parseDateOnly(requestBody.dueDate, 'dueDate') ?? defaultDueDate;

  const currency = requestBody.currency === undefined ? 'LKR' : String(requestBody.currency).trim().toUpperCase();
  if (!currency) throw new Error('CURRENCY_REQUIRED');

  // =========================================================================
  // STEP 1: PRE-FETCH PROJECT (OUTSIDE THE TRANSACTION)
  // Branch on project.type before milestone/participant logic.
  // =========================================================================
  const project = await prisma.project.findUnique({
    where: { id: String(projectId) },
    include: { outsourcingProject: { include: { participants: true } } },
  });

  if (!project) throw new Error('PROJECT_NOT_FOUND');

  // -------------------------------------------------------------------------
  // INDUSTRIAL: manual subtotal / paymentNote (Smart Ledger)
  // -------------------------------------------------------------------------
  if (project.type === ProjectType.INDUSTRIAL) {
    const rawSubtotal = requestBody.subtotal;
    if (rawSubtotal === undefined || rawSubtotal === null || rawSubtotal === '') {
      throw new Error('INDUSTRIAL_SUBTOTAL_REQUIRED');
    }
    const subtotal = parseNonNegativeDecimal(rawSubtotal, 'subtotal');
    if (subtotal.lte(0)) throw new Error('INDUSTRIAL_SUBTOTAL_REQUIRED');

    const total = subtotal.minus(discount).add(tax);
    if (total.lte(0)) throw new Error('INVOICE_TOTAL_NOT_POSITIVE');

    const quotationId = requestBody.quotationId;
    if (quotationId !== undefined && quotationId !== null && quotationId !== '') {
      if (!isUuid(quotationId)) throw new Error('QUOTATION_NOT_FOUND');
    }

    const defaultBank = await prisma.companyBankDetail.findFirst({
      where: { isDefault: true },
      orderBy: { id: 'asc' },
    });

    const invoice = await prisma.$transaction(async (tx) => {
      const series = await getOrCreateProjectDocumentSeries(tx, project.id, DocumentType.INVOICE);
      const invoiceNo = await getNextUniqueInvoiceNumber(tx, series.rootNumber);

      return await tx.invoice.create({
        data: {
          projectId: project.id,
          participantId: null,
          milestoneId: null,
          quotationId:
            quotationId !== undefined && quotationId !== null && quotationId !== ''
              ? String(quotationId)
              : null,
          proposalNo: requestBody.proposalNo ? String(requestBody.proposalNo).trim() : null,
          invoiceNo,
          costEstimationNo: requestBody.costEstimationNo ? String(requestBody.costEstimationNo).trim() : null,
          clientName: project.clientName,
          clientCompany: project.clientCompany ?? null,
          country: project.country ?? null,
          currency,
          subtotal,
          discountAmount: discount,
          taxAmount: tax,
          totalAmount: total,
          paymentNote: requestBody.paymentNote ? String(requestBody.paymentNote).trim() : null,
          bankAccountNo: defaultBank?.accountNo ?? null,
          bankAccountName: defaultBank?.accountName ?? null,
          bankSwiftCode: defaultBank?.swiftCode ?? null,
          bankName: defaultBank?.bankName ?? null,
          bankBranch: defaultBank?.branchName ?? null,
          bankAddress: defaultBank?.address ?? null,
          bankCountry: defaultBank?.country ?? null,
          status: InvoiceStatus.PENDING,
          issuedDate,
          dueDate,
        },
        include: { project: true, participant: true, milestone: true, payments: true },
      });
    }, TRANSACTION_OPTIONS);

    return invoice;
  }

  // -------------------------------------------------------------------------
  // OUTSOURCING: milestone + participant + additional costs (unchanged logic)
  // -------------------------------------------------------------------------
  if (project.type !== ProjectType.OUTSOURCING || !project.outsourcingProject) {
    throw new Error('OUTSOURCING_ONLY');
  }

  if (!isUuid(milestoneId)) throw new Error('MILESTONE_ID_REQUIRED');

  // Parse new additional costs sent from the WYSIWYG Builder
  const newAdditionalCosts = Array.isArray(requestBody.newAdditionalCosts) ? requestBody.newAdditionalCosts : [];

  const [milestone, defaultBank] = await Promise.all([
    prisma.outsourcingMilestone.findUnique({
      where: { id: String(milestoneId) },
      include: { package: true },
    }),
    prisma.companyBankDetail.findFirst({ where: { isDefault: true }, orderBy: { id: 'asc' } }),
  ]);

  if (!milestone) throw new Error('MILESTONE_NOT_FOUND');
  if (milestone.package.outsourcingProjectId !== project.outsourcingProject.id) throw new Error('MILESTONE_MISMATCH');

  // Pre-fetch Participant if GROUP mode
  let participant = null;
  if (project.outsourcingProject.mode === 'GROUP') {
    if (!participantId) throw new Error('PARTICIPANT_REQUIRED');
    participant = await prisma.outsourcingParticipant.findUnique({ where: { id: String(participantId) } });
    if (!participant) throw new Error('PARTICIPANT_NOT_FOUND');
    if (participant.outsourcingProjectId !== project.outsourcingProject.id) throw new Error('PARTICIPANT_MISMATCH');
  } else if (participantId) {
    throw new Error('PARTICIPANT_NOT_ALLOWED');
  }

  // Pre-fetch Existing Additional Costs
  const additionalCosts = await prisma.outsourcingAdditionalCost.findMany({
    where: {
      outsourcingProjectId: project.outsourcingProject.id,
      participantId: participant ? participant.id : null,
    },
  });

  // Calculate strict financials (combining existing costs in DB)
  let additionalTotal = additionalCosts.reduce(
    (sum, cost) => sum.add(new Prisma.Decimal(cost.amount)),
    new Prisma.Decimal(0),
  );

  // Parse and add the NEW WYSIWYG costs to the total outside the transaction
  const validNewCosts: { description: string; amount: Prisma.Decimal }[] = [];
  for (const cost of newAdditionalCosts) {
    if (cost && typeof cost === 'object' && 'description' in cost && 'amount' in cost) {
      const desc = String(cost.description).trim();
      const amt = parseNonNegativeDecimal(cost.amount, 'newAdditionalCost amount');
      if (desc && amt.gt(0)) {
        validNewCosts.push({ description: desc, amount: amt });
        additionalTotal = additionalTotal.add(amt);
      }
    }
  }

  const subtotal = new Prisma.Decimal(milestone.amount).add(additionalTotal);
  const total = subtotal.minus(discount).add(tax);
  if (total.lte(0)) throw new Error('INVOICE_TOTAL_NOT_POSITIVE');

  // =========================================================================
  // STEP 2: THE OPTIMIZED TRANSACTION (Strictly for Numbering and Writing)
  // =========================================================================
  const invoice = await prisma.$transaction(async (tx) => {
    // 1. Process and save any New Additional Costs passed from the WYSIWYG Builder
    for (const cost of validNewCosts) {
      await tx.outsourcingAdditionalCost.create({
        data: {
          outsourcingProjectId: project.outsourcingProject!.id,
          participantId: participant?.id ?? null,
          description: cost.description,
          amount: cost.amount,
        },
      });
    }

    // Prevent duplicate active invoices for the same participant/milestone.
    const existing = await tx.invoice.findFirst({
      where: {
        projectId: project.id,
        milestoneId: milestone.id,
        participantId: participant?.id ?? null,
        status: { not: InvoiceStatus.CANCELLED },
      },
      select: { id: true, invoiceNo: true },
    });
    if (existing) throw new Error('MILESTONE_ALREADY_INVOICED');

    // Execute centralized numbering engine
    const series = await getOrCreateProjectDocumentSeries(tx, project.id, DocumentType.INVOICE);
    const baseInvoiceNo = participant ? `${series.rootNumber}${participant.code}` : series.rootNumber;
    const invoiceNo = await getNextUniqueInvoiceNumber(tx, baseInvoiceNo);

    // Create immutable financial snapshot
    return await tx.invoice.create({
      data: {
        projectId: project.id,
        participantId: participant?.id ?? null,
        milestoneId: milestone.id,
        invoiceNo,
        costEstimationNo: requestBody.costEstimationNo ? String(requestBody.costEstimationNo).trim() : null,
        clientName: participant?.name ?? project.clientName,
        clientCompany: project.clientCompany ?? null,
        country: project.country ?? null,
        currency,
        subtotal,
        discountAmount: discount,
        taxAmount: tax,
        totalAmount: total,
        paymentNote: requestBody.paymentNote ? String(requestBody.paymentNote).trim() : null,
        bankAccountNo: defaultBank?.accountNo ?? null,
        bankAccountName: defaultBank?.accountName ?? null,
        bankSwiftCode: defaultBank?.swiftCode ?? null,
        bankName: defaultBank?.bankName ?? null,
        bankBranch: defaultBank?.branchName ?? null,
        bankAddress: defaultBank?.address ?? null,
        bankCountry: defaultBank?.country ?? null,
        status: InvoiceStatus.PENDING,
        issuedDate,
        dueDate,
      },
      include: { project: true, participant: true, milestone: true, payments: true },
    });
  }, TRANSACTION_OPTIONS);

  return invoice;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return jsonError('Invalid or missing JSON request body', 400);

    const invoice = await createInvoice(body as Record<string, unknown>);
    return jsonSuccess(invoice, 201);
  } catch (error) {
    if (error instanceof Error) {
      const direct: Record<string, [string, number]> = {
        PROJECT_ID_REQUIRED: ['projectId is required and must be a valid UUID', 400],
        MILESTONE_ID_REQUIRED: ['milestoneId is required and must be a valid UUID', 400],
        PARTICIPANT_REQUIRED: ['participantId is required for GROUP outsourcing projects', 400],
        PARTICIPANT_NOT_ALLOWED: ['participantId is not allowed for INDIVIDUAL outsourcing projects', 400],
        CURRENCY_REQUIRED: ['currency cannot be empty', 400],
        INVOICE_TOTAL_NOT_POSITIVE: ['Invoice total must be greater than zero', 400],
        INDUSTRIAL_SUBTOTAL_REQUIRED: ['Subtotal is required and must be greater than zero for industrial invoices', 400],
        MILESTONE_ALREADY_INVOICED: ['This milestone has already been invoiced for the selected participant', 409],
        DOCUMENT_SEQUENCE_NOT_CONFIGURED: ['Invoice document sequence is not configured', 500],
        PROJECT_NOT_FOUND: ['Project not found', 404],
        OUTSOURCING_ONLY: ['Invoices can only be generated for outsourcing projects through this endpoint', 400],
        MILESTONE_NOT_FOUND: ['Target milestone not found', 404],
        MILESTONE_MISMATCH: ['Milestone does not belong to this project', 400],
        PARTICIPANT_NOT_FOUND: ['Participant not found', 404],
        PARTICIPANT_MISMATCH: ['Participant does not belong to this project', 400],
        QUOTATION_NOT_FOUND: ['quotationId must be a valid UUID', 400],
      };
      const mapped = direct[error.message];
      if (mapped) return jsonError(mapped[0], mapped[1]);
    }
    console.error('\n🔴 [INVOICE GENERATION FAILED]:', error);
    return errorResponse(jsonError, error, 'Failed to create invoice');
  }
}

export const runtime = 'nodejs';
