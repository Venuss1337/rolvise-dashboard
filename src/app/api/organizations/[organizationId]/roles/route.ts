import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json, readJson } from '@/lib/rolvise-backend/http';
import { createCommunityRole, listCommunityRoles } from '@/lib/rolvise-backend/store';
import { communityRoleInputSchema } from '@/lib/rolvise-backend/validation';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ organizationId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { user } = await requireSession(request);
    const { organizationId } = await params;
    const serverId = request.nextUrl.searchParams.get('serverId');

    if (!serverId) {
      return json(
        { error: { code: 'bad_request', message: 'serverId is required.' } },
        { status: 400 }
      );
    }

    return json({ items: await listCommunityRoles(user.id, organizationId, serverId) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { user } = await requireSession(request);
    const { organizationId } = await params;
    const values = communityRoleInputSchema.parse(await readJson(request));

    return json(await createCommunityRole(user.id, organizationId, values), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
