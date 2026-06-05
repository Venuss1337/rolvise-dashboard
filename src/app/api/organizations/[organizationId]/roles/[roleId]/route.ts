import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json, readJson } from '@/lib/rolvise-backend/http';
import { deleteCommunityRole, updateCommunityRole } from '@/lib/rolvise-backend/store';
import { communityRolePatchSchema } from '@/lib/rolvise-backend/validation';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ organizationId: string; roleId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { user } = await requireSession(request);
    const { organizationId, roleId } = await params;
    const values = communityRolePatchSchema.parse(await readJson(request));

    return json(await updateCommunityRole(user.id, organizationId, roleId, values));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { user } = await requireSession(request);
    const { organizationId, roleId } = await params;

    return json(await deleteCommunityRole(user.id, organizationId, roleId));
  } catch (error) {
    return errorResponse(error);
  }
}
