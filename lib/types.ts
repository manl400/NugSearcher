export type StrainType = "indica" | "sativa" | "hybrid" | "unknown";

export type ProviderStrainRecord = {
  provider: string;
  name: string;
  canonicalSlug?: string;
  url?: string;
  rating?: number;
  reviewCount?: number;
  type?: StrainType;
  thcMin?: number;
  thcMax?: number;
  cbdMin?: number;
  cbdMax?: number;
  effects?: string[];
  sideEffects?: string[];
  flavors?: string[];
  description?: string;
  aliases?: string[];
  terpenes?: string[];
  confidence?: number;
};

export type AggregatedStrain = {
  query: string;
  canonicalName: string;
  aliases: string[];
  aggregatedRating: number | null;
  totalReviewCount: number;
  type: StrainType;
  thcRange: string | null;
  cbdRange: string | null;
  effects: string[];
  sideEffects: string[];
  flavors: string[];
  terpenes: string[];
  description: string | null;
  providers: ProviderStrainRecord[];
};
