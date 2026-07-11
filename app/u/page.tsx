"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Profile } from "@/lib/github";
import type { Rating } from "@/lib/score";
import type { ScoutReport as Report } from "@/lib/report";
import { PlayerCard } from "@/components/PlayerCard";
import { ScoutReport } from "@/components/ScoutReport";
import { CardActions } from "@/components/CardActions";
import { Confetti } from "@/components/Confetti";
import { Wordmark } from "@/components/Wordmark";

type ScoutData = { profile: Profile; rating: Rating; report: Report };

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

function Loading({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="animate-pulse text-5xl">⚽</div>
      <p className="text-ink-soft">Scouting @{username}…</p>
    </div>
  );
}

function CardView() {
  const params = useSearchParams();
  const username = params.get("username") ?? "";
  const [data, setData] = useState<ScoutData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setError("No username provided.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`/api/card/${encodeURIComponent(username)}`)
      .then(async (res) => {
        const body = (await res.json()) as ScoutData & { error?: string };
        if (!res.ok) throw new Error(body.error || "Something went wrong scouting this profile.");
        return body;
      })
      .then((body) => {
        if (!cancelled) {
          setData(body);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError((e as Error).message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const content = loading ? (
    <Loading username={username} />
  ) : data ? (
    <div className="animate-rise flex flex-col items-center gap-7">
      <Confetti active={data.rating.overall >= 82} />
      <div className="animate-walkout" style={{ width: "clamp(288px, min(92vw, 58vh), 432px)" }}>
        <PlayerCard profile={data.profile} rating={data.rating} />
      </div>
      <CardActions login={data.profile.login} overall={data.rating.overall} tier={data.rating.tier} />
      {data.profile.bio && (
        <p className="max-w-sm text-center text-[13.5px] leading-relaxed text-ink-soft">
          {data.profile.bio}
        </p>
      )}
      <ScoutReport report={data.report} tier={data.rating.tier} depth={data.rating.depth} />
      <a
        href={`https://github.com/${data.profile.login}`}
        target="_blank"
        rel="noopener"
        className="text-[13px] text-muted underline-offset-2 hover:text-ink-soft hover:underline"
      >
        View @{data.profile.login} on GitHub ↗
      </a>
    </div>
  ) : (
    <ErrorState username={username} message={error ?? "Something went wrong."} />
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

export default function CardPage() {
  return (
    <Suspense>
      <CardView />
    </Suspense>
  );
}
