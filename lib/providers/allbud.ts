import * as cheerio from "cheerio";
import { ProviderAdapter } from "@/lib/providers/base";
import { inferType, titleCase } from "@/lib/utils";

function extractNumber(input?: string): number | undefined {
  if (!input) return undefined;
  const match = input.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

export const allBudProvider: ProviderAdapter = {
  name: "AllBud",
  async search(query) {
    try {
      const searchUrl = `https://www.allbud.com/marijuana-strains/search?sort=alphabet&letter=&q=${encodeURIComponent(query)}`;
      const searchRes = await fetch(searchUrl, {
        headers: { "User-Agent": process.env.ALLBUD_USER_AGENT || "Mozilla/5.0" },
        next: { revalidate: 21600 },
      });
      if (!searchRes.ok) return null;

      const searchHtml = await searchRes.text();
      const $search = cheerio.load(searchHtml);
      const firstHref = $search("a[href*='/marijuana-strains/']").first().attr("href");
      const url = firstHref?.startsWith("http")
        ? firstHref
        : firstHref
          ? `https://www.allbud.com${firstHref}`
          : undefined;
      if (!url) return null;

      const pageRes = await fetch(url, {
        headers: { "User-Agent": process.env.ALLBUD_USER_AGENT || "Mozilla/5.0" },
        next: { revalidate: 21600 },
      });
      if (!pageRes.ok) return null;

      const html = await pageRes.text();
      const $ = cheerio.load(html);
      const bodyText = $("body").text();

      const name = $("h1").first().text().trim() || titleCase(query);
      const rating = extractNumber(bodyText.match(/(\d\.\d)\s*out of 5/i)?.[1] || $("[class*='rating']").first().text());
      const reviewCount = extractNumber(bodyText.match(/(\d+[\d,]*)\s+reviews/i)?.[1] || bodyText.match(/(\d+[\d,]*)\s+votes/i)?.[1]);
      const thcMin = extractNumber(bodyText.match(/THC\s*:\s*(\d+(?:\.\d+)?)/i)?.[1]);
      const thcMax = extractNumber(bodyText.match(/THC\s*:\s*\d+(?:\.\d+)?\s*-\s*(\d+(?:\.\d+)?)/i)?.[1]);
      const cbdMin = extractNumber(bodyText.match(/CBD\s*:\s*(\d+(?:\.\d+)?)/i)?.[1]);
      const effects = ["relaxed", "happy", "euphoric", "uplifted", "sleepy", "creative", "focused"].filter((term) =>
        bodyText.toLowerCase().includes(term)
      );
      const sideEffects = ["dry mouth", "dry eyes", "paranoia", "anxiety", "dizzy"].filter((term) =>
        bodyText.toLowerCase().includes(term)
      );

      return {
        provider: "AllBud",
        name,
        url,
        rating,
        reviewCount,
        type: inferType(bodyText.match(/(indica|sativa|hybrid)/i)?.[1]),
        thcMin,
        thcMax,
        cbdMin,
        cbdMax: cbdMin,
        effects,
        sideEffects,
        description: $("meta[name='description']").attr("content")?.trim(),
        confidence: 0.72,
      };
    } catch {
      return null;
    }
  },
};
