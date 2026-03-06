"use client";

import { useState } from "react";

type ApiResponse =
  | { found: false; query: string; message: string }
  | {
      found: true;
      data: {
        canonicalName: string;
        aggregatedRating: number | null;
        totalReviewCount: number;
        type: string;
        thcRange: string | null;
        cbdRange: string | null;
        effects: string[];
        sideEffects: string[];
        flavors: string[];
        terpenes: string[];
        description: string | null;
        providers: Array<{
          provider: string;
          name: string;
          rating?: number;
          reviewCount?: number;
          type?: string;
          url?: string;
        }>;
      };
    };

function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.length ? (
        items.map((item) => (
          <span key={item} className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-sm">
            {item}
          </span>
        ))
      ) : (
        <span className="text-zinc-500">None</span>
      )}
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("Blue Dream");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const json = (await res.json()) as ApiResponse | { message?: string };

      if (!res.ok) {
        throw new Error("message" in json && json.message ? json.message : "Search failed");
      }

      setResult(json as ApiResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold">Weed Strain Searcher</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Aggregated strain ratings, effects, side effects, type, and provider-by-provider details.
        </p>

        <form onSubmit={search} className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3"
              placeholder="Search Blue Dream"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-white px-5 py-3 font-medium text-black disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-900 bg-red-950/40 p-4 text-red-200">{error}</div>
        ) : null}

        {result && "found" in result && result.found === false ? (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-300">{result.message}</div>
        ) : null}

        {result && "found" in result && result.found === true ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-semibold">{result.data.canonicalName}</h2>
                  <p className="mt-2 text-zinc-400">{result.data.description ?? "No description available."}</p>
                </div>
                <div className="rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-center">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Aggregated rating</div>
                  <div className="mt-1 text-3xl font-bold">
                    {result.data.aggregatedRating != null ? result.data.aggregatedRating.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-sm text-zinc-500">{result.data.totalReviewCount} reviews</div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-xs uppercase text-zinc-500">Type</div>
                  <div className="mt-2 text-lg capitalize">{result.data.type}</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-xs uppercase text-zinc-500">THC</div>
                  <div className="mt-2 text-lg">{result.data.thcRange ?? "N/A"}</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="text-xs uppercase text-zinc-500">CBD</div>
                  <div className="mt-2 text-lg">{result.data.cbdRange ?? "N/A"}</div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <h3 className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">Effects</h3>
                  <Pills items={result.data.effects} />
                </div>
                <div>
                  <h3 className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">Side effects</h3>
                  <Pills items={result.data.sideEffects} />
                </div>
                <div>
                  <h3 className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">Flavors</h3>
                  <Pills items={result.data.flavors} />
                </div>
                <div>
                  <h3 className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-500">Terpenes</h3>
                  <Pills items={result.data.terpenes} />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-xl font-semibold">Source breakdown</h3>
              <div className="mt-4 space-y-4">
                {result.data.providers.map((provider) => (
                  <div key={`${provider.provider}-${provider.name}`} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg font-medium">{provider.provider}</div>
                        <div className="text-sm text-zinc-500">{provider.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {provider.rating != null ? provider.rating.toFixed(1) : "N/A"}
                        </div>
                        <div className="text-sm text-zinc-500">{provider.reviewCount ?? 0} reviews</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm capitalize text-zinc-400">{provider.type ?? "unknown"}</div>
                    {provider.url ? (
                      <a href={provider.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm underline underline-offset-4">
                        View source
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
