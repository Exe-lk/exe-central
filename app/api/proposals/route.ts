import { NextRequest } from 'next/server';
import { Prisma, ProjectType } from '@prisma/client';
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
} from '@/lib/proposalApi';

/**
 * @swagger
 * /api/proposals:
 *   get:
 *     summary: List industrial proposals
 *     description: Returns proposal headers and, when includeDetails=true, their modular content. Only proposals belonging to INDUSTRIAL projects are returned.
 *     tags:
 *       - Proposals
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: includeDetails
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Proposals retrieved successfully
 *       400:
 *         description: Invalid query parameter
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create an industrial proposal
 *     description: Creates a proposal only for an INDUSTRIAL project. The parent and all modular child blocks are created atomically.
 *     tags:
 *       - Proposals
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IndustrialProposalCreateRequest'
 *     responses:
 *       201:
 *         description: Proposal created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Industrial project not found
 *       409:
 *         description: Proposal creation conflicts with the project/business state
 *       500:
 *         description: Internal server error
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const includeDetails = searchParams.get('includeDetails') === 'true';

    if (projectId && !isUuid(projectId)) {
      return jsonError('projectId must be a valid UUID', 400);
    }

    const where: Prisma.ProposalWhereInput = {
      project: { type: ProjectType.INDUSTRIAL },
      ...(projectId ? { projectId } : {}),
    };

    const proposals = includeDetails
      ? await prisma.proposal.findMany({
          where,
          include: proposalInclude,
          orderBy: { createdAt: 'desc' },
        })
      : await prisma.proposal.findMany({
          where,
          include: {
            project: true,
            _count: {
              select: {
                sections: true,
                pricingItems: true,
                maintenanceItems: true,
                hostingItems: true,
                thirdPartyItems: true,
                changeRequestItems: true,
                timelineItems: true,
                paymentPlans: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

    return jsonSuccess(proposals, 200, { total: proposals.length });
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch proposals');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return jsonError('Invalid or missing JSON request body', 400);
    }

    const { projectId, validUntil } = body as Record<string, unknown>;

    if (typeof projectId !== 'string' || !isUuid(projectId)) {
      return jsonError('projectId is required and must be a valid UUID', 400);
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, type: true },
    });

    if (!project || project.type !== ProjectType.INDUSTRIAL) {
      return jsonError('An INDUSTRIAL project is required to create a proposal', 404);
    }

    // Defensively handle ISO date strings to prevent parseDateOnly from throwing a 400
    let validUntilDate = null;
    if (validUntil && typeof validUntil === 'string' && validUntil.trim() !== '') {
      const dateStr = validUntil.includes('T') ? validUntil.split('T')[0] : validUntil;
      validUntilDate = parseDateOnly(dateStr, 'validUntil', true);
    }

    // =================================================================================
    // JSON INTERCEPTOR: Convert flat textarea strings into structured JSON objects
    // =================================================================================
    let rawSections = (body as any).sections;
    if (Array.isArray(rawSections)) {
      rawSections = rawSections.map((sec: any) => {
        if (sec && typeof sec.content === 'string') {
          try {
            // Attempt to parse if it is already stringified JSON
            sec.content = JSON.parse(sec.content);
          } catch (e) {
            // If it's just raw text from a textarea, wrap it safely in a JSON structure
            sec.content = { text: sec.content };
          }
        }
        return sec;
      });
    }

    const sections = parseSections(rawSections);
    const pricingItems = parsePricingItems((body as any).pricingItems);
    const maintenanceItems = parseMaintenanceItems((body as any).maintenanceItems);
    const hostingItems = parseHostingItems((body as any).hostingItems);
    const thirdPartyItems = parseThirdPartyItems((body as any).thirdPartyItems);
    const changeRequestItems = parseChangeRequestItems((body as any).changeRequestItems);
    const timelineItems = parseTimelineItems((body as any).timelineItems);
    const paymentPlans = parsePaymentPlans((body as any).paymentPlans);

    const proposal = await prisma.$transaction(async (tx) => {
      return tx.proposal.create({
        data: {
          projectId,
          validUntil: validUntilDate,
          sections: sections?.length ? { create: sections } : undefined,
          pricingItems: pricingItems?.length ? { create: pricingItems } : undefined,
          maintenanceItems: maintenanceItems?.length ? { create: maintenanceItems } : undefined,
          hostingItems: hostingItems?.length ? { create: hostingItems } : undefined,
          thirdPartyItems: thirdPartyItems?.length ? { create: thirdPartyItems } : undefined,
          changeRequestItems: changeRequestItems?.length ? { create: changeRequestItems } : undefined,
          timelineItems: timelineItems?.length ? { create: timelineItems } : undefined,
          paymentPlans: paymentPlans?.length ? { create: paymentPlans } : undefined,
        },
        include: proposalInclude,
      });
    }, { maxWait: 5000, timeout: 15000 });

    return jsonSuccess(proposal, 201);
  } catch (error: any) {
    console.error('\n🔴 [PROPOSAL CREATE ERROR]:', error?.message || error);
    
    if (error instanceof Error && (
      error.message.includes('must be') ||
      error.message.includes('is required') ||
      error.message.includes('is invalid') ||
      error.message.includes('exceeds') ||
      error.message.includes('YYYY-MM-DD')
    )) {
      return jsonError(error.message, 400);
    }
    return errorResponse(jsonError, error, 'Failed to create proposal');
  }
}

export const runtime = 'nodejs';