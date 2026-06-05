import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json } from '@/lib/rolvise-backend/http';
import { getOrganizationClaimStatus } from '@/lib/rolvise-backend/store';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ claimToken: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    requireSession(request);
    const { claimToken } = await params;

    return json(getOrganizationClaimStatus(claimToken));
  } catch (error) {
    return errorResponse(error);
  }
}
