import * as cheerio from "cheerio";
import { ProviderAdapter } from "@/lib/providers/base";
import { inferType, slugify, titleCase } from "@/lib/utils";

function parseNumber(input?: string): number | undefined {
  if (!input) return undefined;
  const cleaned = input.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return cleaned ? Number(cleaned[0]) : undefined;
}

function textList($: cheerio.CheerioAPI, selectors: string[]): string[] {
  for (const selector of selectors) {
    const values = $(selector)
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);
    if (values.length) return Array.from(new Set(values));
  }
  return [];
}

export const leaflyProvider: ProviderAdapter = {
  name: "Leafly",
  async search(query) {
    try {
      const slug = slugify(query);
      const url = `https://www.leafly.com/strains/${slug}`;
      const res = await fetch(url, {
        headers: { "User-Agent": process.env.LEAFLY_USER_AGENT || "Mozilla/5.0" },
        next: { revalidate: 21600 },
      });
      if (!res.ok) return null;

      const html = await res.text();
      const $ = cheerio.load(html);
      const bodyText = $("body").text();

      const name = $("h1").first().text().trim() || titleCase(query);
      const rating = parseNumber($("[aria-label*='rating']").first().text() || bodyText.match(/\b\d\.\d\b/)?.[0]);
      const reviewCount = parseNumber(bodyText.match(/([\d,.]+)\s+ratings/i)?.[1]);
      const thc = parseNumber(bodyText.match(/THC\s*(\d+(?:\.\d+)?)/i)?.[1]);
      const cbd = parseNumber(bodyText.match(/CBD\s*(\d+(?:\.\d+)?)/i)?.[1]);
      const typeText = bodyText.match(/(Indica|Sativa|Hybrid)/i)?.[1];

      const effects = textList($, [
        "a[href*='effects'] span",
        "[data-testid='tag-pill'] span",
        "button span"
      ]).slice(0, 8);

      const sideEffects = ["dry mouth", "dry eyes", "anxiety", "paranoia", "dizzy"].filter((term) =>
        bodyText.toLowerCase().includes(term)
      );

      return {
        provider: "Leafly",
        name,
        url,
        rating,
        reviewCount,
        type: inferType(typeText),
        thcMin: thc,
        thcMax: thc,
        cbdMin: cbd,
        cbdMax: cbd,
        effects,
        sideEffects,
        description: $("meta[name='description']").attr("content")?.trim(),
        confidence: 0.75,
      };
    } catch {
      return null;
    }
  },
};
