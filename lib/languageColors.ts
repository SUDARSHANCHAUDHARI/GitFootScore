// GitHub's language accent colours (the dot next to a repo's language). Covers
// the common languages; anything else falls back to a neutral grey.
const COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Lua: "#000080",
  Zig: "#ec915c",
  R: "#198CE7",
  Julia: "#a270ba",
  "Objective-C": "#438eff",
  Perl: "#0298c3",
  Clojure: "#db5855",
  Assembly: "#6E4C13",
};

export function languageColor(lang: string | null): string {
  return (lang && COLORS[lang]) || "#8b97b8";
}
