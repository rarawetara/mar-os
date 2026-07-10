"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { moduleMeta, type Item } from "@/lib/model/item";

export function SearchView() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const trimmed = value.trim();
    if (!trimmed) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setLoading(false);
    }, 300);
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-6">
      <h1 className="font-display font-extrabold text-2xl tracking-wide">🔍 Поиск</h1>
      <Input placeholder="Искать по всем модулям…" value={query} onChange={onChange} autoFocus />

      {loading && <p className="text-sm text-muted">Ищу…</p>}
      {!loading && query.trim() && items.length === 0 && (
        <p className="text-sm text-muted">Ничего не нашлось.</p>
      )}

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const meta = moduleMeta(item.module);
          return (
            <li key={`${item.module}-${item.id}`}>
              <Card>
                <CardContent className="flex flex-col gap-1 py-4">
                  <Badge variant="pink">
                    {meta.emoji} {meta.label}
                  </Badge>
                  {item.title && <p className="font-medium">{item.title}</p>}
                  {item.body && <p className="whitespace-pre-wrap text-sm text-muted">{item.body}</p>}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
