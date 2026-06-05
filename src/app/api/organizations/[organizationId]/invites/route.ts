import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json, readJson } from '@/lib/rolvise-backend/http';
import { createDashboardInvite } from '@/lib/rolvise-backend/store';
import { createDashboardInviteSchema } from '@/lib/rolvise-backend/validation';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ organizationId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { user } = await requireSession(request);
    const { organizationId } = await params;
    const values = createDashboardInviteSchema.parse(await readJson(request));

    return json(await createDashboardInvite(user.id, organizationId, values, request.url), {
      status: 201
    });
  } catch (error) {
    return errorResponse(error);
  }
}
