import { createDiscordAuthorization } from '@/lib/rolvise-backend/auth';
import { errorResponse, parseJson } from '@/lib/rolvise-backend/http';
import { startDiscordLoginSchema } from '@/lib/rolvise-backend/validation';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = rawBody.trim() ? parseJson(rawBody) : undefined;
    const values = startDiscordLoginSchema.parse(body);

    return createDiscordAuthorization(request, values?.redirectTo ?? '/dashboard/servers');
  } catch (error) {
    return errorResponse(error);
  }
}
