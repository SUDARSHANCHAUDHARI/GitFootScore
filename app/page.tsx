import Link from "next/link";
import { ScoutForm } from "@/components/ScoutForm";
import { CardFan } from "@/components/CardFan";
import { Wordmark } from "@/components/Wordmark";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: "Turn any GitHub profile into a football-style player card, rated out of 99.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const EXAMPLES = ["torvalds", "gaearon", "sindresorhus"];

const STEPS = [
  { n: "1", t: "Enter a username", d: "Any public GitHub handle — yours or anyone's." },
  { n: "2", t: "We scout the stats", d: "Stars, forks, languages, activity and contributions." },
  { n: "3", t: "Get your card", d: "Six attributes, an overall, a position and a tier." },
];

const ATTRS = [
  ["ATT", "Attack", "reach & impact from stars"],
  ["CRE", "Creation", "forks, followers & pull requests"],
  ["PAC", "Pace", "how active, how recently"],
  ["TEC", "Technique", "breadth of languages"],
  ["DEF", "Defense", "reviews, issues & longevity"],
  ["PHY", "Physical", "raw output volume"],
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col items-center px-6 pb-20 pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <header className="flex w-full items-center justify-between">
        <Wordmark size={30} />
        <a
          href="https://github.com/SUDARSHANCHAUDHARI/GitFootScore"
          target="_blank"
          rel="noopener"
          className="text-[13px] font-medium text-ink-soft transition hover:text-ink"
        >
          GitHub ↗
        </a>
      </header>

      {/* hero */}
      <section className="animate-rise flex flex-col items-center pt-10 text-center">
        <span className="mb-5 rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-semibold text-ink-soft">
          ⚽ GitHub, rated out of 99
        </span>
        <h1 className="text-balance text-4xl font-black tracking-tight sm:text-6xl">
          Rate your <span className="text-mint">GitHub</span> game.
        </h1>
        <p className="mt-4 max-w-lg text-pretty text-[16px] leading-relaxed text-ink-soft">
          Every profile is a player. We scout six attributes from live GitHub data and print your
          football-style card — overall, position and tier included.
        </p>

        <div className="mt-8 w-full max-w-md">
          <ScoutForm autoFocus />
          <div className="mt-3 text-[13px] text-muted">
            try{" "}
            {EXAMPLES.map((u, i) => (
              <span key={u}>
                {i > 0 && " · "}
                <Link href={`/u?username=${u}`} className="text-ink-soft underline-offset-2 hover:underline">
                  {u}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* sample fan */}
      <section className="mt-14 flex w-full justify-center">
        <CardFan />
      </section>

      {/* how it works */}
      <section className="mt-20 w-full max-w-2xl">
        <h2 className="text-center text-[13px] font-bold uppercase tracking-widest text-muted">
          How it works
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-surface/60 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint/15 text-[15px] font-bold text-mint">
                {s.n}
              </div>
              <div className="mt-3 text-[15px] font-bold text-ink">{s.t}</div>
              <div className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* attributes */}
      <section className="mt-14 w-full max-w-2xl">
        <h2 className="text-center text-[13px] font-bold uppercase tracking-widest text-muted">
          The six attributes
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {ATTRS.map(([k, name, desc]) => (
            <div key={k} className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 px-4 py-3">
              <span className="w-11 text-[15px] font-black tracking-wide text-mint">{k}</span>
              <span className="text-[14px] font-semibold text-ink">{name}</span>
              <span className="text-[12.5px] text-muted">— {desc}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 text-[12.5px] text-muted">
        Built by SudarshanTechLabs · public GitHub data only
      </footer>
    </main>
  );
}
