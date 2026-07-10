import { Wordmark } from "@/components/brand/wordmark";

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <Wordmark className="text-4xl" />
      <p className="text-muted">Нет соединения. Открой MÄR ещё раз, когда будешь онлайн.</p>
    </main>
  );
}
