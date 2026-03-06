import { ProviderStrainRecord } from "@/lib/types";

export type ProviderAdapter = {
  name: string;
  search: (query: string) => Promise<ProviderStrainRecord | null>;
};
