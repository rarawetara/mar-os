import { listItems } from "@/lib/tg/repo";
import { ReminderForm } from "@/components/reminders/reminder-form";
import { ReminderCard } from "@/components/reminders/reminder-card";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const reminders = await listItems({ module: "reminder" });
  reminders.sort((a, b) => (a.remindAt ?? "").localeCompare(b.remindAt ?? ""));

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-5">
        <h1 className="font-display font-extrabold text-2xl tracking-wide">⏰ Напоминания</h1>
        <ReminderForm />
      </div>

      {reminders.length === 0 ? (
        <p className="px-5 text-sm text-muted">Пока нет напоминаний.</p>
      ) : (
        <ul className="flex flex-col gap-3 px-5">
          {reminders.map((reminder) => (
            <li key={reminder.id}>
              <ReminderCard reminder={reminder} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
