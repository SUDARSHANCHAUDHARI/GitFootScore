// GitFootScore mark — our own logo. A pitch-hex badge holding a ball made of a
// rising bar trio (git activity → score). No borrowed art.
export function Logo({ size = 32 }: { size?: number }) {
  const id = "gfs-grad";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#29e5a8" />
          <stop offset="1" stopColor="#7c7bff" />
        </linearGradient>
      </defs>
      <path
        d="M24 2.5 42.5 13v22L24 45.5 5.5 35V13L24 2.5Z"
        fill="#0c1122"
        stroke={`url(#${id})`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* rising score bars */}
      <rect x="16" y="27" width="4.2" height="8" rx="1.4" fill="#29e5a8" />
      <rect x="22" y="22" width="4.2" height="13" rx="1.4" fill="#5ad9c0" />
      <rect x="28" y="16" width="4.2" height="19" rx="1.4" fill="#7c7bff" />
    </svg>
  );
}

export function Wordmark({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
      <Logo size={size} />
      <span style={{ fontSize: size * 0.62 }}>
        <span className="text-mint">Git</span>
        <span className="text-ink">Foot</span>
        <span className="text-violet">Score</span>
      </span>
    </span>
  );
}
