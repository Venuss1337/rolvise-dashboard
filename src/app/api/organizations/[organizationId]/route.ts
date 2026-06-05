import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json } from '@/lib/rolvise-backend/http';
import { getOrganizationDetail } from '@/lib/rolvise-backend/store';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ organizationId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { organizationId } = await params;
    const { user } = await requireSession(request);

    return json(await getOrganizationDetail(user.id, organizationId));
  } catch (error) {
    return errorResponse(error);
  }
}
