const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

/** OAuth2 client_credentials access token (cached) */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Set AMADEUS_API_KEY and AMADEUS_API_SECRET in .env.local"
    );
  }

  const res = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Amadeus auth error: ${res.status} ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 30) * 1000,
  };

  return cachedToken.accessToken;
}

export interface AmadeusSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  travelClass?: string;
}

/** Call Flight Offers Search API v2 */
export async function searchFlights(params: AmadeusSearchParams) {
  const token = await getAccessToken();

  const queryObj: Record<string, string> = {
    originLocationCode: params.originLocationCode,
    destinationLocationCode: params.destinationLocationCode,
    departureDate: params.departureDate,
    adults: String(params.adults),
    max: "30",
  };

  if (params.returnDate) {
    queryObj.returnDate = params.returnDate;
  }

  if (params.travelClass) {
    queryObj.travelClass = params.travelClass;
  }

  const query = new URLSearchParams(queryObj);

  const res = await fetch(
    `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${query}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flight search error: ${res.status} ${text}`);
  }

  return res.json();
}

/** Search all cabin classes in parallel and merge results */
export async function searchAllCabins(params: Omit<AmadeusSearchParams, "travelClass">) {
  const cabinClasses = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];

  const results = await Promise.allSettled(
    cabinClasses.map((travelClass) =>
      searchFlights({ ...params, travelClass })
    )
  );

  // Merge all successful results
  const allOffers: unknown[] = [];
  let carriers: Record<string, string> = {};

  for (const result of results) {
    if (result.status === "fulfilled") {
      const data = result.value;
      if (data.data) {
        allOffers.push(...data.data);
      }
      if (data.dictionaries?.carriers) {
        carriers = { ...carriers, ...data.dictionaries.carriers };
      }
    }
    // Silently skip failed cabin classes (e.g. no Business on a route)
  }

  if (allOffers.length === 0) {
    // If ALL failed, throw the first error
    const firstError = results.find((r) => r.status === "rejected") as
      | PromiseRejectedResult
      | undefined;
    if (firstError) {
      throw firstError.reason;
    }
  }

  return { data: allOffers, dictionaries: { carriers } };
}
