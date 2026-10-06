import { NextRequest } from 'next/server';
import { ProjectType, ProposalStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { errorResponse, isUuid } from '@/lib/outsourcingApi';
import {
  parseDateOnly,
  parseSections,
  parsePricingItems,
  parseMaintenanceItems,
  parseHostingItems,
  parseThirdPartyItems,
  parseChangeRequestItems,
  parseTimelineItems,
  parsePaymentPlans,
  proposalInclude,
  parseProposalStatus,
} from '@/lib/proposalApi';

type Params = { params: Promise<{ id: string }> };

const STATUS_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  DRAFT: [ProposalStatus.DRAFT, ProposalStatus.FINAL],
  FINAL: [ProposalStatus.SENT, ProposalStatus.CANCELLED],
  SENT: [ProposalStatus.ACCEPTED, ProposalStatus.REJECTED, ProposalStatus.EXPIRED, ProposalStatus.CANCELLED],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
  CANCELLED: [],
};

/**
 * @swagger
 * /api/proposals/{id}:
 *   get:
 *     summary: Get one industrial proposal
 *     description: Returns the complete proposal document with all modular blocks. The linked project must be INDUSTRIAL.
 *     tags:
 *       - Proposals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Proposal retrieved successfully
 *       400:
 *         description: Invalid proposal UUID
 *       404:
 *         description: Proposal not found or not an industrial proposal
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update an industrial proposal
 *     description: Updates a draft proposal and atomically replaces any supplied modular collections. Omitting a collection leaves it unchanged; supplying an empty array clears that collection. Non-draft proposals can only move through the documented status lifecycle and cannot have their content edited.
 *     tags:
 *       - Proposals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IndustrialProposalUpdateRequest'
 *     responses:
 *       200:
 *         description: Proposal updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Proposal not found
 *       409:
 *         description: Proposal state does not allow the requested operation
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a draft industrial proposal
 *     description: Permanently deletes a proposal only while it is in DRAFT status. Child blocks are deleted by cascade.
 *     tags:
 *       - Proposals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Proposal deleted successfully
 *       400:
 *         description: Invalid proposal UUID
 *       404:
 *         description: Proposal not found
 *       409:
 *         description: Only draft proposals can be deleted
 *       500:
 *         description: Internal server error
 */

async function findIndustrialProposal(id: string) {
  return prisma.proposal.findFirst({
    where: {
      id,
      project: { type: ProjectType.INDUSTRIAL },
    },
    include: proposalInclude,
  });
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return jsonError('Valid proposal UUID is required', 400);
    }

    const proposal = await findIndustrialProposal(id);

    if (!proposal) {
      return jsonError('Industrial proposal not found', 404);
    }

    return jsonSuccess(proposal, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch proposal');
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return jsonError('Valid proposal UUID is required', 400);
    }

    const existing = await prisma.proposal.findFirst({
      where: {
        id,
        project: { type: ProjectType.INDUSTRIAL },
      },
      select: { id: true, status: true, validUntil: true },
    });

    if (!existing) {
      return jsonError('Industrial proposal not found', 404);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return jsonError('Invalid or missing JSON request body', 400);
    }

    const payload = body as Record<string, unknown>;
    const hasContentChanges =
      ['validUntil', 'sections', 'pricingItems', 'maintenanceItems', 'hostingItems',
        'thirdPartyItems', 'changeRequestItems', 'timelineItems', 'paymentPlans']
        .some((key) => Object.prototype.hasOwnProperty.call(payload, key));

    const requestedStatus = parseProposalStatus(payload.status, existing.status);

    // CHANGED: business-document lifecycle is enforced at API level.
    if (existing.status !== ProposalStatus.DRAFT && hasContentChanges) {
      return jsonError('Only DRAFT proposals can be edited', 409);
    }

    if (requestedStatus !== existing.status) {
      const allowed = STATUS_TRANSITIONS[existing.status] ?? [];
      if (!allowed.includes(requestedStatus)) {
        return jsonError(
          `Invalid proposal status transition: ${existing.status} -> ${requestedStatus}`,
          409
        );
      }
    }

    const validUntilDate =
      Object.prototype.hasOwnProperty.call(payload, 'validUntil')
        ? parseDateOnly(payload.validUntil, 'validUntil', true)
        : existing.validUntil;

    // CHANGED: arrays are full-state replacements only when the field is present.
    // This preserves predictable PUT semantics and avoids accidental deletion when
    // the frontend updates only one part of the document.
    const hasSections = Object.prototype.hasOwnProperty.call(payload, 'sections');
    const hasPricing = Object.prototype.hasOwnProperty.call(payload, 'pricingItems');
    const hasMaintenance = Object.prototype.hasOwnProperty.call(payload, 'maintenanceItems');
    const hasHosting = Object.prototype.hasOwnProperty.call(payload, 'hostingItems');
    const hasThirdParty = Object.prototype.hasOwnProperty.call(payload, 'thirdPartyItems');
    const hasChangeRequests = Object.prototype.hasOwnProperty.call(payload, 'changeRequestItems');
    const hasTimeline = Object.prototype.hasOwnProperty.call(payload, 'timelineItems');
    const hasPaymentPlans = Object.prototype.hasOwnProperty.call(payload, 'paymentPlans');

    const sections = hasSections ? parseSections(payload.sections) : undefined;
    const pricingItems = hasPricing ? parsePricingItems(payload.pricingItems) : undefined;
    const maintenanceItems = hasMaintenance ? parseMaintenanceItems(payload.maintenanceItems) : undefined;
    const hostingItems = hasHosting ? parseHostingItems(payload.hostingItems) : undefined;
    const thirdPartyItems = hasThirdParty ? parseThirdPartyItems(payload.thirdPartyItems) : undefined;
    const changeRequestItems = hasChangeRequests ? parseChangeRequestItems(payload.changeRequestItems) : undefined;
    const timelineItems = hasTimeline ? parseTimelineItems(payload.timelineItems) : undefined;
    const paymentPlans = hasPaymentPlans ? parsePaymentPlans(payload.paymentPlans) : undefined;

    const updated = await prisma.$transaction(async (tx) => {
      // CHANGED: replacement operations are transactional. If any collection
      // fails validation at the database layer, the complete update rolls back.
      if (hasSections) {
        await tx.proposalSection.deleteMany({ where: { proposalId: id } });
      }
      if (hasPricing) {
        await tx.proposalPricingItem.deleteMany({ where: { proposalId: id } });
      }
      if (hasMaintenance) {
        await tx.proposalMaintenanceItem.deleteMany({ where: { proposalId: id } });
      }
      if (hasHosting) {
        await tx.proposalHostingItem.deleteMany({ where: { proposalId: id } });
      }
      if (hasThirdParty) {
        await tx.proposalThirdPartyItem.deleteMany({ where: { proposalId: id } });
      }
      if (hasChangeRequests) {
        await tx.proposalChangeRequestItem.deleteMany({ where: { proposalId: id } });
      }
      if (hasTimeline) {
        await tx.proposalTimelineItem.deleteMany({ where: { proposalId: id } });
      }
      if (hasPaymentPlans) {
        await tx.proposalPaymentPlan.deleteMany({ where: { proposalId: id } });
      }

      return tx.proposal.update({
        where: { id },
        data: {
          validUntil: validUntilDate,
          status: requestedStatus,
          ...(hasSections ? { sections: { create: sections! } } : {}),
          ...(hasPricing ? { pricingItems: { create: pricingItems! } } : {}),
          ...(hasMaintenance ? { maintenanceItems: { create: maintenanceItems! } } : {}),
          ...(hasHosting ? { hostingItems: { create: hostingItems! } } : {}),
          ...(hasThirdParty ? { thirdPartyItems: { create: thirdPartyItems! } } : {}),
          ...(hasChangeRequests ? { changeRequestItems: { create: changeRequestItems! } } : {}),
          ...(hasTimeline ? { timelineItems: { create: timelineItems! } } : {}),
          ...(hasPaymentPlans ? { paymentPlans: { create: paymentPlans! } } : {}),
        },
        include: proposalInclude,
      });
    }, { maxWait: 5000, timeout: 15000 });

    return jsonSuccess(updated, 200);
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('must be') ||
      error.message.includes('is required') ||
      error.message.includes('is invalid') ||
      error.message.includes('exceeds') ||
      error.message.includes('YYYY-MM-DD')
    )) {
      return jsonError(error.message, 400);
    }
    return errorResponse(jsonError, error, 'Failed to update proposal');
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return jsonError('Valid proposal UUID is required', 400);
    }

    const existing = await prisma.proposal.findFirst({
      where: {
        id,
        project: { type: ProjectType.INDUSTRIAL },
      },
      select: { id: true, status: true },
    });

    if (!existing) {
      return jsonError('Industrial proposal not found', 404);
    }

    // CHANGED: business documents cannot be hard-deleted after they leave DRAFT.
    if (existing.status !== ProposalStatus.DRAFT) {
      return jsonError('Only DRAFT proposals can be deleted', 409);
    }

    await prisma.proposal.delete({ where: { id } });

    return jsonSuccess(
      { message: 'Draft proposal deleted successfully', id },
      200
    );
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to delete proposal');
  }
}
