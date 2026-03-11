/** Airline official booking website URLs */
const AIRLINE_BOOKING_URLS: Record<string, string> = {
  NH: "https://www.ana.co.jp/en/jp/",
  JL: "https://www.jal.co.jp/en/",
  SQ: "https://www.singaporeair.com/",
  CX: "https://www.cathaypacific.com/",
  TG: "https://www.thaiairways.com/",
  KE: "https://www.koreanair.com/",
  OZ: "https://flyasiana.com/",
  BR: "https://www.evaair.com/",
  CI: "https://www.china-airlines.com/",
  MH: "https://www.malaysiaairlines.com/",
  GA: "https://www.garuda-indonesia.com/",
  VN: "https://www.vietnamairlines.com/",
  QF: "https://www.qantas.com/",
  NZ: "https://www.airnewzealand.com/",
  AI: "https://www.airindia.com/",
  CA: "https://www.airchina.com/",
  MU: "https://www.ceair.com/",
  CZ: "https://www.csair.com/",
  AA: "https://www.aa.com/",
  UA: "https://www.united.com/",
  DL: "https://www.delta.com/",
  AC: "https://www.aircanada.com/",
  HA: "https://www.hawaiianairlines.com/",
  BA: "https://www.britishairways.com/",
  LH: "https://www.lufthansa.com/",
  AF: "https://www.airfrance.com/",
  KL: "https://www.klm.com/",
  LX: "https://www.swiss.com/",
  AY: "https://www.finnair.com/",
  TK: "https://www.turkishairlines.com/",
  IB: "https://www.iberia.com/",
  SK: "https://www.flysas.com/",
  EK: "https://www.emirates.com/",
  QR: "https://www.qatarairways.com/",
  EY: "https://www.etihad.com/",
  ET: "https://www.ethiopianairlines.com/",
  MM: "https://www.flypeach.com/",
  GK: "https://www.jetstar.com/jp/",
  BC: "https://www.skymark.co.jp/en/",
};

interface BookingParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabinClass?: string;
  airlineCode?: string;
}

function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

function skyDateFormat(iso: string): string {
  return dateOnly(iso).replace(/-/g, "").slice(2);
}

export interface BookingLink {
  name: string;
  url: string;
  icon: "airline" | "ota";
}

export function getBookingLinks(params: BookingParams): BookingLink[] {
  const { origin, destination, departureDate, returnDate, adults, airlineCode } = params;
  const date = dateOnly(departureDate);
  const skyDate = skyDateFormat(departureDate);
  const skyReturn = returnDate ? skyDateFormat(returnDate) : "";

  const links: BookingLink[] = [];

  // 1. Airline official site (first priority)
  if (airlineCode && AIRLINE_BOOKING_URLS[airlineCode]) {
    links.push({
      name: "Official Site",
      url: AIRLINE_BOOKING_URLS[airlineCode],
      icon: "airline",
    });
  }

  // 2. Google Flights
  const rtnParam = returnDate ? `&d2=${dateOnly(returnDate)}` : "";
  links.push({
    name: "Google Flights",
    url: `https://www.google.com/travel/flights?q=Flights+from+${origin}+to+${destination}+on+${date}+${adults}+passengers${rtnParam}`,
    icon: "ota",
  });

  // 3. Skyscanner
  const skyReturnSlug = skyReturn ? `/${skyReturn}` : "";
  links.push({
    name: "Skyscanner",
    url: `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${skyDate}${skyReturnSlug}/?adults=${adults}&adultsv2=${adults}`,
    icon: "ota",
  });

  // 4. Expedia
  const expediaType = returnDate ? "" : "&tripType=oneway";
  const expediaReturn = returnDate ? `&d2=${dateOnly(returnDate)}` : "";
  links.push({
    name: "Expedia",
    url: `https://www.expedia.com/Flights-search/${origin}-${destination}/${date}/?d1=${date}${expediaReturn}&passengers=adults:${adults}${expediaType}`,
    icon: "ota",
  });

  // 5. Trip.com
  links.push({
    name: "Trip.com",
    url: `https://www.trip.com/flights/${origin.toLowerCase()}-to-${destination.toLowerCase()}/tickets-${origin.toLowerCase()}-${destination.toLowerCase()}?dcity=${origin}&acity=${destination}&ddate=${date}&adult=${adults}`,
    icon: "ota",
  });

  return links;
}
