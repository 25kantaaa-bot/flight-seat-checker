const SERPAPI_BASE = "https://serpapi.com/search";

function getApiKey(): string {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) {
    throw new Error("Set SERPAPI_API_KEY in environment variables");
  }
  return key;
}

/** Map frontend cabin class value to SerpApi travel_class number */
function mapTravelClass(cabin: string): number | undefined {
  const map: Record<string, number> = {
    ECONOMY: 1,
    PREMIUM_ECONOMY: 2,
    BUSINESS: 3,
    FIRST: 4,
  };
  return map[cabin]; // undefined = ALL (don't send parameter)
}

export interface SerpApiSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass?: string;
}

export interface SerpApiFlight {
  flights: Array<{
    departure_airport: { name: string; id: string; time: string };
    arrival_airport: { name: string; id: string; time: string };
    duration: number;
    airline: string;
    airline_logo: string;
    flight_number: string;
    travel_class: string;
    legroom: string;
    extensions: string[];
    often_delayed_by_over_30_min?: boolean;
  }>;
  total_duration: number;
  price: number;
  type: string;
  airline_logo: string;
  layovers?: Array<{
    name: string;
    duration: number;
    id: string;
  }>;
  extensions?: string[];
  departure_token?: string;
}

export interface SerpApiResponse {
  best_flights?: SerpApiFlight[];
  other_flights?: SerpApiFlight[];
  search_metadata?: {
    status: string;
  };
  error?: string;
  price_insights?: {
    lowest_price?: number;
    typical_price_range?: number[];
  };
}

/** Search Google Flights via SerpApi */
export async function searchGoogleFlights(
  params: SerpApiSearchParams
): Promise<SerpApiResponse> {
  const queryParams: Record<string, string> = {
    engine: "google_flights",
    api_key: getApiKey(),
    departure_id: params.origin,
    arrival_id: params.destination,
    outbound_date: params.departureDate,
    adults: String(params.adults),
    currency: "USD",
    hl: "en",
    gl: "us",
  };

  // Trip type
  if (params.returnDate) {
    queryParams.type = "1"; // Round trip
    queryParams.return_date = params.returnDate;
  } else {
    queryParams.type = "2"; // One way
  }

  // Cabin class
  if (params.cabinClass && params.cabinClass !== "ALL") {
    const travelClass = mapTravelClass(params.cabinClass);
    if (travelClass) {
      queryParams.travel_class = String(travelClass);
    }
  }

  const url = `${SERPAPI_BASE}?${new URLSearchParams(queryParams)}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SerpApi error: ${res.status} ${text}`);
  }

  return res.json();
}

/** Search all cabin classes in parallel and merge results */
export async function searchAllCabins(
  params: Omit<SerpApiSearchParams, "cabinClass">
): Promise<SerpApiResponse> {
  const cabinClasses = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];

  const results = await Promise.allSettled(
    cabinClasses.map((cabinClass) =>
      searchGoogleFlights({ ...params, cabinClass })
    )
  );

  const bestFlights: SerpApiFlight[] = [];
  const otherFlights: SerpApiFlight[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      if (result.value.best_flights) {
        bestFlights.push(...result.value.best_flights);
      }
      if (result.value.other_flights) {
        otherFlights.push(...result.value.other_flights);
      }
    }
  }

  if (bestFlights.length === 0 && otherFlights.length === 0) {
    const firstError = results.find((r) => r.status === "rejected") as
      | PromiseRejectedResult
      | undefined;
    if (firstError) {
      throw firstError.reason;
    }
  }

  return { best_flights: bestFlights, other_flights: otherFlights };
}
