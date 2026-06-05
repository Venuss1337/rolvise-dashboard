import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json } from '@/lib/rolvise-backend/http';
import { getMe } from '@/lib/rolvise-backend/store';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { user } = requireSession(request);
    return json(getMe(user.id));
  } catch (error) {
    return errorResponse(error);
  }
}
