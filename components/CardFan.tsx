import Link from "next/link";
import { SAMPLE_CARDS } from "@/lib/samples";
import { PlayerCard } from "./PlayerCard";

// Home hero fan — three sample cards splayed out, each linking to its scout page.
// Static (precomputed), so it costs no GitHub calls on the landing page.
const LAYOUT = [
  { rotate: -14, x: -128, y: 20, z: 1 },
  { rotate: 0, x: 0, y: 0, z: 3 },
  { rotate: 14, x: 128, y: 20, z: 1 },
];

export function CardFan() {
  return (
    <div className="relative h-[300px] w-full max-w-md">
      {SAMPLE_CARDS.map(({ profile, rating }, i) => {
        const l = LAYOUT[i];
        return (
          <Link
            key={profile.login}
            href={`/u/${profile.login}`}
            className="group absolute left-1/2 top-0 w-[180px] transition-transform duration-300 hover:z-10 hover:-translate-y-2"
            style={{
              transform: `translateX(-50%) translateX(${l.x}px) translateY(${l.y}px) rotate(${l.rotate}deg)`,
              zIndex: l.z,
            }}
          >
            <PlayerCard profile={profile} rating={rating} />
          </Link>
        );
      })}
    </div>
  );
}
