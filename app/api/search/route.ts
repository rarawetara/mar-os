import { NextResponse, type NextRequest } from "next/server";
import { searchItems } from "@/lib/tg/repo";
import { requireAuth, isDenied, AGENT_FORBIDDEN_MODULES } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, ["session", "mcp"]);
  if (isDenied(auth)) return auth;

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ items: [] });

  const found = await searchItems(q);

  // Поиск идёт по всем модулям сразу, поэтому сейф отсекаем здесь.
  const items =
    auth.caller === "mcp"
      ? found.filter((item) => !(AGENT_FORBIDDEN_MODULES as readonly string[]).includes(item.module))
      : found;

  return NextResponse.json({ items });
}
