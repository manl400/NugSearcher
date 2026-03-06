import { AggregatedStrain, ProviderStrainRecord, StrainType } from "@/lib/types";
import { formatRange, uniqueSorted, weightedAverage } from "@/lib/utils";

function modeType(items: StrainType[]): StrainType {
  const counts = new Map<StrainType, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "unknown";
}

export function aggregateStrain(query: string, providers: ProviderStrainRecord[]): AggregatedStrain {
  const ratings = providers
    .filter((p) => typeof p.rating === "number")
    .map((p) => ({ value: p.rating as number, weight: Math.max(p.reviewCount ?? 1, 1) }));

  const thcMins = providers.flatMap((p) => (p.thcMin != null ? [p.thcMin] : []));
  const thcMaxs = providers.flatMap((p) => (p.thcMax != null ? [p.thcMax] : []));
  const cbdMins = providers.flatMap((p) => (p.cbdMin != null ? [p.cbdMin] : []));
  const cbdMaxs = providers.flatMap((p) => (p.cbdMax != null ? [p.cbdMax] : []));
  const types = providers.map((p) => p.type ?? "unknown").filter(Boolean) as StrainType[];

  return {
    query,
    canonicalName: providers[0]?.name ?? query,
    aliases: uniqueSorted(providers.flatMap((p) => p.aliases ?? []), 20),
    aggregatedRating: weightedAverage(ratings),
    totalReviewCount: providers.reduce((sum, p) => sum + (p.reviewCount ?? 0), 0),
    type: modeType(types),
    thcRange: formatRange(thcMins.length ? Math.min(...thcMins) : undefined, thcMaxs.length ? Math.max(...thcMaxs) : undefined),
    cbdRange: formatRange(cbdMins.length ? Math.min(...cbdMins) : undefined, cbdMaxs.length ? Math.max(...cbdMaxs) : undefined),
    effects: uniqueSorted(providers.flatMap((p) => p.effects ?? [])),
    sideEffects: uniqueSorted(providers.flatMap((p) => p.sideEffects ?? [])),
    flavors: uniqueSorted(providers.flatMap((p) => p.flavors ?? [])),
    terpenes: uniqueSorted(providers.flatMap((p) => p.terpenes ?? [])),
    description: providers.find((p) => p.description)?.description ?? null,
    providers,
  };
}
