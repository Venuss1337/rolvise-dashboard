import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'bot_unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'discord_guild_already_linked'
  | 'claim_expired'
  | 'claim_consumed'
  | 'validation_error'
  | 'rate_limited'
  | 'internal_server_error';

const statusByCode: Record<ApiErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  bot_unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  discord_guild_already_linked: 409,
  claim_expired: 410,
  claim_consumed: 410,
  validation_error: 422,
  rate_limited: 429,
  internal_server_error: 500
};

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  issues?: { path: string; message: string; code?: string | null }[];

  constructor(
    code: ApiErrorCode,
    message: string,
    options?: {
      status?: number;
      issues?: { path: string; message: string; code?: string | null }[];
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = options?.status ?? statusByCode[code];
    this.issues = options?.issues;
  }
}

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function empty(status = 204) {
  return new NextResponse(null, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'validation_error',
          message: 'One or more fields are invalid.',
          issues: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        }
      },
      { status: 422 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.issues && { issues: error.issues })
        }
      },
      { status: error.status }
    );
  }

  return NextResponse.json(
    {
      error: {
        code: 'internal_server_error',
        message: 'Something went wrong.'
      }
    },
    { status: 500 }
  );
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError('bad_request', 'Request body is malformed.');
  }
}

export function parseJson(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new ApiError('bad_request', 'Request body is malformed.');
  }
}
