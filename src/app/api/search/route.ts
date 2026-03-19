import { NextRequest, NextResponse } from "next/server";
import { searchAllCabins, searchFlights } from "@/lib/duffel";
import { getAirlineName } from "@/lib/airlines";
import type { FlightOffer, CabinAvailability } from "@/lib/types";

/** Duffel cabin class → display name */
const CABIN_DISPLAY: Record<string, string> = {
  economy: "Economy",
  premium_economy: "Premium Econ",
  business: "Business",
  first: "First",
};

/** Duffel ISO 8601 duration (e.g. "PT2H30M" or "PT14H5M") → "2h 30m" */
function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? ` ${match[2]}m` : "";
  return `${hours}${minutes}`.trim() || "0m";
}

/** ISO 8601 duration → total minutes */
function durationToMinutes(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return parseInt(match[1] || "0") * 60 + parseInt(match[2] || "0");
}

/** Calculate duration between two ISO timestamps → ISO 8601 duration string */
function calcDuration(dep: string, arr: string): string {
  const ms = new Date(arr).getTime() - new Date(dep).getTime();
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `PT${h}H${m}M`;
}

/** Map frontend cabin class value to Duffel cabin class */
function mapCabinClass(value: string): string {
  const map: Record<string, string> = {
    ECONOMY: "economy",
    PREMIUM_ECONOMY: "premium_economy",
    BUSINESS: "business",
    FIRST: "first",
    ALL: "all",
  };
  return map[value] || "all";
}

// Duffel offer shape (partial)
interface DuffelSegment {
  origin: { iata_code: string };
  destination: { iata_code: string };
  departing_at: string;
  arriving_at: string;
  marketing_carrier: { iata_code: string; name: string };
  marketing_carrier_flight_number: string;
  duration: string;
}

interface DuffelSlice {
  duration: string;
  segments: DuffelSegment[];
}

interface DuffelOffer {
  id: string;
  slices: DuffelSlice[];
  total_amount: string;
  total_currency: string;
  passengers: Array<{ type: string }>;
  payment_requirements: Record<string, unknown>;
  available_services?: unknown[];
  cabin_class?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin")?.toUpperCase();
  const destination = searchParams.get("destination")?.toUpperCase();
  const departureDate = searchParams.get("departureDate");
  const returnDate = searchParams.get("returnDate") || undefined;
  const adults = Number(searchParams.get("adults") || "1");
  const cabinClass = searchParams.get("cabinClass") || "ALL";

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { flights: [], error: "Origin, destination, and departure date are required." },
      { status: 400 }
    );
  }

  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return NextResponse.json(
      { flights: [], error: "Airport codes must be 3-letter IATA codes." },
      { status: 400 }
    );
  }

  if (adults < 1 || adults > 9) {
    return NextResponse.json(
      { flights: [], error: "Number of passengers must be between 1 and 9." },
      { status: 400 }
    );
  }

  try {
    const baseParams = {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
    };

    let allOffers: unknown[];
    const duffelCabin = mapCabinClass(cabinClass);

    if (duffelCabin === "all") {
      const data = await searchAllCabins(baseParams);
      allOffers = data.offers;
    } else {
      const raw = await searchFlights({ ...baseParams, cabinClass: duffelCabin });
      allOffers = raw.data?.offers || [];
    }

    // Group offers by flight identity
    const flightMap = new Map<string, FlightOffer>();

    for (const rawOffer of allOffers) {
      const offer = rawOffer as DuffelOffer;
      const firstSlice = offer.slices[0];
      if (!firstSlice || !firstSlice.segments.length) continue;

      const segments = firstSlice.segments;
      const firstSeg = segments[0];
      const lastSeg = segments[segments.length - 1];

      // Determine cabin class from the offer
      // Duffel puts cabin_class in the top-level offer when requested
      const cabinRaw = offer.cabin_class || "economy";
      const cabinDisplay = CABIN_DISPLAY[cabinRaw] || cabinRaw;

      // Price per passenger (Duffel total_amount is for all passengers)
      const totalPrice = parseFloat(offer.total_amount);
      const perPassengerPrice = totalPrice / adults;

      const cabin: CabinAvailability = {
        cabin: cabinDisplay,
        seatsAvailable: null, // Duffel doesn't give seat count in offer search
        price: perPassengerPrice.toFixed(2),
        currency: offer.total_currency,
        bookingClass: cabinRaw,
      };

      // Build flight identity key
      const flightNumbers = segments
        .map((s) => `${s.marketing_carrier.iata_code}${s.marketing_carrier_flight_number}`)
        .join("-");
      const flightKey = `${flightNumbers}_${firstSeg.departing_at}`;

      // Calculate total duration
      const sliceDuration = firstSlice.duration || calcDuration(firstSeg.departing_at, lastSeg.arriving_at);

      if (flightMap.has(flightKey)) {
        const existing = flightMap.get(flightKey)!;
        const existingCabin = existing.cabins.find((c) => c.cabin === cabin.cabin);
        if (!existingCabin) {
          existing.cabins.push(cabin);
        } else if (parseFloat(cabin.price) < parseFloat(existingCabin.price)) {
          existingCabin.price = cabin.price;
          existingCabin.currency = cabin.currency;
        }
        if (perPassengerPrice < existing.lowestPrice) {
          existing.lowestPrice = perPassengerPrice;
          existing.currency = offer.total_currency;
        }
      } else {
        const carrierCode = firstSeg.marketing_carrier.iata_code;
        flightMap.set(flightKey, {
          id: offer.id,
          airlineCode: carrierCode,
          airline: firstSeg.marketing_carrier.name || carrierCode,
          airlineName: getAirlineName(carrierCode) || firstSeg.marketing_carrier.name || carrierCode,
          flightNumber: flightNumbers,
          departure: firstSeg.origin.iata_code,
          arrival: lastSeg.destination.iata_code,
          departureTime: firstSeg.departing_at,
          arrivalTime: lastSeg.arriving_at,
          duration: formatDuration(sliceDuration),
          durationMinutes: durationToMinutes(sliceDuration),
          stops: segments.length - 1,
          cabins: [cabin],
          lowestPrice: perPassengerPrice,
          currency: offer.total_currency,
          segments: segments.map((seg) => ({
            departure: { iataCode: seg.origin.iata_code, at: seg.departing_at },
            arrival: { iataCode: seg.destination.iata_code, at: seg.arriving_at },
            carrierCode: seg.marketing_carrier.iata_code,
            number: seg.marketing_carrier_flight_number,
            duration: formatDuration(seg.duration || calcDuration(seg.departing_at, seg.arriving_at)),
          })),
        } satisfies FlightOffer);
      }
    }

    // Sort cabins and assign IDs
    const cabinOrder = ["Economy", "Premium Econ", "Business", "First"];
    let idx = 0;
    const flights = Array.from(flightMap.values()).map((f) => {
      f.id = `flight-${idx++}`;
      f.cabins.sort(
        (a, b) => cabinOrder.indexOf(a.cabin) - cabinOrder.indexOf(b.cabin)
      );
      return f;
    });

    return NextResponse.json({ flights });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Flight search error:", message);
    return NextResponse.json({ flights: [], error: message }, { status: 500 });
  }
}
