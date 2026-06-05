import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json } from '@/lib/rolvise-backend/http';
import { listCommunityMembers } from '@/lib/rolvise-backend/store';
import { communityMemberQuerySchema } from '@/lib/rolvise-backend/validation';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ organizationId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { user } = await requireSession(request);
    const { organizationId } = await params;
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const values = communityMemberQuerySchema.parse(searchParams);

    return json(await listCommunityMembers(user.id, organizationId, values));
  } catch (error) {
    return errorResponse(error);
  }
}
