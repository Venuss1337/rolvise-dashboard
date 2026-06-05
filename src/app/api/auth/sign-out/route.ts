import { signOut } from '@/lib/rolvise-backend/auth';
import { errorResponse } from '@/lib/rolvise-backend/http';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    return signOut(request);
  } catch (error) {
    return errorResponse(error);
  }
}
