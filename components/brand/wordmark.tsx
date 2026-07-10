import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-wordmark text-pink tracking-wide select-none",
        className
      )}
    >
      MÄR
    </span>
  );
}
