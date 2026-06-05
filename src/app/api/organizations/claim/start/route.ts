import { requireBotSignature } from '@/lib/rolvise-backend/auth';
import { errorResponse, json, parseJson } from '@/lib/rolvise-backend/http';
import { startOrganizationClaim } from '@/lib/rolvise-backend/store';
import { startOrganizationClaimSchema } from '@/lib/rolvise-backend/validation';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    requireBotSignature(request, rawBody);

    const values = startOrganizationClaimSchema.parse(parseJson(rawBody));
    return json(startOrganizationClaim(values, request.url), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
