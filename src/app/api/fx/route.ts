import { NextResponse } from "next/server";

interface CachedRate {
  rate: number;
  fetchedAt: number;
}

let cached: CachedRate | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * GET /api/fx
 * Returns real-time USD → JPY exchange rate.
 * Uses the free exchangerate.host API (no key required).
 * Falls back to a secondary API if that fails.
 */
export async function GET() {
  // Return cached if fresh
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ rate: cached.rate, cached: true });
  }

  // Try primary: exchangerate.host (free, no key)
  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { next: { revalidate: 600 } }
    );
    if (res.ok) {
      const data = await res.json();
      const rate = data.rates?.JPY;
      if (typeof rate === "number" && rate > 0) {
        cached = { rate, fetchedAt: Date.now() };
        return NextResponse.json({ rate, cached: false });
      }
    }
  } catch {
    // fall through
  }

  // Try secondary: frankfurter.app (free, no key)
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=JPY"
    );
    if (res.ok) {
      const data = await res.json();
      const rate = data.rates?.JPY;
      if (typeof rate === "number" && rate > 0) {
        cached = { rate, fetchedAt: Date.now() };
        return NextResponse.json({ rate, cached: false });
      }
    }
  } catch {
    // fall through
  }

  // Fallback: use last cached or a rough default
  const fallback = cached?.rate ?? 150;
  return NextResponse.json({ rate: fallback, fallback: true });
}
