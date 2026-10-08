import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { errorResponse } from '@/lib/outsourcingApi';
import { createProjectFolder } from '@/lib/googleDrive';

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Fetch employee directory
 *     description: Retrieves all employee records ordered by creation date descending.
 *     tags: [Employees]
 *     responses:
 *       200:
 *         description: A list of employees successfully retrieved
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
 *       500:
 *         description: Internal server error
 */
export async function GET(_request: NextRequest) {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return jsonSuccess(employees, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch employees');
  }
}

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create a new employee record
 *     description: Registers a new employee or intern in the HR Document Vault.
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - position
 *               - appointedDate
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Sandun Perera
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sandun@exe.lk
 *               position:
 *                 type: string
 *                 example: Intern Software Engineer
 *               appointedDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-01-15
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: 2026-07-15
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, RESIGNED]
 *                 default: ACTIVE
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Validation error or email already in use
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonError('Invalid or missing JSON request body', 400);
    }

    const { fullName, email, position, appointedDate, endDate, status } = body;

    // 1. Validate required fields
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return jsonError('Full name is required', 400);
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return jsonError('Email address is required', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return jsonError('Invalid email address format', 400);
    }

    if (!position || typeof position !== 'string' || !position.trim()) {
      return jsonError('Job position is required', 400);
    }

    if (!appointedDate) {
      return jsonError('Appointed date is required', 400);
    }

    const parsedAppointedDate = new Date(appointedDate);
    if (isNaN(parsedAppointedDate.getTime())) {
      return jsonError('Invalid appointed date format', 400);
    }

    let parsedEndDate: Date | null = null;
    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return jsonError('Invalid end date format', 400);
      }
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Pre-check database to ensure email is not already in use
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmployee) {
      return jsonError(`An employee with email "${normalizedEmail}" already exists.`, 400);
    }

    // 3. Optional: Create dedicated Google Drive folder
    let driveFolderId: string | null = null;
    try {
      const folderName = `[EMP] ${fullName.trim()}`;
      driveFolderId = await createProjectFolder(folderName);
    } catch (driveErr) {
      console.warn('⚠️ [Google Drive] Could not create employee folder automatically:', driveErr);
    }

    // 4. Create new employee record
    const newEmployee = await prisma.employee.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        position: position.trim(),
        appointedDate: parsedAppointedDate,
        endDate: parsedEndDate,
        status: status && ['ACTIVE', 'COMPLETED', 'RESIGNED'].includes(status) ? status : 'ACTIVE',
        driveFolderId,
      },
      include: {
        documents: true,
      },
    });

    return jsonSuccess(newEmployee, 201, { message: 'Employee created successfully' });
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to create employee');
  }
}

export const runtime = 'nodejs';
