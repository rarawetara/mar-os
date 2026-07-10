import {
  Inbox,
  ListChecks,
  AlarmClock,
  Lightbulb,
  Sparkles,
  BookHeart,
  CreditCard,
  Gift,
  FileText,
  Lock,
  CalendarDays,
  StickyNote,
  type LucideIcon,
} from "lucide-react";

export const MODULES = [
  "inbox",
  "task",
  "reminder",
  "idea",
  "thought",
  "diary",
  "subscription",
  "wishlist",
  "doc",
  "vault",
  "event",
  "note",
] as const;

export type Module = (typeof MODULES)[number];

// Единая модель записи. 1 запись = 1 сообщение в Telegram-канале (id = message_id).
export type Item = {
  id: number;
  module: Module;
  title: string;
  body: string;
  tags: string[];
  status?: string;
  dueAt?: string;
  remindAt?: string;
  date?: string;
  fields?: Record<string, unknown>;
  media?: string;
  enc?: boolean;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

// Поля, которые заполняет вызывающий код; остальное (id/createdAt/updatedAt/archived) — репозиторий.
export type NewItem = Pick<Item, "module" | "title" | "body"> &
  Partial<Pick<Item, "tags" | "status" | "dueAt" | "remindAt" | "date" | "fields" | "media" | "enc">>;

export type ModuleMeta = {
  key: Module;
  label: string;
  emoji: string;
  icon: LucideIcon;
  color: string; // tailwind text/bg color token, e.g. "pink"
  statuses?: string[];
  fields?: string[]; // известные ключи fields для этого модуля
  implemented: boolean; // есть ли view в текущей версии
};

// Реестр модулей. Новый раздел = новая запись здесь + вью, не новая инфраструктура.
export const MODULE_REGISTRY: Record<Module, ModuleMeta> = {
  inbox: {
    key: "inbox",
    label: "Инбокс",
    emoji: "📥",
    icon: Inbox,
    color: "pink",
    implemented: true,
  },
  task: {
    key: "task",
    label: "Задачи",
    emoji: "✅",
    icon: ListChecks,
    color: "pink",
    statuses: ["todo", "doing", "done"],
    fields: ["priority", "checklist"],
    implemented: true,
  },
  reminder: {
    key: "reminder",
    label: "Напоминания",
    emoji: "⏰",
    icon: AlarmClock,
    color: "pink",
    statuses: ["pending", "sent"],
    implemented: true,
  },
  idea: {
    key: "idea",
    label: "Идеи",
    emoji: "💡",
    icon: Lightbulb,
    color: "amber",
    statuses: ["raw", "in-progress", "done"],
    implemented: false,
  },
  thought: {
    key: "thought",
    label: "Мысли",
    emoji: "💭",
    icon: Sparkles,
    color: "violet",
    implemented: false,
  },
  diary: {
    key: "diary",
    label: "Дневник",
    emoji: "📖",
    icon: BookHeart,
    color: "rose",
    fields: ["mood"],
    implemented: false,
  },
  subscription: {
    key: "subscription",
    label: "Подписки",
    emoji: "💳",
    icon: CreditCard,
    color: "emerald",
    fields: ["cost", "period", "chargeDate"],
    implemented: false,
  },
  wishlist: {
    key: "wishlist",
    label: "Вишлисты",
    emoji: "🎁",
    icon: Gift,
    color: "fuchsia",
    statuses: ["want", "bought"],
    fields: ["price", "url", "collection"],
    implemented: false,
  },
  doc: {
    key: "doc",
    label: "Документы",
    emoji: "📄",
    icon: FileText,
    color: "sky",
    fields: ["expiry"],
    implemented: false,
  },
  vault: {
    key: "vault",
    label: "Сейф",
    emoji: "🔐",
    icon: Lock,
    color: "zinc",
    fields: ["encBlob"],
    implemented: false,
  },
  event: {
    key: "event",
    label: "События",
    emoji: "📅",
    icon: CalendarDays,
    color: "indigo",
    implemented: false,
  },
  note: {
    key: "note",
    label: "Заметки",
    emoji: "📝",
    icon: StickyNote,
    color: "pink",
    implemented: false,
  },
};

export type ChecklistItem = { text: string; done: boolean };
export type TaskPriority = "low" | "medium" | "high";

export function moduleMeta(module: Module): ModuleMeta {
  return MODULE_REGISTRY[module];
}

export function implementedModules(): ModuleMeta[] {
  return MODULES.map((m) => MODULE_REGISTRY[m]).filter((m) => m.implemented);
}
