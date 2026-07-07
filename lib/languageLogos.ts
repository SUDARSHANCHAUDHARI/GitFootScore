// Top-language logo URLs (Devicon, served from jsDelivr — colourful SVGs on a
// transparent background). Curated to verified filenames so we never point at a
// 404; anything not listed falls back to the coloured dot (languageColors).
const BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const SLUGS: Record<string, string> = {
  TypeScript: "typescript/typescript-original.svg",
  JavaScript: "javascript/javascript-original.svg",
  Python: "python/python-original.svg",
  Java: "java/java-original.svg",
  Kotlin: "kotlin/kotlin-original.svg",
  Swift: "swift/swift-original.svg",
  "C++": "cplusplus/cplusplus-original.svg",
  C: "c/c-original.svg",
  "C#": "csharp/csharp-original.svg",
  Go: "go/go-original-logo.svg",
  Rust: "rust/rust-original.svg",
  Ruby: "ruby/ruby-original.svg",
  PHP: "php/php-original.svg",
  Dart: "dart/dart-original.svg",
  HTML: "html5/html5-original.svg",
  CSS: "css3/css3-original.svg",
  Shell: "bash/bash-original.svg",
  Vue: "vuejs/vuejs-original.svg",
  Scala: "scala/scala-original.svg",
  Elixir: "elixir/elixir-original.svg",
  Haskell: "haskell/haskell-original.svg",
  Lua: "lua/lua-original.svg",
  R: "r/r-original.svg",
  Julia: "julia/julia-original.svg",
  Clojure: "clojure/clojure-original.svg",
};

export function languageLogo(lang: string | null): string | null {
  return lang && SLUGS[lang] ? `${BASE}/${SLUGS[lang]}` : null;
}
