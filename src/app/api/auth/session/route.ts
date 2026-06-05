import { getOptionalSession } from '@/lib/rolvise-backend/auth';
import { ApiError, errorResponse, json } from '@/lib/rolvise-backend/http';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const context = getOptionalSession(request);

    if (!context) {
      throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
    }

    return json({
      authenticated: true,
      user: context.user,
      discord: context.discord,
      expiresAt: context.session.expiresAt
    });
  } catch (error) {
    return errorResponse(error);
  }
}
