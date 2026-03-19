import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware stub. Currently a pass-through.
 * Will be extended to protect authenticated routes (e.g. /home) once session
 * management is finalized.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
