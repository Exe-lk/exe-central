import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retrieve authenticated user session and extended profile
 *     description: Fetches the current authenticated session user from Supabase and merges extended profile data (role, status) from the PostgreSQL database via Prisma.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Authenticated user details and extended profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: MANAGEMENT
 *                     status:
 *                       type: string
 *                       example: ACTIVE
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 authUser:
 *                   type: object
 *       401:
 *         description: Unauthorized - User session not found
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized: Session not found' },
        { status: 401 }
      );
    }

    // Fetch extended user profile from public.users using auth user ID
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    return NextResponse.json(
      {
        user: dbUser
          ? {
              ...dbUser,
              email: dbUser.email || authUser.email,
            }
          : {
              id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
              role: 'ADMINISTRATOR',
              status: 'ACTIVE',
            },
        authUser,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
