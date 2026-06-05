import { requireBotSignature } from '@/lib/rolvise-backend/auth';
import { errorResponse, json, parseJson } from '@/lib/rolvise-backend/http';
import { ingestBotEvent } from '@/lib/rolvise-backend/store';
import { botEventSchema } from '@/lib/rolvise-backend/validation';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    requireBotSignature(request, rawBody);

    const event = botEventSchema.parse(parseJson(rawBody));
    return json(await ingestBotEvent(event), { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
