/** IATA code → English airline name mapping */
export const AIRLINE_NAMES: Record<string, string> = {
  // Japan
  NH: "ANA (All Nippon Airways)",
  JL: "Japan Airlines (JAL)",
  BC: "Skymark Airlines",
  JW: "Vanilla Air",
  MM: "Peach Aviation",
  GK: "Jetstar Japan",
  DJ: "Air Do",
  HD: "AIRDO",
  FW: "IBEX Airlines",
  "7G": "StarFlyer",

  // Asia & Oceania
  SQ: "Singapore Airlines",
  CX: "Cathay Pacific",
  TG: "Thai Airways",
  KE: "Korean Air",
  OZ: "Asiana Airlines",
  CI: "China Airlines",
  BR: "EVA Air",
  MH: "Malaysia Airlines",
  GA: "Garuda Indonesia",
  VN: "Vietnam Airlines",
  QF: "Qantas",
  NZ: "Air New Zealand",
  AI: "Air India",
  CA: "Air China",
  MU: "China Eastern Airlines",
  CZ: "China Southern Airlines",
  HX: "Hong Kong Airlines",
  PR: "Philippine Airlines",
  "5J": "Cebu Pacific",
  TR: "Scoot",
  FD: "Thai AirAsia",

  // North America
  AA: "American Airlines",
  UA: "United Airlines",
  DL: "Delta Air Lines",
  AC: "Air Canada",
  WN: "Southwest Airlines",
  HA: "Hawaiian Airlines",
  AS: "Alaska Airlines",
  B6: "JetBlue Airways",

  // Europe
  BA: "British Airways",
  LH: "Lufthansa",
  AF: "Air France",
  KL: "KLM Royal Dutch Airlines",
  LX: "Swiss International Air Lines",
  AZ: "ITA Airways",
  IB: "Iberia",
  SK: "Scandinavian Airlines (SAS)",
  AY: "Finnair",
  TK: "Turkish Airlines",
  OS: "Austrian Airlines",
  SN: "Brussels Airlines",
  LO: "LOT Polish Airlines",
  TP: "TAP Air Portugal",

  // Middle East & Africa
  EK: "Emirates",
  QR: "Qatar Airways",
  EY: "Etihad Airways",
  ET: "Ethiopian Airlines",
  SA: "South African Airways",
  WY: "Oman Air",
  GF: "Gulf Air",
};

/** Get airline name by IATA code (returns code if not mapped) */
export function getAirlineName(code: string): string {
  return AIRLINE_NAMES[code] || code;
}
