import { NextRequest, NextResponse } from "next/server";
import {
  searchGoogleFlights,
  type SerpApiFlight,
  type SerpApiResponse,
} from "@/lib/serpapi";
import { getAirlineName } from "@/lib/airlines";
import type { FlightOffer, CabinAvailability } from "@/lib/types";

/** Extract IATA airline code from flight number like "NH 843" or "JL 123" */
function extractAirlineCode(flightNumber: string): string {
  const match = flightNumber.match(/^([A-Z0-9]{2})\s/);
  return match ? match[1] : flightNumber.slice(0, 2);
}

/** Extract seats remaining from Google Flights extensions */
function extractSeatsLeft(extensions?: string[]): number | null {
  if (!extensions) return null;
  for (const ext of extensions) {
    // Google Flights shows "X seats left" when availability is low
    const match = ext.match(/(\d+)\s*seat/i);
    if (match) return parseInt(match[1]);
  }
  return null;
}

/** Map Google Flights travel_class to display name */
function mapTravelClassDisplay(travelClass: string): string {
  const lower = travelClass.toLowerCase();
  if (lower.includes("first")) return "First";
  if (lower.includes("business")) return "Business";
  if (lower.includes("premium")) return "Premium Econ";
  return "Economy";
}

/** Map display name to booking class key */
function mapBookingClass(display: string): string {
  const map: Record<string, string> = {
    Economy: "economy",
    "Premium Econ": "premium_economy",
    Business: "business",
    First: "first",
  };
  return map[display] || "economy";
}

/** Format minutes to "Xh Ym" */
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hStr = h ? `${h}h` : "";
  const mStr = m ? ` ${m}m` : "";
  return `${hStr}${mStr}`.trim() || "0m";
}

/**
 * Parse SerpApi time string to a consistent "YYYY-MM-DDTHH:MM" format.
 * SerpApi returns local airport times like "2026-03-25 10:30" — we must
 * preserve them as-is (no timezone conversion) so the UI shows correct
 * departure/arrival times in the airport's local timezone.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseTime(timeStr: string, dateHint?: string): string {
  if (!timeStr) return "";
  // Already in ISO-like format without timezone
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(timeStr)) {
    // Strip any timezone suffix to keep it as local time
    return timeStr.replace(/[Z+].*$/, "");
  }
  // "2026-03-25 10:30" → "2026-03-25T10:30"
  const spaceMatch = timeStr.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})(.*)$/);
  if (spaceMatch) {
    const [, date, time] = spaceMatch;
    const [h, m] = time.split(":");
    return `${date}T${h.padStart(2, "0")}:${m}`;
  }
  // "2026-03-25 at 10:30 AM" style
  const atMatch = timeStr.match(/^(\d{4}-\d{2}-\d{2})\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (atMatch) {
    const [, date, hourStr, min, period] = atMatch;
    let hour = parseInt(hourStr);
    if (period?.toUpperCase() === "PM" && hour < 12) hour += 12;
    if (period?.toUpperCase() === "AM" && hour === 12) hour = 0;
    return `${date}T${String(hour).padStart(2, "0")}:${min}`;
  }
  return timeStr;
}

function processFlights(
  serpFlights: SerpApiFlight[],
  flightMap: Map<string, FlightOffer>,
  adults: number,
  cabinOverride?: string
): void {
  for (const serpFlight of serpFlights) {
    if (!serpFlight.flights || serpFlight.flights.length === 0) continue;

    // Skip flights with no price data (likely invalid or unavailable)
    if (!serpFlight.price || serpFlight.price <= 0) continue;

    const segments = serpFlight.flights;
    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];

    // Build flight identity
    const flightNumbers = segments
      .map((s) => s.flight_number.replace(/\s+/g, ""))
      .join("-");
    const depTime = firstSeg.departure_airport.time;
    const flightKey = `${flightNumbers}_${depTime}`;

    // Determine cabin class
    const cabinDisplay =
      cabinOverride || mapTravelClassDisplay(firstSeg.travel_class || "Economy");

    // Price per passenger
    const totalPrice = serpFlight.price;
    const perPassengerPrice = totalPrice / adults;

    // Seats left (from extensions)
    const seatsLeft =
      extractSeatsLeft(serpFlight.extensions) ??
      extractSeatsLeft(firstSeg.extensions);

    const cabin: CabinAvailability = {
      cabin: cabinDisplay,
      seatsAvailable: seatsLeft,
      price: perPassengerPrice.toFixed(2),
      currency: "USD",
      bookingClass: mapBookingClass(cabinDisplay),
    };

    const airlineCode = extractAirlineCode(firstSeg.flight_number);

    if (flightMap.has(flightKey)) {
      const existing = flightMap.get(flightKey)!;
      const existingCabin = existing.cabins.find((c) => c.cabin === cabin.cabin);
      if (!existingCabin) {
        existing.cabins.push(cabin);
      } else if (parseFloat(cabin.price) < parseFloat(existingCabin.price)) {
        existingCabin.price = cabin.price;
        // Update seats if we have new info
        if (cabin.seatsAvailable !== null) {
          existingCabin.seatsAvailable = cabin.seatsAvailable;
        }
      }
      if (perPassengerPrice > 0 && perPassengerPrice < existing.lowestPrice) {
        existing.lowestPrice = perPassengerPrice;
      }
    } else {
      const totalDuration = serpFlight.total_duration || 0;

      flightMap.set(flightKey, {
        id: flightKey,
        airlineCode,
        airline: firstSeg.airline || airlineCode,
        airlineName:
          getAirlineName(airlineCode) || firstSeg.airline || airlineCode,
        flightNumber: flightNumbers,
        departure: firstSeg.departure_airport.id,
        arrival: lastSeg.arrival_airport.id,
        departureTime: parseTime(
          firstSeg.departure_airport.time,
          firstSeg.departure_airport.time?.slice(0, 10)
        ),
        arrivalTime: parseTime(
          lastSeg.arrival_airport.time,
          lastSeg.arrival_airport.time?.slice(0, 10)
        ),
        duration: formatDuration(totalDuration),
        durationMinutes: totalDuration,
        stops: segments.length - 1,
        cabins: [cabin],
        lowestPrice: perPassengerPrice || 0,
        currency: "USD",
        segments: segments.map((seg) => ({
          departure: {
            iataCode: seg.departure_airport.id,
            at: parseTime(seg.departure_airport.time),
          },
          arrival: {
            iataCode: seg.arrival_airport.id,
            at: parseTime(seg.arrival_airport.time),
          },
          carrierCode: extractAirlineCode(seg.flight_number),
          number: seg.flight_number.replace(/^[A-Z0-9]{2}\s*/, ""),
          duration: formatDuration(seg.duration || 0),
        })),
      });
    }
  }
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
      {
        flights: [],
        error: "Origin, destination, and departure date are required.",
      },
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

    let data: SerpApiResponse;

    if (cabinClass === "ALL") {
      // Search single request (economy by default, Google Flights shows all)
      data = await searchGoogleFlights({ ...baseParams, cabinClass: "ECONOMY" });
    } else {
      data = await searchGoogleFlights({ ...baseParams, cabinClass });
    }

    if (data.error) {
      throw new Error(data.error);
    }

    const flightMap = new Map<string, FlightOffer>();

    // Determine cabin override based on search
    const cabinOverride =
      cabinClass !== "ALL"
        ? mapTravelClassDisplay(
            cabinClass === "PREMIUM_ECONOMY"
              ? "Premium Economy"
              : cabinClass.charAt(0) + cabinClass.slice(1).toLowerCase()
          )
        : undefined;

    // Process best flights
    if (data.best_flights) {
      processFlights(data.best_flights, flightMap, adults, cabinOverride);
    }

    // Process other flights
    if (data.other_flights) {
      processFlights(data.other_flights, flightMap, adults, cabinOverride);
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
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Flight search error:", message);
    return NextResponse.json(
      { flights: [], error: message },
      { status: 500 }
    );
  }
}
