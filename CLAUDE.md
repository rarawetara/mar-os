@AGENTS.md

# CLAUDE.md — MÄR

Личный «second brain» / life-OS Марты. Сестра SHIKA OS, но про личное, а не про студию.
Контекст читается из файлов репо (этот файл + `MAR.Plan.md`), не из истории чата.

---

## Что это

PWA-приложение, где хранится вся личная жизнь в одном месте: заметки, дела, напоминания,
идеи, мысли, дневник, подписки, вишлисты, документы, пароли. Данные лежат в **Telegram**
(приватный канал = БД). Цель № 1 — **перестать терять**: быстрый захват, ничего не
удаляется, авто-бэкап и синк через Telegram, глобальный поиск.

## Стек

- **Frontend:** Next.js (App Router), TypeScript, Tailwind + shadcn/ui, Framer Motion, `next-pwa`
- **Backend:** Next.js API routes
- **Хранилище:** Telegram MTProto через **GramJS** (`telegram` npm), init из `TELEGRAM_SESSION`
- **Планировщик:** GitHub Actions cron (каждые ~10–15 мин) → `/api/cron/reminders`
- **Пуш:** отдельный Telegram-бот (Bot API), только шлёт напоминания
- **Хостинг:** Vercel (free). Supabase НЕ используется (нет проблемы с паузой)

## Модель данных (единая)

Приватный Telegram-канал = БД. **1 запись = 1 сообщение** с JSON-payload.

```ts
type Item = {
  id: number            // message_id, стабильный
  module: Module        // 'inbox'|'task'|'reminder'|'idea'|'thought'|'diary'
                        // |'subscription'|'wishlist'|'doc'|'vault'|'event'|'note'
  title: string
  body: string
  tags: string[]
  status?: string       // зависит от модуля
  dueAt?: string        // задачи
  remindAt?: string     // напоминания
  date?: string         // дневник / события
  fields?: Record<string, unknown>  // cost, period, url, price, expiry, encBlob...
  media?: string        // file_id (документы/фото)
  enc?: boolean         // fields/body зашифрованы (сейф, опц. дневник)
  createdAt: string
  updatedAt: string
  archived: boolean
}
```

- **create** = отправить сообщение · **update** = edit сообщения · **delete** = `archived: true` (НИКОГДА не real-delete) · **search** = MTProto `messages.search` + фильтр на клиенте · **фото** = сообщение с media, хранить `file_id`.
- Один модуль-реестр (`lib/model/item.ts`) описывает поля/статусы/иконку/цвет каждого модуля. Новый раздел = запись в реестре + вью, не новая инфраструктура.

## Безопасность (обязательно)

1. **Сейф (`vault`) шифруется на клиенте** — AES-GCM, ключ из мастер-пароля через PBKDF2 (Web Crypto). На сервер/в Telegram уходит только шифротекст. Мастер-пароль не хранится и не передаётся.
2. `TELEGRAM_SESSION` = полный доступ к аккаунту → только env, никогда в репо/фронт/логи.
3. Рекомендуется отдельный Telegram-аккаунт под БД.
4. Все API-routes за общим секретом / cookie-сессией (единственный пользователь — Марта).
5. Основные банковские пароли — совет использовать выделенный менеджер; сейф для карт/IBAN/вторичного.

## Env

```
TELEGRAM_API_ID=
TELEGRAM_API_HASH=
TELEGRAM_SESSION=        # StringSession, только тут
DB_CHANNEL_ID=           # приватный канал-БД
NOTIFY_BOT_TOKEN=        # бот для пушей
NOTIFY_CHAT_ID=          # chat_id Марты — куда бот шлёт напоминания (см. BL-11)
APP_PASSWORD=            # гейт приложения
CRON_SECRET=             # защита /api/cron/*
VAULT_SALT=              # соль для PBKDF2
```

## Конвенции

- **Git:** Claude Code делает сам — init/branch/add/commit/push/pull, без запроса команд у Марты. Merge в `main` — всегда Марта, руками, после ревью диффа. Это её единственный ручной git-шаг. (Отличается от SHIKA OS, где гит целиком на Марте — не путать конвенции между проектами.) PR = новый чат в папке проекта.
- **Upsert / never-delete:** хранить строку, тоглить `archived`, историю не терять. `updatedAt` проставлять явно на каждом update.
- **Бэклог:** любую непроблемную находку / edge-case / техдолг → сразу оформлять пунктом `BL-…` в `MAR.Plan.md`, не «упомянуть в чате».
- **Ритуал сессии:** «смена начата» → статус (где мы / что сделано / что дальше). «смена закончена» → рекап (дата + что сделано) + план.
- **Doc hygiene (обязательно):** перед концом сессии — (1) задача Cowork что закоммитить, (2) задача себе что обновить в canon-файлах, (3) подтвердить, что решения отражены в доках, а не только в чате.

## Стиль

Розовый magenta + чёрный. Заголовки — жирный чёрный (Anton/Archivo Black), акценты-секции — розовый рукописный (Caveat), логотип MÄR — округлый (Baloo 2/Fredoka), контент — Inter/Geist. Чистая логичная структура важнее полировки. Рукопись — только акцент, не для контента.

```
--pink #EC4899 · --ink #0A0A0A · --paper #FAFAF7 · --muted #6B7280
```
