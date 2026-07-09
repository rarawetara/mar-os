import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyCronSecret, verifySessionToken } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /api/cron/* живёт за отдельным секретом, не за cookie-сессией.
  if (pathname.startsWith("/api/cron/")) {
    const secret = request.headers.get("x-cron-secret") ?? request.nextUrl.searchParams.get("secret");
    if (!verifyCronSecret(secret)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Гейт логина должен быть доступен без сессии — иначе войти невозможно.
  if (pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  const authed = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/api/")) {
    if (!authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname === "/login" || pathname === "/offline") {
    if (authed && pathname === "/login") return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest).*)"],
};
