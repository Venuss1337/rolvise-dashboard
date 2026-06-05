import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json } from '@/lib/rolvise-backend/http';
import { getMe } from '@/lib/rolvise-backend/store';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireSession(request);
    return json(await getMe(user.id));
  } catch (error) {
    return errorResponse(error);
  }
}
