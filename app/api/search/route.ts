import { NextResponse, type NextRequest } from "next/server";
import { searchItems } from "@/lib/tg/repo";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ items: [] });

  const items = await searchItems(q);
  return NextResponse.json({ items });
}
