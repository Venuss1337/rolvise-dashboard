import { errorResponse, json } from '@/lib/rolvise-backend/http';
import { getDashboardInvitePreview } from '@/lib/rolvise-backend/store';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { token } = await params;

    return json(await getDashboardInvitePreview(token));
  } catch (error) {
    return errorResponse(error);
  }
}
