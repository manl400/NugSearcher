import { ProviderStrainRecord } from "@/lib/types";
import { ProviderAdapter } from "@/lib/providers/base";
import { leaflyProvider } from "@/lib/providers/leafly";
import { allBudProvider } from "@/lib/providers/allbud";

const providers: ProviderAdapter[] = [leaflyProvider, allBudProvider];

export async function fetchFromAllProviders(query: string): Promise<ProviderStrainRecord[]> {
  const settled = await Promise.allSettled(providers.map((provider) => provider.search(query)));
  return settled
    .flatMap((result) => (result.status === "fulfilled" && result.value ? [result.value] : []))
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
}
