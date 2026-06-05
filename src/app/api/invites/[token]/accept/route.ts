import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json } from '@/lib/rolvise-backend/http';
import { acceptDashboardInvite } from '@/lib/rolvise-backend/store';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { user } = await requireSession(request);
    const { token } = await params;

    return json(await acceptDashboardInvite(user.id, token), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
