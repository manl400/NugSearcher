import { z } from "zod";
import { ProviderAdapter } from "@/lib/providers/base";
import { inferType, titleCase } from "@/lib/utils";

const CannlyticsRow = z.object({
  strain_name: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  thc: z.union([z.number(), z.string()]).optional(),
  cbd: z.union([z.number(), z.string()]).optional(),
  aromas: z.union([z.array(z.string()), z.string()]).optional(),
  effects: z.union([z.array(z.string()), z.string()]).optional(),
  description: z.string().optional(),
});

function listify(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(/,|\||;/).map((x) => x.trim()).filter(Boolean);
  return [];
}

export const cannlyticsProvider: ProviderAdapter = {
  name: "Cannlytics",
  async search(query) {
    try {
      const url = new URL("https://api.cannlytics.com/data/strains");
      url.searchParams.set("limit", "10");
      url.searchParams.set("sort", "name");
      url.searchParams.set("query", query);

      const res = await fetch(url.toString(), {
        headers: {
          ...(process.env.CANNLYTICS_API_KEY ? { Authorization: `Bearer ${process.env.CANNLYTICS_API_KEY}` } : {}),
        },
        next: { revalidate: 3600 },
      });

      if (!res.ok) return null;
      const json = await res.json();
      const row = Array.isArray(json?.data) ? json.data[0] : Array.isArray(json) ? json[0] : null;
      if (!row) return null;

      const parsed = CannlyticsRow.safeParse(row);
      if (!parsed.success) return null;

      const data = parsed.data;
      const name = data.strain_name ?? data.name ?? titleCase(query);
      const thc = Number(data.thc);
      const cbd = Number(data.cbd);

      return {
        provider: "Cannlytics",
        name,
        type: inferType(data.type),
        thcMin: Number.isFinite(thc) ? thc : undefined,
        thcMax: Number.isFinite(thc) ? thc : undefined,
        cbdMin: Number.isFinite(cbd) ? cbd : undefined,
        cbdMax: Number.isFinite(cbd) ? cbd : undefined,
        effects: listify(data.effects),
        flavors: listify(data.aromas),
        description: data.description,
        confidence: 0.9,
      };
    } catch {
      return null;
    }
  },
};
