import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <Wordmark size={30} />
      <div className="text-6xl">🥅</div>
      <h1 className="text-2xl font-bold">Off the pitch</h1>
      <p className="max-w-sm text-ink-soft">This page doesn&apos;t exist. Scout a GitHub profile instead.</p>
      <Link
        href="/"
        className="rounded-xl bg-mint px-5 py-2.5 text-[14px] font-bold text-[#04160e] hover:brightness-110"
      >
        Go scout
      </Link>
    </main>
  );
}
