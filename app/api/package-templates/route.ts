import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';

/**
 * @swagger
 * /api/package-templates:
 *   get:
 *     summary: List outsourcing package templates
 *     description: Returns reusable standard outsourcing payment package templates and their default milestones.
 *     tags: [Package Templates]
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *       500:
 *         description: Internal server error
 */
export async function GET(_request: NextRequest) {
  try {
    const templates = await prisma.packageTemplate.findMany({
      include: { milestones: { orderBy: { order: 'asc' } } },
      orderBy: { durationMonths: 'asc' },
    });
    return jsonSuccess(templates, 200, { total: templates.length });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Failed to fetch package templates', 500);
  }
}
