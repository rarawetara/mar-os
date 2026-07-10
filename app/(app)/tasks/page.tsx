import { listItems } from "@/lib/tg/repo";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskCard } from "@/components/tasks/task-card";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await listItems({ module: "task" });

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-5">
        <h1 className="font-display font-extrabold text-2xl tracking-wide">✅ Задачи</h1>
        <TaskForm />
      </div>

      {tasks.length === 0 ? (
        <p className="px-5 text-sm text-muted">Пока нет задач.</p>
      ) : (
        <ul className="flex flex-col gap-3 px-5">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
