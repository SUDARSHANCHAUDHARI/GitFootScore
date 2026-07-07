// Best-effort country from a free-text GitHub "location" string. No asset files:
// we resolve to an ISO-3166 alpha-2 code and derive the flag emoji from it. A
// pragmatic dictionary of countries + common cities covers the bulk of real
// locations; anything unrecognised returns null and the card simply omits it.

export interface Country {
  code: string; // ISO alpha-2, uppercase
  flag: string; // emoji
}

// name / city (lowercase) → ISO code
const LOOKUP: Record<string, string> = {
  // countries
  "united states": "US", usa: "US", "u.s.": "US", america: "US",
  "united kingdom": "GB", uk: "GB", england: "GB", scotland: "GB", wales: "GB", britain: "GB",
  canada: "CA", australia: "AU", "new zealand": "NZ",
  germany: "DE", deutschland: "DE", france: "FR", spain: "ES", españa: "ES",
  italy: "IT", italia: "IT", portugal: "PT", netherlands: "NL", holland: "NL",
  belgium: "BE", switzerland: "CH", austria: "AT", sweden: "SE", norway: "NO",
  denmark: "DK", finland: "FI", ireland: "IE", poland: "PL", ukraine: "UA",
  russia: "RU", "czech republic": "CZ", czechia: "CZ", greece: "GR", romania: "RO",
  hungary: "HU", turkey: "TR", türkiye: "TR",
  india: "IN", china: "CN", japan: "JP", "south korea": "KR", korea: "KR",
  singapore: "SG", indonesia: "ID", malaysia: "MY", thailand: "TH", vietnam: "VN",
  philippines: "PH", pakistan: "PK", bangladesh: "BD", "sri lanka": "LK",
  israel: "IL", "united arab emirates": "AE", uae: "AE", "saudi arabia": "SA",
  brazil: "BR", brasil: "BR", argentina: "AR", mexico: "MX", méxico: "MX",
  chile: "CL", colombia: "CO", peru: "PE", "south africa": "ZA", nigeria: "NG",
  kenya: "KE", egypt: "EG", morocco: "MA", ghana: "GH",
  // cities → country
  "san francisco": "US", "new york": "US", nyc: "US", seattle: "US", "los angeles": "US",
  boston: "US", austin: "US", chicago: "US", "silicon valley": "US",
  london: "GB", manchester: "GB", berlin: "DE", munich: "DE", münchen: "DE",
  paris: "FR", madrid: "ES", barcelona: "ES", amsterdam: "NL", zurich: "CH",
  stockholm: "SE", copenhagen: "DK", dublin: "IE", warsaw: "PL", kyiv: "UA", kiev: "UA",
  moscow: "RU", bangalore: "IN", bengaluru: "IN", mumbai: "IN", delhi: "IN",
  beijing: "CN", shanghai: "CN", shenzhen: "CN", tokyo: "JP", seoul: "KR",
  bangkok: "TH", jakarta: "ID", "kuala lumpur": "MY", "são paulo": "BR", "sao paulo": "BR",
  toronto: "CA", vancouver: "CA", sydney: "AU", melbourne: "AU", dubai: "AE",
};

const flagOf = (code: string) =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

export function countryFromLocation(location: string | null): Country | null {
  if (!location) return null;
  const lc = location.toLowerCase();
  // Longest keys first so "new zealand" wins over "new york"→"new".
  for (const key of Object.keys(LOOKUP).sort((a, b) => b.length - a.length)) {
    if (lc.includes(key)) {
      const code = LOOKUP[key];
      return { code, flag: flagOf(code) };
    }
  }
  return null;
}
