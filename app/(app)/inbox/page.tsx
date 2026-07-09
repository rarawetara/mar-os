import { listItems } from "@/lib/tg/repo";
import { QuickCapture } from "@/components/inbox/quick-capture";
import { ItemList } from "@/components/items/item-list";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const items = await listItems({ module: "inbox" });

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="px-5 font-display font-extrabold text-2xl tracking-wide">📥 Инбокс</h1>
      <QuickCapture />
      <ItemList items={items} emptyLabel="Пока пусто — кинь сюда мысль." />
    </div>
  );
}
