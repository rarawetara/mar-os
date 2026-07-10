import { Wordmark } from "@/components/brand/wordmark";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <Wordmark className="text-5xl" />
      <LoginForm next={next} />
    </main>
  );
}
