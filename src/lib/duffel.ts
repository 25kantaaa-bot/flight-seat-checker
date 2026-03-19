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
