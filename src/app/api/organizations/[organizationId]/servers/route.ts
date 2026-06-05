import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json } from '@/lib/rolvise-backend/http';
import { listManagedServers } from '@/lib/rolvise-backend/store';
import { managedServerQuerySchema } from '@/lib/rolvise-backend/validation';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ organizationId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { organizationId } = await params;
    const { user } = requireSession(request);
    const filters = managedServerQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    return json(listManagedServers(user.id, organizationId, filters));
  } catch (error) {
    return errorResponse(error);
  }
}
