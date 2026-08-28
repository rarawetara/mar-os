import { NextResponse, type NextRequest } from "next/server";
import { authenticate } from "@/lib/auth/guard";

// В Next 16 middleware называется proxy. Runtime по умолчанию — Node.js,
// поэтому node:crypto внутри verify* работает.
//
// Это первый слой защиты: ни один /api/* не отвечает без опознания вызывающего.
// Второй слой — requireAuth внутри каждого роута (так велит дока Next:
// на proxy одном полагаться нельзя, рефактор может молча снять защиту).

const PUBLIC_PATHS = ["/api/auth/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  if (!authenticate(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
