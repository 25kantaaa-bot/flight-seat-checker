export type TripType = "oneway" | "roundtrip";

export interface SearchParams {
  tripType: TripType;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass: string; // "ALL" | "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
}

export interface FlightSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  duration: string;
}

export interface CabinAvailability {
  cabin: string;
  seatsAvailable: number | null;
  price: string;
  currency: string;
  bookingClass: string;
}

export interface FlightOffer {
  id: string;
  airline: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  stops: number;
  cabins: CabinAvailability[];
  lowestPrice: number;
  currency: string;
  segments: FlightSegment[];
}

export interface SearchResponse {
  flights: FlightOffer[];
  error?: string;
}

export type SortField = "departure" | "arrival" | "price" | "duration" | "stops";
export type SortDirection = "asc" | "desc";
