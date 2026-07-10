"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Item } from "@/lib/model/item";

export function ItemCard({ item, right }: { item: Item; right?: ReactNode }) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);

  async function archive() {
    setArchiving(true);
    await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive: true }),
    });
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          {item.title && <p className="font-medium">{item.title}</p>}
          {item.body && <p className="whitespace-pre-wrap text-sm text-muted">{item.body}</p>}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="pink">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {right}
          <Button
            variant="ghost"
            size="icon"
            onClick={archive}
            disabled={archiving}
            aria-label="В архив"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
