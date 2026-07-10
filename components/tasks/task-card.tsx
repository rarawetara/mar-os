"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskForm } from "./task-form";
import type { ChecklistItem, Item, TaskPriority } from "@/lib/model/item";

const STATUS_CYCLE: Record<string, string> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};

const STATUS_LABEL: Record<string, string> = {
  todo: "к делу",
  doing: "в процессе",
  done: "готово",
};

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
};

export function TaskCard({ task }: { task: Item }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const status = task.status ?? "todo";
  const priority = (task.fields?.priority as TaskPriority) ?? "medium";
  const checklist = (task.fields?.checklist as ChecklistItem[]) ?? [];

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/items/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    router.refresh();
  }

  function cycleStatus() {
    patch({ status: STATUS_CYCLE[status] ?? "todo" });
  }

  function toggleChecklistItem(index: number) {
    const next = checklist.map((c, i) => (i === index ? { ...c, done: !c.done } : c));
    patch({ fields: { ...task.fields, checklist: next } });
  }

  function archive() {
    patch({ archive: true });
  }

  return (
    <Card className={status === "done" ? "opacity-60" : undefined}>
      <CardContent className="flex flex-col gap-2 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className={`font-medium ${status === "done" ? "line-through" : ""}`}>{task.title}</p>
            {task.body && <p className="whitespace-pre-wrap text-sm text-muted">{task.body}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <TaskForm task={task} trigger={
              <Button variant="ghost" size="icon" aria-label="Редактировать">
                <Pencil className="h-4 w-4" />
              </Button>
            } />
            <Button variant="ghost" size="icon" onClick={archive} disabled={busy} aria-label="В архив">
              <Archive className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={cycleStatus} disabled={busy}>
            <Badge variant={status === "done" ? "pink" : "outline"}>{STATUS_LABEL[status] ?? status}</Badge>
          </button>
          <Badge variant="default">приоритет: {PRIORITY_LABEL[priority]}</Badge>
          {task.dueAt && (
            <Badge variant="default">до {new Date(task.dueAt).toLocaleDateString("ru-RU")}</Badge>
          )}
        </div>

        {checklist.length > 0 && (
          <ul className="flex flex-col gap-1.5 pt-1">
            {checklist.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <Checkbox checked={c.done} onCheckedChange={() => toggleChecklistItem(i)} />
                <span className={`text-sm ${c.done ? "text-muted line-through" : ""}`}>{c.text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
