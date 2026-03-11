import { NextRequest, NextResponse } from "next/server";
import { searchAllCabins, searchFlights } from "@/lib/amadeus";
import { getAirlineName } from "@/lib/airlines";
import type { FlightOffer, CabinAvailability } from "@/lib/types";

/** ISO 8601 duration (PT2H30M) → "2h 30m" */
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

/** Cabin class display name */
const CABIN_DISPLAY: Record<string, string> = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Premium Econ",
  BUSINESS: "Business",
  FIRST: "First",
};

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
      {
        flights: [],
        error: "Origin, destination, and departure date are required.",
      },
      { status: 400 }
    );
  }

  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
    return NextResponse.json(
      {
        flights: [],
        error: "Airport codes must be 3-letter IATA codes.",
      },
      { status: 400 }
    );
  }

  if (adults < 1 || adults > 9) {
    return NextResponse.json(
      {
        flights: [],
        error: "Number of passengers must be between 1 and 9.",
      },
      { status: 400 }
    );
  }

  try {
    // Decide whether to fetch all cabins or a specific class
    const baseParams = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      returnDate,
      adults,
    };

    let data: { data: unknown[]; dictionaries: { carriers: Record<string, string> } };

    if (cabinClass === "ALL") {
      data = await searchAllCabins(baseParams);
    } else {
      // Specific cabin class
      const raw = await searchFlights({ ...baseParams, travelClass: cabinClass });
      data = {
        data: raw.data || [],
        dictionaries: { carriers: raw.dictionaries?.carriers || {} },
      };
    }

    const carriers: Record<string, string> = data.dictionaries?.carriers || {};

    // Group offers by flight identity to collect per-cabin availability
    const flightMap = new Map<string, FlightOffer>();

    for (const offer of data.data || []) {
      const itineraries = (offer as Record<string, unknown>)
        .itineraries as Array<{
        duration: string;
        segments: Array<{
          departure: { iataCode: string; at: string };
          arrival: { iataCode: string; at: string };
          carrierCode: string;
          number: string;
          duration: string;
        }>;
      }>;
      const firstItinerary = itineraries[0];
      const segments = firstItinerary.segments;
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      const travelerPricings = (offer as Record<string, unknown>)
        .travelerPricings as Array<{
        fareDetailsBySegment: Array<{
          cabin: string;
          class: string;
        }>;
      }>;
      const fareDetails =
        travelerPricings?.[0]?.fareDetailsBySegment?.[0];
      const cabinRaw = fareDetails?.cabin || "ECONOMY";
      const bookingClass = fareDetails?.class || "";

      const numberOfBookableSeats = (
        offer as Record<string, unknown>
      ).numberOfBookableSeats as number | undefined;

      const price = (offer as Record<string, unknown>).price as {
        total: string;
        currency: string;
      };

      const cabin: CabinAvailability = {
        cabin: CABIN_DISPLAY[cabinRaw] || cabinRaw,
        seatsAvailable:
          typeof numberOfBookableSeats === "number"
            ? numberOfBookableSeats
            : null,
        price: price.total,
        currency: price.currency,
        bookingClass,
      };

      // Build flight identity key (same physical flight across cabins)
      const flightNumbers = segments
        .map((s) => `${s.carrierCode}${s.number}`)
        .join("-");
      const flightKey = `${flightNumbers}_${firstSegment.departure.at}`;

      if (flightMap.has(flightKey)) {
        const existing = flightMap.get(flightKey)!;
        // Add cabin if not already present; update if cheaper price for same cabin
        const existingCabin = existing.cabins.find(
          (c) => c.cabin === cabin.cabin
        );
        if (!existingCabin) {
          existing.cabins.push(cabin);
        } else if (
          parseFloat(cabin.price) < parseFloat(existingCabin.price)
        ) {
          existingCabin.price = cabin.price;
          existingCabin.currency = cabin.currency;
          existingCabin.seatsAvailable = cabin.seatsAvailable;
          existingCabin.bookingClass = cabin.bookingClass;
        }
        // Update lowest price
        const newPrice = parseFloat(price.total);
        if (newPrice < existing.lowestPrice) {
          existing.lowestPrice = newPrice;
          existing.currency = price.currency;
        }
      } else {
        flightMap.set(flightKey, {
          id: (offer as Record<string, unknown>).id as string,
          airlineCode: firstSegment.carrierCode,
          airline:
            carriers[firstSegment.carrierCode] ||
            firstSegment.carrierCode,
          airlineName: getAirlineName(firstSegment.carrierCode),
          flightNumber: flightNumbers,
          departure: firstSegment.departure.iataCode,
          arrival: lastSegment.arrival.iataCode,
          departureTime: firstSegment.departure.at,
          arrivalTime: lastSegment.arrival.at,
          duration: formatDuration(firstItinerary.duration),
          durationMinutes: durationToMinutes(firstItinerary.duration),
          stops: segments.length - 1,
          cabins: [cabin],
          lowestPrice: parseFloat(price.total),
          currency: price.currency,
          segments: segments.map((seg) => ({
            departure: seg.departure,
            arrival: seg.arrival,
            carrierCode: seg.carrierCode,
            number: seg.number,
            duration: formatDuration(seg.duration),
          })),
        } satisfies FlightOffer);
      }
    }

    // Sort cabins within each flight by priority order, assign unique IDs
    const cabinOrder = [
      "Economy",
      "Premium Econ",
      "Business",
      "First",
    ];
    let idx = 0;
    const flights = Array.from(flightMap.values()).map((f) => {
      f.id = `flight-${idx++}`;
      f.cabins.sort(
        (a, b) =>
          cabinOrder.indexOf(a.cabin) - cabinOrder.indexOf(b.cabin)
      );
      return f;
    });

    return NextResponse.json({ flights });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred.";
    console.error("Flight search error:", message);
    return NextResponse.json(
      { flights: [], error: message },
      { status: 500 }
    );
  }
}
