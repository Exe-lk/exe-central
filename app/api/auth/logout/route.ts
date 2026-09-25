import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Sign out the authenticated user
 *     description: Terminates the current Supabase authentication session and clears session cookies.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Successfully signed out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       500:
 *         description: Internal server error
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
