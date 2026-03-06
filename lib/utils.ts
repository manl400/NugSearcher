import type { StrainType } from "@/lib/types";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleCase(input: string): string {
  return input
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function uniqueSorted(values: string[], max = 15): string[] {
  const seen = new Map<string, { label: string; count: number }>();
  for (const raw of values) {
    const cleaned = raw.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    const prev = seen.get(key);
    seen.set(key, { label: cleaned, count: (prev?.count ?? 0) + 1 });
  }
  return [...seen.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, max)
    .map((x) => x.label);
}

export function weightedAverage(values: Array<{ value: number; weight: number }>): number | null {
  const valid = values.filter((v) => Number.isFinite(v.value) && v.weight > 0);
  if (!valid.length) return null;
  const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);
  const total = valid.reduce((sum, item) => sum + item.value * item.weight, 0);
  return totalWeight ? Math.round((total / totalWeight) * 10) / 10 : null;
}

export function formatRange(min?: number, max?: number, suffix = "%"): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return min === max ? `${min}${suffix}` : `${min}${suffix}–${max}${suffix}`;
  const val = min ?? max;
  return val == null ? null : `${val}${suffix}`;
}

export function inferType(input?: string | null): StrainType {
  const value = (input ?? "").toLowerCase();
  if (value.includes("hybrid")) return "hybrid";
  if (value.includes("indica")) return "indica";
  if (value.includes("sativa")) return "sativa";
  return "unknown";
}
