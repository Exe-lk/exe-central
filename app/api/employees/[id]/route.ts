import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonSuccess, jsonError } from '@/utils/apiResponse';
import { errorResponse, isUuid } from '@/lib/outsourcingApi';

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get single employee details
 *     description: Retrieves detailed employee information including their full list of uploaded HR documents.
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The unique identifier of the employee
 *     responses:
 *       200:
 *         description: Employee details retrieved successfully
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid employee UUID is required', 400);

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!employee) return jsonError('Employee not found', 404);

    return jsonSuccess(employee, 200);
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to fetch employee');
  }
}

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update employee record
 *     description: Modifies employee details such as full name, email, position, status, dates, and Google Drive folder reference.
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The unique identifier of the employee
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                 example: Associate Software Engineer
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, RESIGNED]
 *                 example: ACTIVE
 *               appointedDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-01-15
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: 2026-07-15
 *               driveFolderId:
 *                 type: string
 *                 nullable: true
 *                 example: 1a2b3c4d5e6f
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       400:
 *         description: Validation error or duplicate email
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid employee UUID is required', 400);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonError('Invalid or missing JSON request body', 400);
    }

    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!existingEmployee) return jsonError('Employee not found', 404);

    const { fullName, email, position, status, appointedDate, endDate, driveFolderId } = body;
    const updateData: any = {};

    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || !fullName.trim()) {
        return jsonError('Full name cannot be empty', 400);
      }
      updateData.fullName = fullName.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim()) {
        return jsonError('Email address cannot be empty', 400);
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return jsonError('Invalid email address format', 400);
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== existingEmployee.email) {
        const emailConflict = await prisma.employee.findFirst({
          where: {
            email: normalizedEmail,
            id: { not: id },
          },
        });
        if (emailConflict) {
          return jsonError(`An employee with email "${normalizedEmail}" already exists.`, 400);
        }
        updateData.email = normalizedEmail;
      }
    }

    if (position !== undefined) {
      if (typeof position !== 'string' || !position.trim()) {
        return jsonError('Job position cannot be empty', 400);
      }
      updateData.position = position.trim();
    }

    if (status !== undefined) {
      const validStatuses = ['ACTIVE', 'COMPLETED', 'RESIGNED'];
      if (!validStatuses.includes(status)) {
        return jsonError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
      updateData.status = status;
    }

    if (appointedDate !== undefined) {
      const parsedAppointedDate = new Date(appointedDate);
      if (isNaN(parsedAppointedDate.getTime())) {
        return jsonError('Invalid appointed date format', 400);
      }
      updateData.appointedDate = parsedAppointedDate;
    }

    if (endDate !== undefined) {
      if (endDate === null || endDate === '') {
        updateData.endDate = null;
      } else {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          return jsonError('Invalid end date format', 400);
        }
        updateData.endDate = parsedEndDate;
      }
    }

    if (driveFolderId !== undefined) {
      updateData.driveFolderId = driveFolderId ? String(driveFolderId).trim() : null;
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    return jsonSuccess(updatedEmployee, 200, { message: 'Employee updated successfully' });
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to update employee');
  }
}

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Delete employee record
 *     description: Permanently deletes an employee record and all associated HR documents from the database.
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The unique identifier of the employee to delete
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *       400:
 *         description: Invalid UUID format
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return jsonError('Valid employee UUID is required', 400);

    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!existingEmployee) return jsonError('Employee not found', 404);

    await prisma.employee.delete({
      where: { id },
    });

    return jsonSuccess(null, 200, { message: 'Employee deleted successfully' });
  } catch (error) {
    return errorResponse(jsonError, error, 'Failed to delete employee');
  }
}

export const runtime = 'nodejs';
