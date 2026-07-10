"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReminderForm } from "./reminder-form";
import type { Item } from "@/lib/model/item";

export function ReminderCard({ reminder }: { reminder: Item }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function archive() {
    setBusy(true);
    await fetch(`/api/items/${reminder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive: true }),
    });
    setBusy(false);
    router.refresh();
  }

  const sent = reminder.status === "sent";

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 py-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="font-medium">{reminder.title}</p>
          {reminder.body && <p className="whitespace-pre-wrap text-sm text-muted">{reminder.body}</p>}
          <div className="flex flex-wrap items-center gap-1.5">
            {reminder.remindAt && (
              <Badge variant="default">
                {new Date(reminder.remindAt).toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Badge>
            )}
            <Badge variant={sent ? "pink" : "outline"}>{sent ? "отправлено" : "ожидает"}</Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ReminderForm
            reminder={reminder}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Редактировать">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button variant="ghost" size="icon" onClick={archive} disabled={busy} aria-label="В архив">
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
