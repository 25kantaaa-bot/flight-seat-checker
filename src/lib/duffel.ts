const DUFFEL_BASE_URL = "https://api.duffel.com";

function getToken(): string {
  const token = process.env.DUFFEL_API_TOKEN;
  if (!token) {
    throw new Error("Set DUFFEL_API_TOKEN in environment variables");
  }
  return token;
}

function duffelHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Duffel-Version": "v2",
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export interface DuffelSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass?: string; // "economy" | "premium_economy" | "business" | "first"
}

/** Create an offer request and return offers */
export async function searchFlights(params: DuffelSearchParams) {
  const slices: Array<{ origin: string; destination: string; departure_date: string }> = [
    {
      origin: params.origin,
      destination: params.destination,
      departure_date: params.departureDate,
    },
  ];

  if (params.returnDate) {
    slices.push({
      origin: params.destination,
      destination: params.origin,
      departure_date: params.returnDate,
    });
  }

  const passengers: Array<{ type: string }> = [];
  for (let i = 0; i < params.adults; i++) {
    passengers.push({ type: "adult" });
  }

  const body: Record<string, unknown> = {
    data: {
      slices,
      passengers,
      max_connections: 2,
    },
  };

  if (params.cabinClass && params.cabinClass !== "all") {
    (body.data as Record<string, unknown>).cabin_class = params.cabinClass;
  }

  const res = await fetch(`${DUFFEL_BASE_URL}/air/offer_requests?return_offers=true&supplier_timeout=30000`, {
    method: "POST",
    headers: duffelHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Duffel search error: ${res.status} ${text}`);
  }

  return res.json();
}

/** Search all cabin classes in parallel and merge results */
export async function searchAllCabins(params: Omit<DuffelSearchParams, "cabinClass">) {
  const cabinClasses = ["economy", "premium_economy", "business", "first"];

  const results = await Promise.allSettled(
    cabinClasses.map((cabinClass) =>
      searchFlights({ ...params, cabinClass })
    )
  );

  const allOffers: unknown[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      const data = result.value;
      if (data.data?.offers) {
        allOffers.push(...data.data.offers);
      }
    }
  }

  if (allOffers.length === 0) {
    const firstError = results.find((r) => r.status === "rejected") as
      | PromiseRejectedResult
      | undefined;
    if (firstError) {
      throw firstError.reason;
    }
  }

  return { offers: allOffers };
}

/** Fetch seat map for an offer and count available seats per cabin */
export async function getSeatMap(offerId: string): Promise<Record<string, number>> {
  const res = await fetch(
    `${DUFFEL_BASE_URL}/air/seat_maps?offer_id=${encodeURIComponent(offerId)}`,
    {
      headers: {
        ...duffelHeaders(),
        "Accept-Encoding": "gzip",
      },
    }
  );

  if (!res.ok) {
    // Seat map not available for this offer — return empty
    return {};
  }

  const json = await res.json();
  const seatMaps = json.data as Array<{
    cabins: Array<{
      cabin_class: string;
      rows: Array<{
        sections: Array<{
          elements: Array<{
            type: string;
            available_services?: Array<unknown>;
          }>;
        }>;
      }>;
    }>;
  }>;

  // Count available seats per cabin class (first segment only)
  const counts: Record<string, number> = {};

  if (seatMaps && seatMaps.length > 0) {
    const firstMap = seatMaps[0];
    for (const cabin of firstMap.cabins) {
      let available = 0;
      for (const row of cabin.rows) {
        for (const section of row.sections) {
          for (const el of section.elements) {
            if (
              el.type === "seat" &&
              el.available_services &&
              el.available_services.length > 0
            ) {
              available++;
            }
          }
        }
      }
      counts[cabin.cabin_class] = (counts[cabin.cabin_class] || 0) + available;
    }
  }

  return counts;
}

/** Fetch seat maps for multiple offers in parallel (with concurrency limit) */
export async function getSeatMapsForOffers(
  offerIds: Array<{ offerId: string; flightKey: string }>
): Promise<Map<string, Record<string, number>>> {
  const CONCURRENCY = 5;
  const results = new Map<string, Record<string, number>>();

  for (let i = 0; i < offerIds.length; i += CONCURRENCY) {
    const batch = offerIds.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(async ({ offerId, flightKey }) => {
        const counts = await getSeatMap(offerId);
        return { flightKey, counts };
      })
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.set(result.value.flightKey, result.value.counts);
      }
    }
  }

  return results;
}
