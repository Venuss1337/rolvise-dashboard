import { getOptionalSession } from '@/lib/rolvise-backend/auth';
import { ApiError, errorResponse, json } from '@/lib/rolvise-backend/http';
import { getMe } from '@/lib/rolvise-backend/store';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const context = await getOptionalSession(request);

    if (!context) {
      throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
    }

    const accountContext = await getMe(context.user.id);

    return json({
      authenticated: true,
      user: accountContext.user,
      discord: accountContext.discord,
      expiresAt: context.session.expiresAt.toISOString()
    });
  } catch (error) {
    return errorResponse(error);
  }
}
