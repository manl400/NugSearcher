import { ProviderAdapter } from "@/lib/providers/base";
import { titleCase } from "@/lib/utils";

export const otreebaProvider: ProviderAdapter = {
  name: "Otreeba",
  async search(query) {
    try {
      const base = process.env.OTREEBA_BASE_URL || "https://api.otreeba.com/v1";
      const url = new URL(`${base}/strains`);
      url.searchParams.set("q", query);
      url.searchParams.set("count", "10");

      const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
      if (!res.ok) return null;

      const json = await res.json();
      const first = Array.isArray(json?.data) ? json.data[0] : Array.isArray(json) ? json[0] : null;
      if (!first) return null;

      return {
        provider: "Otreeba",
        name: first.name ?? titleCase(query),
        aliases: Array.isArray(first?.aliases) ? first.aliases : [],
        confidence: 0.85,
      };
    } catch {
      return null;
    }
  },
};
