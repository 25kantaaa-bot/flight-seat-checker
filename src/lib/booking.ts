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

/** Generate a direct link to check seats / book on the airline's site */
export function getSeatCheckUrl(params: {
  airlineCode: string;
  origin: string;
  destination: string;
  departureDate: string; // "YYYY-MM-DDTHH:MM" or "YYYY-MM-DD"
  adults?: number;
  cabinClass?: string;
}): string {
  const { airlineCode, origin, destination, adults = 1 } = params;
  const date = dateOnly(params.departureDate);
  const [y, mo, d] = date.split("-");

  switch (airlineCode) {
    // ANA
    case "NH":
      return `https://www.ana.co.jp/en/jp/book-plan/search/international/?itinerary=${origin}${destination}${date.replace(/-/g, "")}&pax=${adults}&cabin=&aession=`;

    // JAL
    case "JL":
      return `https://www.jal.co.jp/en/inter/flight_search/?from=${origin}&to=${destination}&dates=${date}&pax=${adults}&cabin=Y`;

    // Singapore Airlines
    case "SQ":
      return `https://www.singaporeair.com/en_UK/plan-and-book/search-for-flights/?from=${origin}&to=${destination}&departDate=${d}${mo}${y}&cabinClass=Y&adults=${adults}&type=one-way`;

    // Cathay Pacific
    case "CX":
      return `https://www.cathaypacific.com/cx/en_HK/book-a-trip/flights.html?from=${origin}&to=${destination}&date=${date}&adults=${adults}`;

    // Korean Air
    case "KE":
      return `https://www.koreanair.com/booking/search?tripType=OW&departureAirport=${origin}&arrivalAirport=${destination}&departureDate=${date}&paxCount=${adults}`;

    // Thai Airways
    case "TG":
      return `https://www.thaiairways.com/en/booking/flight-search.page?from=${origin}&to=${destination}&date=${date}&adults=${adults}`;

    // Emirates
    case "EK":
      return `https://www.emirates.com/flights/search?departure=${origin}&arrival=${destination}&depDate=${date}&pax=a${adults}&class=economy`;

    // Qatar Airways
    case "QR":
      return `https://www.qatarairways.com/en/booking/book-flights.html?from=${origin}&to=${destination}&date=${date}&adults=${adults}`;

    // United
    case "UA":
      return `https://www.united.com/en/us/fsr/choose-flights?f=${origin}&t=${destination}&d=${date}&tt=1&at=1&sc=7&px=${adults}&taxng=1&newHP=True&clm=7&st=bestmatches`;

    // Delta
    case "DL":
      return `https://www.delta.com/flight-search/search?tripType=ONE_WAY&departureDate=${date}&originCity=${origin}&destinationCity=${destination}&paxCount=${adults}`;

    // American Airlines
    case "AA":
      return `https://www.aa.com/booking/search?tripType=OneWay&orig=${origin}&dest=${destination}&departDate=${date}&adult=${adults}`;

    // Lufthansa
    case "LH":
      return `https://www.lufthansa.com/us/en/flight-search?origin=${origin}&destination=${destination}&outbound-date=${date}&cabin-class=economy&adults=${adults}&trip-type=ONE_WAY`;

    // British Airways
    case "BA":
      return `https://www.britishairways.com/travel/book/public/en_gb?from=${origin}&to=${destination}&depDate=${date}&cabin=M&adult=${adults}&child=0&infant=0`;

    // Air France
    case "AF":
      return `https://www.airfrance.com/search/result?pax=${adults}ADT&cabinClass=ECONOMY&activeConnection=0&connections=${origin}%3E${destination}%3A${date}`;

    // Peach
    case "MM":
      return `https://www.flypeach.com/booking?from=${origin}&to=${destination}&date=${date}&adult=${adults}`;

    // Jetstar Japan
    case "GK":
      return `https://www.jetstar.com/jp/en/booking/select-flight?origin=${origin}&destination=${destination}&departuredate=${date}&adult=${adults}`;

    // Default: Google Flights with specific route
    default:
      return `https://www.google.com/travel/flights?q=Flights+from+${origin}+to+${destination}+on+${date}+${adults}+passengers`;
  }
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
