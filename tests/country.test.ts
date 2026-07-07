import { describe, expect, it } from "vitest";
import { countryFromLocation } from "@/lib/country";

describe("countryFromLocation()", () => {
  it("returns null for empty/unknown locations", () => {
    expect(countryFromLocation(null)).toBeNull();
    expect(countryFromLocation("")).toBeNull();
    expect(countryFromLocation("The Moon")).toBeNull();
  });

  it("resolves a country name to its code + flag", () => {
    const c = countryFromLocation("Norway");
    expect(c?.code).toBe("NO");
    expect(c?.flag).toBe("🇳🇴");
  });

  it("resolves a city to its country", () => {
    expect(countryFromLocation("Bangkok, Thailand")?.code).toBe("TH");
    expect(countryFromLocation("San Francisco, CA")?.code).toBe("US");
  });

  it("prefers the longer match so 'New Zealand' isn't read as 'New York'", () => {
    expect(countryFromLocation("Auckland, New Zealand")?.code).toBe("NZ");
  });

  it("is case-insensitive", () => {
    expect(countryFromLocation("LONDON")?.code).toBe("GB");
  });
});
