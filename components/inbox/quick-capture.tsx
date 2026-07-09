"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function QuickCapture() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const value = text.trim();
    if (!value) return;

    setLoading(true);
    const [firstLine, ...rest] = value.split("\n");
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        module: "inbox",
        title: firstLine.slice(0, 120),
        body: rest.join("\n").trim(),
      }),
    });
    setText("");
    setLoading(false);
    router.refresh();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col gap-2 px-5">
      <Textarea
        placeholder="Кинь сюда мысль, ссылку, что угодно… (⌘+Enter — сохранить)"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <Button
        variant="primary"
        onClick={submit}
        disabled={loading || !text.trim()}
        className="self-end"
      >
        {loading ? "Сохраняю…" : "Захватить"}
      </Button>
    </div>
  );
}
