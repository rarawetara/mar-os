# MÄR

Личный «second brain» / life-OS. Данные лежат в приватном Telegram-канале (GramJS/MTProto),
одна запись — одно сообщение с JSON. Канон проекта — `CLAUDE.md` и `MAR.Plan.md`.

## Setup

```bash
npm install
cp .env.example .env.local   # заполнить все переменные
npm run login                # разово: печатает TELEGRAM_SESSION → вставить в .env.local
npm run dev
```

Env-переменные — см. `.env.example`. `TELEGRAM_SESSION` даёт полный доступ к аккаунту —
только в env, никогда в репо/логи.

## Деплой (Vercel)

1. Залить все переменные из `.env.example` в Vercel → Project Settings → Environment Variables.
2. В GitHub repo secrets добавить `APP_URL` (продовый URL деплоя) и `CRON_SECRET` — их использует
   `.github/workflows/reminders.yml`, который каждые ~10 минут дёргает `/api/cron/reminders`.

## Стек

Next.js (App Router, TS) · Tailwind v4 · Framer Motion · GramJS · next-pwa alternative
(native `app/manifest.ts` + hand-rolled `public/sw.js`, см. `MAR.Plan.md` BL-12).
