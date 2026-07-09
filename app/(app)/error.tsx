"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display font-extrabold text-xl tracking-wide">Не достучались до Telegram</p>
      <p className="max-w-xs text-sm text-muted">
        Проверь <code className="text-ink">TELEGRAM_SESSION</code> /{" "}
        <code className="text-ink">DB_CHANNEL_ID</code> в env или попробуй ещё раз.
      </p>
      <Button variant="primary" onClick={reset}>
        Повторить
      </Button>
    </div>
  );
}
