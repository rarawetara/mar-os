import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

// Переиспользуем один клиент между вызовами (и между hot-reload в dev) —
// GramJS-соединение не бесплатное, поднимать его на каждый запрос нельзя.
declare global {
  var __marTgClient: TelegramClient | undefined;
  var __marTgConnecting: Promise<TelegramClient> | undefined;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function connect(): Promise<TelegramClient> {
  const apiId = Number(requireEnv("TELEGRAM_API_ID"));
  const apiHash = requireEnv("TELEGRAM_API_HASH");
  const session = new StringSession(requireEnv("TELEGRAM_SESSION"));

  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  return client;
}

export async function getTgClient(): Promise<TelegramClient> {
  if (globalThis.__marTgClient?.connected) {
    return globalThis.__marTgClient;
  }
  if (!globalThis.__marTgConnecting) {
    globalThis.__marTgConnecting = connect().then((client) => {
      globalThis.__marTgClient = client;
      return client;
    });
  }
  return globalThis.__marTgConnecting;
}

export function requireDbChannelId(): string {
  return requireEnv("DB_CHANNEL_ID");
}
