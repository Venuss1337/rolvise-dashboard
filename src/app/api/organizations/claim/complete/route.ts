import { requireSession } from '@/lib/rolvise-backend/auth';
import { errorResponse, json, readJson } from '@/lib/rolvise-backend/http';
import { completeOrganizationClaim } from '@/lib/rolvise-backend/store';
import { completeOrganizationClaimSchema } from '@/lib/rolvise-backend/validation';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { user } = requireSession(request);
    const values = completeOrganizationClaimSchema.parse(await readJson(request));

    return json(completeOrganizationClaim(user.id, values), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
