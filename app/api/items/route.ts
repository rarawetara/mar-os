import { NextResponse, type NextRequest } from "next/server";
import { createItem, listItems } from "@/lib/tg/repo";
import { MODULES, type Module } from "@/lib/model/item";

function isModule(value: string | null): value is Module {
  return !!value && (MODULES as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const moduleParam = searchParams.get("module");
  const includeArchived = searchParams.get("includeArchived") === "true";

  const items = await listItems({
    module: isModule(moduleParam) ? moduleParam : undefined,
    includeArchived,
  });
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || !isModule(body.module)) {
    return NextResponse.json({ error: "valid module is required" }, { status: 400 });
  }
  if (typeof body.title !== "string" && typeof body.body !== "string") {
    return NextResponse.json({ error: "title or body is required" }, { status: 400 });
  }

  const item = await createItem({
    module: body.module,
    title: typeof body.title === "string" ? body.title : "",
    body: typeof body.body === "string" ? body.body : "",
    tags: Array.isArray(body.tags) ? body.tags : undefined,
    status: typeof body.status === "string" ? body.status : undefined,
    dueAt: typeof body.dueAt === "string" ? body.dueAt : undefined,
    remindAt: typeof body.remindAt === "string" ? body.remindAt : undefined,
    date: typeof body.date === "string" ? body.date : undefined,
    fields: body.fields && typeof body.fields === "object" ? body.fields : undefined,
  });
  return NextResponse.json({ item }, { status: 201 });
}
