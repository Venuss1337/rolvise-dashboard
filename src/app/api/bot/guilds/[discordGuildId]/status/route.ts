import { requireBotBearer } from '@/lib/rolvise-backend/auth';
import { errorResponse, json } from '@/lib/rolvise-backend/http';
import { getBotGuildStatus } from '@/lib/rolvise-backend/store';
import { discordSnowflakeSchema } from '@/lib/rolvise-backend/validation';
import { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<{ discordGuildId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    requireBotBearer(request);
    const { discordGuildId } = await params;
    const parsedDiscordGuildId = discordSnowflakeSchema.parse(discordGuildId);

    return json(getBotGuildStatus(parsedDiscordGuildId));
  } catch (error) {
    return errorResponse(error);
  }
}
