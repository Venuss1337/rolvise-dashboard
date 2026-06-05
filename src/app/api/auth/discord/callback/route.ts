import { completeDiscordAuthorization } from '@/lib/rolvise-backend/auth';
import { errorResponse } from '@/lib/rolvise-backend/http';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return await completeDiscordAuthorization(request);
  } catch (error) {
    return errorResponse(error);
  }
}
