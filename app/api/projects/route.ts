import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { createProjectFolder } from '@/lib/googleDrive';
import { Prisma, ProjectType, ProjectStatus, OutsourcingMode } from '@prisma/client';

const VALID_PROJECT_TYPES = Object.values(ProjectType);
const VALID_PROJECT_STATUSES = Object.values(ProjectStatus);
const VALID_OUTSOURCING_MODES = Object.values(OutsourcingMode);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Retrieve a list of projects
 *     description: Fetches all projects with optional query parameter filtering by project type or status, ordered by creation timestamp descending.
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [OUTSOURCING, INDUSTRIAL]
 *         description: Filter projects by project type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, IN_PROGRESS, PENDING_REVIEW, COMPLETED, CANCELLED]
 *         description: Filter projects by project status
 *     responses:
 *       200:
 *         description: A list of projects successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       sequenceNo:
 *                         type: integer
 *                         example: 74
 *                       projectNo:
 *                         type: string
 *                         example: PN074
 *                       name:
 *                         type: string
 *                         example: Enterprise ERP Integration
 *                       clientName:
 *                         type: string
 *                         example: John Doe
 *                       clientCompany:
 *                         type: string
 *                         nullable: true
 *                         example: Acme Corp
 *                       clientEmail:
 *                         type: string
 *                         nullable: true
 *                         example: client@acme.com
 *                       clientPhone:
 *                         type: string
 *                         nullable: true
 *                         example: "+1234567890"
 *                       clientAddress:
 *                         type: string
 *                         nullable: true
 *                       country:
 *                         type: string
 *                         nullable: true
 *                         example: Sri Lanka
 *                       type:
 *                         type: string
 *                         enum: [OUTSOURCING, INDUSTRIAL]
 *                       status:
 *                         type: string
 *                         enum: [DRAFT, IN_PROGRESS, PENDING_REVIEW, COMPLETED, CANCELLED]
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       projectManager:
 *                         type: string
 *                         nullable: true
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       driveFolderId:
 *                         type: string
 *                         nullable: true
 *                       outsourcingProject:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           mode:
 *                             type: string
 *                             enum: [INDIVIDUAL, GROUP]
 *                           participants:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 code:
 *                                   type: string
 *                                   example: C1
 *                                 name:
 *                                   type: string
 *                                   example: John Doe
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to fetch projects
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project with optional nested outsourcing details (mode and participants) and automatically sets up a Google Drive folder.
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectNo
 *               - name
 *               - clientName
 *               - type
 *             properties:
 *               projectNo:
 *                 type: string
 *                 example: PN074
 *               name:
 *                 type: string
 *                 example: Enterprise ERP Integration
 *               clientName:
 *                 type: string
 *                 example: John Doe
 *               clientCompany:
 *                 type: string
 *                 example: Acme Corp
 *               clientEmail:
 *                 type: string
 *                 format: email
 *                 example: client@acme.com
 *               clientPhone:
 *                 type: string
 *                 example: "+1234567890"
 *               clientAddress:
 *                 type: string
 *                 example: "123 Business St, Tech City"
 *               country:
 *                 type: string
 *                 example: "Sri Lanka"
 *               type:
 *                 type: string
 *                 enum: [OUTSOURCING, INDUSTRIAL]
 *                 example: OUTSOURCING
 *               outsourcingMode:
 *                 type: string
 *                 enum: [INDIVIDUAL, GROUP]
 *                 description: Required if type is OUTSOURCING. Defines individual or multi-participant group mode.
 *                 example: GROUP
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of participant names. Required if type is OUTSOURCING and outsourcingMode is GROUP.
 *                 example: ["John Doe", "Jane Smith"]
 *               status:
 *                 type: string
 *                 enum: [DRAFT, IN_PROGRESS, PENDING_REVIEW, COMPLETED, CANCELLED]
 *                 default: DRAFT
 *                 example: DRAFT
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-01T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2027-03-31T00:00:00.000Z"
 *               projectManager:
 *                 type: string
 *                 example: Jane Smith
 *               description:
 *                 type: string
 *                 example: Detailed system integration project for Acme Corp.
 *     responses:
 *       201:
 *         description: Project created successfully (includes driveFolderId and nested outsourcing object if applicable)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     projectNo:
 *                       type: string
 *                     name:
 *                       type: string
 *                     clientName:
 *                       type: string
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 *                     driveFolderId:
 *                       type: string
 *                       nullable: true
 *                     outsourcingProject:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         mode:
 *                           type: string
 *                           enum: [INDIVIDUAL, GROUP]
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               code:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     warning:
 *                       type: string
 *                       example: "Project created successfully, but Google Drive folder creation failed"
 *       400:
 *         description: Bad request - Missing required fields, invalid enum value, missing group participants, or duplicate project number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Project number already exists"
 *       500:
 *         description: Internal server error
 * */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const statusParam = searchParams.get('status');

    const where: Prisma.ProjectWhereInput = {};

    if (typeParam) {
      if (!VALID_PROJECT_TYPES.includes(typeParam as ProjectType)) {
        return jsonError(`Invalid type parameter. Must be one of: ${VALID_PROJECT_TYPES.join(', ')}`, 400);
      }
      where.type = typeParam as ProjectType;
    }

    if (statusParam) {
      if (!VALID_PROJECT_STATUSES.includes(statusParam as ProjectStatus)) {
        return jsonError(`Invalid status parameter. Must be one of: ${VALID_PROJECT_STATUSES.join(', ')}`, 400);
      }
      where.status = statusParam as ProjectStatus;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        outsourcingProject: {
          include: {
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return jsonSuccess(projects, 200, { total: projects.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch projects';
    return jsonError(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return jsonError('Invalid or missing JSON request body', 400);
    }

    const {
      projectNo,
      name,
      clientName,
      clientCompany,
      clientEmail,
      clientPhone,
      clientAddress,
      country,
      type,
      outsourcingMode,
      participants,
      status,
      startDate,
      endDate,
      projectManager,
      description,
    } = body;

    // Validate base required fields
    const missingFields: string[] = [];
    if (!projectNo || typeof projectNo !== 'string' || !projectNo.trim()) missingFields.push('projectNo');
    if (!name || typeof name !== 'string' || !name.trim()) missingFields.push('name');
    if (!clientName || typeof clientName !== 'string' || !clientName.trim()) missingFields.push('clientName');
    if (!type) missingFields.push('type');

    if (missingFields.length > 0) {
      return jsonError(`Missing required fields: ${missingFields.join(', ')}`, 400, { missingFields });
    }

    // Validate project type enum
    if (!VALID_PROJECT_TYPES.includes(type as ProjectType)) {
      return jsonError(`Invalid project type '${type}'. Allowed values: ${VALID_PROJECT_TYPES.join(', ')}`, 400);
    }

    // Validate outsourcing nesting requirements
    if ((type as ProjectType) === ProjectType.OUTSOURCING) {
      if (!outsourcingMode || !VALID_OUTSOURCING_MODES.includes(outsourcingMode as OutsourcingMode)) {
        return jsonError(
          `outsourcingMode is required when type is OUTSOURCING. Allowed values: ${VALID_OUTSOURCING_MODES.join(', ')}`,
          400
        );
      }

      if ((outsourcingMode as OutsourcingMode) === OutsourcingMode.GROUP) {
        if (!Array.isArray(participants) || participants.length === 0) {
          return jsonError('participants array (with at least one participant name) is required when outsourcingMode is GROUP', 400);
        }

        const validParticipants = participants
          .map((p: unknown) => (typeof p === 'string' ? p.trim() : ''))
          .filter((p: string) => p.length > 0);

        if (validParticipants.length === 0) {
          return jsonError('participants array must contain non-empty participant name strings', 400);
        }
      }
    }

    // Validate status enum if provided
    let projectStatus: ProjectStatus = ProjectStatus.DRAFT;
    if (status !== undefined && status !== null) {
      if (!VALID_PROJECT_STATUSES.includes(status as ProjectStatus)) {
        return jsonError(`Invalid project status '${status}'. Allowed values: ${VALID_PROJECT_STATUSES.join(', ')}`, 400);
      }
      projectStatus = status as ProjectStatus;
    }

    // Execute database transaction for Project and nested Outsourcing structures
    const newProject = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          projectNo: projectNo.trim(),
          name: name.trim(),
          clientName: clientName.trim(),
          clientCompany: clientCompany ? String(clientCompany).trim() : null,
          clientEmail: clientEmail ? String(clientEmail).trim() : null,
          clientPhone: clientPhone ? String(clientPhone).trim() : null,
          clientAddress: clientAddress ? String(clientAddress).trim() : null,
          country: country ? String(country).trim() : null,
          type: type as ProjectType,
          status: projectStatus,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          projectManager: projectManager ? String(projectManager).trim() : null,
          description: description ? String(description).trim() : null,
        },
      });

      if ((type as ProjectType) === ProjectType.OUTSOURCING) {
        const mode = outsourcingMode as OutsourcingMode;
        const isGroup = mode === OutsourcingMode.GROUP;
        const participantData = isGroup && Array.isArray(participants)
          ? participants
              .map((p: unknown) => String(p).trim())
              .filter((p: string) => p.length > 0)
              .map((pName: string, index: number) => ({
                code: `C${index + 1}`,
                name: pName,
              }))
          : [];

        await tx.outsourcingProject.create({
          data: {
            projectId: project.id,
            mode,
            ...(participantData.length > 0
              ? {
                  participants: {
                    create: participantData,
                  },
                }
              : {}),
          },
        });
      }

      return project;
    });

    // Create Google Drive folder AFTER transaction succeeds
    let driveFolderId: string | null = null;
    let driveWarning: string | undefined = undefined;

    try {
      const folderName = `[${newProject.projectNo}] ${newProject.name}`;
      driveFolderId = await createProjectFolder(folderName);

      await prisma.project.update({
        where: { id: newProject.id },
        data: { driveFolderId },
      });
    } catch (driveErr: unknown) {
      console.error('Failed to create Google Drive project folder:', driveErr);
      driveWarning = 'Project created successfully, but Google Drive folder creation failed';
    }

    // Retrieve final project with nested relations
    const finalProject = await prisma.project.findUnique({
      where: { id: newProject.id },
      include: {
        outsourcingProject: {
          include: {
            participants: true,
          },
        },
      },
    });

    return jsonSuccess(
      finalProject || newProject,
      201,
      driveWarning ? { warning: driveWarning } : undefined
    );
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return jsonError('Project number already exists', 400, { target: err.meta?.target });
    }
    const message = err instanceof Error ? err.message : 'Failed to create project';
    return jsonError(message, 500);
  }
}