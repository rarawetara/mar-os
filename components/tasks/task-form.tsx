"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ChecklistItem, Item, TaskPriority } from "@/lib/model/item";

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Высокий" },
];

function toDateInputValue(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function TaskForm({ task, trigger }: { task?: Item; trigger?: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task?.title ?? "");
  const [body, setBody] = useState(task?.body ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    (task?.fields?.priority as TaskPriority) ?? "medium"
  );
  const [dueAt, setDueAt] = useState(toDateInputValue(task?.dueAt));
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    (task?.fields?.checklist as ChecklistItem[]) ?? []
  );
  const [newChecklistText, setNewChecklistText] = useState("");
  const [saving, setSaving] = useState(false);

  function addChecklistItem() {
    const text = newChecklistText.trim();
    if (!text) return;
    setChecklist((prev) => [...prev, { text, done: false }]);
    setNewChecklistText("");
  }

  function removeChecklistItem(index: number) {
    setChecklist((prev) => prev.filter((_, i) => i !== index));
  }

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);

    const payload = {
      module: "task" as const,
      title: title.trim(),
      body: body.trim(),
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      status: task?.status ?? "todo",
      fields: { priority, checklist },
    };

    if (task) {
      await fetch(`/api/items/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setOpen(false);
    if (!task) {
      setTitle("");
      setBody("");
      setChecklist([]);
      setDueAt("");
      setPriority("medium");
    }
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Новая задача
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Редактировать задачу" : "Новая задача"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            placeholder="Что сделать?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            placeholder="Детали (необязательно)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted">Приоритет</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="h-10 rounded-2xl border border-ink/15 bg-white px-3 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted">Дедлайн</label>
              <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted">Чек-лист</label>
            {checklist.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm">{c.text}</span>
                <button
                  type="button"
                  onClick={() => removeChecklistItem(i)}
                  className="text-muted hover:text-ink"
                  aria-label="Удалить пункт"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Новый пункт"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addChecklistItem();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addChecklistItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button variant="primary" onClick={submit} disabled={saving || !title.trim()}>
            {saving ? "Сохраняю…" : "Сохранить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
