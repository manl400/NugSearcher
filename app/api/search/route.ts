import { NextRequest, NextResponse } from "next/server";
import { aggregateStrain } from "@/lib/aggregate";
import { fetchFromAllProviders } from "@/lib/providers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter q" }, { status: 400 });
  }

  const providers = await fetchFromAllProviders(query);

  if (!providers.length) {
    return NextResponse.json({ found: false, query, message: "No matching strain found." }, { status: 404 });
  }

  const data = aggregateStrain(query, providers);
  return NextResponse.json({ found: true, data });
}
