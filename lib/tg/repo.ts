import type { TelegramClient } from "telegram";
import type { Api } from "telegram";
import type { EntityLike } from "telegram/define";
import { getTgClient, requireDbChannelId } from "./client";
import type { Item, Module, NewItem } from "@/lib/model/item";

declare global {
  var __marChannelEntity: EntityLike | undefined;
}

// Резолвим entity канала-БД один раз и кэшируем: getEntity по голому ID падает,
// если GramJS ещё не видел этот peer (нет access_hash) — тогда идём через диалоги.
async function resolveChannel(client: TelegramClient): Promise<EntityLike> {
  if (globalThis.__marChannelEntity) return globalThis.__marChannelEntity;

  const raw = requireDbChannelId();
  try {
    const entity = await client.getEntity(raw);
    globalThis.__marChannelEntity = entity;
    return entity;
  } catch {
    for await (const dialog of client.iterDialogs({})) {
      if (dialog.id?.toString() === raw) {
        globalThis.__marChannelEntity = dialog.entity as EntityLike;
        return dialog.entity as EntityLike;
      }
    }
    throw new Error(
      `Cannot resolve DB_CHANNEL_ID=${raw}: not found in account dialogs. Make sure the account behind TELEGRAM_SESSION is a member of the channel.`
    );
  }
}

function serialize(record: Omit<Item, "id">): string {
  const json = JSON.stringify(record);
  if (Buffer.byteLength(json, "utf8") > 4000) {
    throw new Error("Item payload too large for a single Telegram message (v1 limitation)");
  }
  return json;
}

function parse(message: Api.Message): Item | null {
  if (!message?.message) return null;
  try {
    const data = JSON.parse(message.message);
    if (!data || typeof data !== "object" || !data.module) return null;
    return { ...data, id: message.id } as Item;
  } catch {
    return null; // не наша запись — например, ручное сообщение в канале
  }
}

export type ListOptions = {
  module?: Module;
  includeArchived?: boolean;
  limit?: number;
};

export async function createItem(input: NewItem): Promise<Item> {
  const now = new Date().toISOString();
  const record: Omit<Item, "id"> = {
    module: input.module,
    title: input.title,
    body: input.body,
    tags: input.tags ?? [],
    status: input.status,
    dueAt: input.dueAt,
    remindAt: input.remindAt,
    date: input.date,
    fields: input.fields,
    media: input.media,
    enc: input.enc,
    createdAt: now,
    updatedAt: now,
    archived: false,
  };

  const client = await getTgClient();
  const channel = await resolveChannel(client);
  const sent = await client.sendMessage(channel, { message: serialize(record) });
  return { ...record, id: sent.id };
}

export async function getItem(id: number): Promise<Item | null> {
  const client = await getTgClient();
  const channel = await resolveChannel(client);
  const messages = await client.getMessages(channel, { ids: [id] });
  const msg = messages[0];
  return msg ? parse(msg) : null;
}

export async function listItems(opts: ListOptions = {}): Promise<Item[]> {
  const client = await getTgClient();
  const channel = await resolveChannel(client);
  const messages = await client.getMessages(channel, { limit: opts.limit ?? 200 });
  const items = messages.map(parse).filter((x): x is Item => x !== null);
  return items
    .filter((it) => !opts.module || it.module === opts.module)
    .filter((it) => opts.includeArchived || !it.archived)
    .sort((a, b) => b.id - a.id);
}

export async function updateItem(id: number, patch: Partial<Omit<Item, "id" | "createdAt">>): Promise<Item> {
  const existing = await getItem(id);
  if (!existing) throw new Error(`Item ${id} not found`);
  const merged: Item = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const client = await getTgClient();
  const channel = await resolveChannel(client);
  await client.editMessage(channel, { message: id, text: serialize(merged) });
  return merged;
}

// Never real-delete: архив — это флаг, история остаётся.
export async function archiveItem(id: number): Promise<Item> {
  return updateItem(id, { archived: true });
}

export async function searchItems(
  query: string,
  opts: { module?: Module; limit?: number } = {}
): Promise<Item[]> {
  const client = await getTgClient();
  const channel = await resolveChannel(client);
  const messages = await client.getMessages(channel, { search: query, limit: opts.limit ?? 100 });
  const items = messages.map(parse).filter((x): x is Item => x !== null);
  return items.filter((it) => !opts.module || it.module === opts.module).filter((it) => !it.archived);
}
