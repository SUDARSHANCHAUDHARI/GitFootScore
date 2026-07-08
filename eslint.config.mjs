import next from "eslint-config-next";

// Next 16 ships eslint-config-next as a flat config array, so we spread it
// directly (no FlatCompat).
const config = [
  ...next,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
];

export default config;
