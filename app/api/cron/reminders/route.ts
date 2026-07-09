import { NextResponse } from "next/server";
import { listItems, updateItem } from "@/lib/tg/repo";

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

export async function GET() {
  return handleReminders();
}

export async function POST() {
  return handleReminders();
}
