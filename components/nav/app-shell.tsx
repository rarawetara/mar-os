"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Inbox, ListChecks, AlarmClock, Search, LogOut } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/inbox", label: "Инбокс", icon: Inbox },
  { href: "/tasks", label: "Задачи", icon: ListChecks },
  { href: "/reminders", label: "Напоминания", icon: AlarmClock },
  { href: "/search", label: "Поиск", icon: Search },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
        <Wordmark className="text-2xl" />
        <button onClick={logout} className="text-muted transition-colors hover:text-ink" aria-label="Выйти">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-ink/10 bg-paper/95 py-2 backdrop-blur">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs transition-colors",
                active ? "text-pink" : "text-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
