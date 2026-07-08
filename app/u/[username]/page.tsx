import Link from "next/link";
import type { Metadata } from "next";
import { ScoutError } from "@/lib/github";
import { scout } from "@/lib/scout";
import { PlayerCard } from "@/components/PlayerCard";
import { ScoutReport } from "@/components/ScoutReport";
import { CardActions } from "@/components/CardActions";
import { Confetti } from "@/components/Confetti";
import { Wordmark } from "@/components/Wordmark";

type Params = { username: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;
  try {
    const { profile, rating: r } = await scout(username);
    const title = `${profile.name || profile.login} — ${r.overall} ${r.tier} · GitFootScore`;
    return { title, description: `${r.position}, rated ${r.overall}/99 on GitFootScore.` };
  } catch {
    return { title: `@${username} · GitFootScore` };
  }
}

function ErrorState({ username, message }: { username: string; message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="text-5xl">🧤</div>
      <h1 className="text-2xl font-bold">Couldn&apos;t scout @{username}</h1>
      <p className="max-w-sm text-ink-soft">{message}</p>
      <Link
        href="/"
        className="rounded-xl bg-mint px-5 py-2.5 text-[14px] font-bold text-[#04160e] hover:brightness-110"
      >
        Scout someone else
      </Link>
    </div>
  );
}

export default async function CardPage({ params }: { params: Promise<Params> }) {
  const { username } = await params;

  // Only the throwing scout() call lives in try/catch — JSX is built afterwards,
  // outside it (rendering errors belong to an error boundary, not this catch).
  let result: Awaited<ReturnType<typeof scout>> | null = null;
  let message: string | null = null;
  try {
    result = await scout(username);
  } catch (e) {
    message = e instanceof ScoutError ? e.message : "Something went wrong scouting this profile.";
  }

  const content = result ? (
    <div className="animate-rise flex flex-col items-center gap-7">
      <Confetti active={result.rating.overall >= 82} />
      <div className="animate-walkout" style={{ width: "clamp(288px, min(92vw, 58vh), 432px)" }}>
        <PlayerCard profile={result.profile} rating={result.rating} />
      </div>
      <CardActions login={result.profile.login} overall={result.rating.overall} tier={result.rating.tier} />
      {result.profile.bio && (
        <p className="max-w-sm text-center text-[13.5px] leading-relaxed text-ink-soft">
          {result.profile.bio}
        </p>
      )}
      <ScoutReport report={result.report} tier={result.rating.tier} depth={result.rating.depth} />
      <a
        href={`https://github.com/${result.profile.login}`}
        target="_blank"
        rel="noopener"
        className="text-[13px] text-muted underline-offset-2 hover:text-ink-soft hover:underline"
      >
        View @{result.profile.login} on GitHub ↗
      </a>
    </div>
  ) : (
    <ErrorState username={username} message={message ?? "Something went wrong."} />
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 pb-16 pt-8">
      <header className="mb-10 flex w-full items-center justify-between">
        <Link href="/">
          <Wordmark size={28} />
        </Link>
        <Link href="/" className="text-[13px] font-medium text-ink-soft hover:text-ink">
          ← Scout another
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center">{content}</div>
    </main>
  );
}
