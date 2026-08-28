import { NextResponse, type NextRequest } from "next/server";
import { listItems, updateItem } from "@/lib/tg/repo";
import { requireAuth, isDenied } from "@/lib/auth/guard";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function sendNotification(text: string) {
  const token = requireEnv("NOTIFY_BOT_TOKEN");
  const chatId = requireEnv("NOTIFY_CHAT_ID");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    throw new Error(`Notify bot failed: ${res.status} ${await res.text()}`);
  }
}

async function handleReminders() {
  const reminders = await listItems({ module: "reminder" });
  const now = Date.now();
  const due = reminders.filter(
    (item) => item.status !== "sent" && item.remindAt && new Date(item.remindAt).getTime() <= now
  );

  const sentIds: number[] = [];
  for (const item of due) {
    const text = item.body ? `⏰ ${item.title}\n\n${item.body}` : `⏰ ${item.title}`;
    await sendNotification(text);
    await updateItem(item.id, { status: "sent" });
    sentIds.push(item.id);
  }

  return NextResponse.json({ checked: reminders.length, sent: sentIds });
}

// Эндпоинт за авторизацией, поэтому текст ошибки можно вернуть вызывающему:
// иначе Vercel отдаёт пустой 500 и причину видно только в его логах.
// Печатается только сообщение (например «Missing required env var: NOTIFY_CHAT_ID»),
// значения переменных наружу не идут.
async function guarded(request: NextRequest) {
  const auth = requireAuth(request, ["cron", "session"]);
  if (isDenied(auth)) return auth;

  try {
    return await handleReminders();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("cron/reminders упал:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return guarded(request);
}

export async function POST(request: NextRequest) {
  return guarded(request);
}
