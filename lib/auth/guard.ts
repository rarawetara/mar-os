import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
  verifyCronSecret,
  verifyMcpToken,
} from "@/lib/auth/session";

// Кто стучится в API. Разные вызывающие — разные права.
//   session — Марта из браузера, может всё
//   mcp     — агент (noname), всё кроме сейфа
//   cron    — GitHub Actions, только /api/cron/*
export type Caller = "session" | "mcp" | "cron";

function bearer(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

export function authenticate(request: NextRequest): Caller | null {
  if (verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return "session";

  const token = bearer(request);
  if (verifyMcpToken(token)) return "mcp";
  if (verifyCronSecret(token)) return "cron";

  // GitHub Actions шлёт секрет отдельным заголовком — так уже написан
  // .github/workflows/reminders.yml, не ломаем.
  if (verifyCronSecret(request.headers.get("x-cron-secret"))) return "cron";

  return null;
}

/**
 * Проверка внутри роута. Возвращает Response — значит отказ, отдать его сразу.
 * Возвращает объект с caller — можно работать.
 *
 * Дока Next прямо предупреждает: на proxy.ts одном полагаться нельзя,
 * иначе рефактор роутов молча снимет защиту. Поэтому проверяем и здесь.
 */
export function requireAuth(
  request: NextRequest,
  allowed: Caller[]
): { caller: Caller } | NextResponse {
  const caller = authenticate(request);

  if (!caller) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!allowed.includes(caller)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return { caller };
}

export function isDenied(result: { caller: Caller } | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}

// Сейф шифруется на клиенте — смысл в том, что расшифровка живёт только
// в браузере Марты. Пускать туда агента нельзя: содержимое утечёт в контекст модели.
export const AGENT_FORBIDDEN_MODULES = ["vault"] as const;

export function agentMayTouchModule(caller: Caller, module: string | null | undefined): boolean {
  if (caller !== "mcp") return true;
  return !(AGENT_FORBIDDEN_MODULES as readonly string[]).includes(module ?? "");
}
