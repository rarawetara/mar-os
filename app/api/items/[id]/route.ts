import { NextResponse, type NextRequest } from "next/server";
import { archiveItem, updateItem } from "@/lib/tg/repo";
import { requireAuth, isDenied } from "@/lib/auth/guard";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request, ["session", "mcp"]);
  if (isDenied(auth)) return auth;

  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));

  if (body?.archive === true) {
    const item = await archiveItem(itemId);
    return NextResponse.json({ item });
  }

  const patch = { ...(body ?? {}) };
  delete patch.archive;
  const item = await updateItem(itemId, patch);
  return NextResponse.json({ item });
}
