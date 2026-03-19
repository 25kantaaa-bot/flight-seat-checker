export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

/** Major airports worldwide - searchable by IATA, city, or name */
export const AIRPORTS: Airport[] = [
  // Japan
  { iata: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan" },
  { iata: "HND", name: "Haneda Airport", city: "Tokyo", country: "Japan" },
  { iata: "KIX", name: "Kansai International Airport", city: "Osaka", country: "Japan" },
  { iata: "ITM", name: "Itami Airport", city: "Osaka", country: "Japan" },
  { iata: "NGO", name: "Chubu Centrair International Airport", city: "Nagoya", country: "Japan" },
  { iata: "CTS", name: "New Chitose Airport", city: "Sapporo", country: "Japan" },
  { iata: "FUK", name: "Fukuoka Airport", city: "Fukuoka", country: "Japan" },
  { iata: "OKA", name: "Naha Airport", city: "Okinawa", country: "Japan" },
  { iata: "KOJ", name: "Kagoshima Airport", city: "Kagoshima", country: "Japan" },
  { iata: "HIJ", name: "Hiroshima Airport", city: "Hiroshima", country: "Japan" },
  { iata: "SDJ", name: "Sendai Airport", city: "Sendai", country: "Japan" },
  { iata: "KMJ", name: "Kumamoto Airport", city: "Kumamoto", country: "Japan" },
  { iata: "NGS", name: "Nagasaki Airport", city: "Nagasaki", country: "Japan" },
  { iata: "MYJ", name: "Matsuyama Airport", city: "Matsuyama", country: "Japan" },
  { iata: "TAK", name: "Takamatsu Airport", city: "Takamatsu", country: "Japan" },
  { iata: "KMQ", name: "Komatsu Airport", city: "Kanazawa", country: "Japan" },
  { iata: "OIT", name: "Oita Airport", city: "Oita", country: "Japan" },
  { iata: "MMJ", name: "Matsumoto Airport", city: "Matsumoto", country: "Japan" },
  { iata: "AOJ", name: "Aomori Airport", city: "Aomori", country: "Japan" },
  { iata: "AKJ", name: "Asahikawa Airport", city: "Asahikawa", country: "Japan" },
  { iata: "ISG", name: "Ishigaki Airport", city: "Ishigaki", country: "Japan" },
  { iata: "MMY", name: "Miyako Airport", city: "Miyako", country: "Japan" },

  // Southeast Asia
  { iata: "SIN", name: "Changi Airport", city: "Singapore", country: "Singapore" },
  { iata: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
  { iata: "DMK", name: "Don Mueang Airport", city: "Bangkok", country: "Thailand" },
  { iata: "HKT", name: "Phuket International Airport", city: "Phuket", country: "Thailand" },
  { iata: "CNX", name: "Chiang Mai Airport", city: "Chiang Mai", country: "Thailand" },
  { iata: "KUL", name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia" },
  { iata: "MNL", name: "Ninoy Aquino International Airport", city: "Manila", country: "Philippines" },
  { iata: "CEB", name: "Mactan-Cebu International Airport", city: "Cebu", country: "Philippines" },
  { iata: "CGK", name: "Soekarno-Hatta International Airport", city: "Jakarta", country: "Indonesia" },
  { iata: "DPS", name: "Ngurah Rai Airport", city: "Bali", country: "Indonesia" },
  { iata: "SGN", name: "Tan Son Nhat Airport", city: "Ho Chi Minh City", country: "Vietnam" },
  { iata: "HAN", name: "Noi Bai Airport", city: "Hanoi", country: "Vietnam" },
  { iata: "DAD", name: "Da Nang Airport", city: "Da Nang", country: "Vietnam" },
  { iata: "RGN", name: "Yangon Airport", city: "Yangon", country: "Myanmar" },
  { iata: "PNH", name: "Phnom Penh Airport", city: "Phnom Penh", country: "Cambodia" },
  { iata: "REP", name: "Siem Reap Airport", city: "Siem Reap", country: "Cambodia" },
  { iata: "VTE", name: "Wattay Airport", city: "Vientiane", country: "Laos" },

  // East Asia
  { iata: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea" },
  { iata: "GMP", name: "Gimpo International Airport", city: "Seoul", country: "South Korea" },
  { iata: "PUS", name: "Gimhae International Airport", city: "Busan", country: "South Korea" },
  { iata: "CJU", name: "Jeju International Airport", city: "Jeju", country: "South Korea" },
  { iata: "PEK", name: "Beijing Capital Airport", city: "Beijing", country: "China" },
  { iata: "PKX", name: "Beijing Daxing Airport", city: "Beijing", country: "China" },
  { iata: "PVG", name: "Shanghai Pudong Airport", city: "Shanghai", country: "China" },
  { iata: "SHA", name: "Shanghai Hongqiao Airport", city: "Shanghai", country: "China" },
  { iata: "CAN", name: "Guangzhou Baiyun Airport", city: "Guangzhou", country: "China" },
  { iata: "SZX", name: "Shenzhen Bao'an Airport", city: "Shenzhen", country: "China" },
  { iata: "CTU", name: "Chengdu Tianfu Airport", city: "Chengdu", country: "China" },
  { iata: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong" },
  { iata: "TPE", name: "Taiwan Taoyuan Airport", city: "Taipei", country: "Taiwan" },
  { iata: "TSA", name: "Taipei Songshan Airport", city: "Taipei", country: "Taiwan" },
  { iata: "KHH", name: "Kaohsiung Airport", city: "Kaohsiung", country: "Taiwan" },
  { iata: "MFM", name: "Macau International Airport", city: "Macau", country: "Macau" },
  { iata: "UBN", name: "Chinggis Khaan Airport", city: "Ulaanbaatar", country: "Mongolia" },

  // South Asia
  { iata: "DEL", name: "Indira Gandhi Airport", city: "Delhi", country: "India" },
  { iata: "BOM", name: "Chhatrapati Shivaji Airport", city: "Mumbai", country: "India" },
  { iata: "BLR", name: "Kempegowda Airport", city: "Bangalore", country: "India" },
  { iata: "CMB", name: "Bandaranaike Airport", city: "Colombo", country: "Sri Lanka" },
  { iata: "KTM", name: "Tribhuvan Airport", city: "Kathmandu", country: "Nepal" },
  { iata: "DAC", name: "Hazrat Shahjalal Airport", city: "Dhaka", country: "Bangladesh" },
  { iata: "MLE", name: "Velana International Airport", city: "Male", country: "Maldives" },

  // Oceania
  { iata: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia" },
  { iata: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia" },
  { iata: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia" },
  { iata: "PER", name: "Perth Airport", city: "Perth", country: "Australia" },
  { iata: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand" },
  { iata: "CHC", name: "Christchurch Airport", city: "Christchurch", country: "New Zealand" },
  { iata: "NAN", name: "Nadi International Airport", city: "Nadi", country: "Fiji" },
  { iata: "GUM", name: "Antonio B. Won Pat Airport", city: "Guam", country: "Guam" },
  { iata: "PPT", name: "Faa'a International Airport", city: "Tahiti", country: "French Polynesia" },
  { iata: "APW", name: "Faleolo Airport", city: "Apia", country: "Samoa" },
  { iata: "SPN", name: "Saipan Airport", city: "Saipan", country: "Northern Mariana Islands" },

  // North America
  { iata: "JFK", name: "John F. Kennedy Airport", city: "New York", country: "USA" },
  { iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA" },
  { iata: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "USA" },
  { iata: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "USA" },
  { iata: "ATL", name: "Hartsfield-Jackson Airport", city: "Atlanta", country: "USA" },
  { iata: "DFW", name: "Dallas/Fort Worth Airport", city: "Dallas", country: "USA" },
  { iata: "DEN", name: "Denver International Airport", city: "Denver", country: "USA" },
  { iata: "SEA", name: "Seattle-Tacoma Airport", city: "Seattle", country: "USA" },
  { iata: "MIA", name: "Miami International Airport", city: "Miami", country: "USA" },
  { iata: "EWR", name: "Newark Liberty Airport", city: "Newark", country: "USA" },
  { iata: "IAD", name: "Dulles International Airport", city: "Washington D.C.", country: "USA" },
  { iata: "BOS", name: "Logan International Airport", city: "Boston", country: "USA" },
  { iata: "LAS", name: "Harry Reid Airport", city: "Las Vegas", country: "USA" },
  { iata: "PHX", name: "Phoenix Sky Harbor Airport", city: "Phoenix", country: "USA" },
  { iata: "IAH", name: "George Bush Airport", city: "Houston", country: "USA" },
  { iata: "MSP", name: "Minneapolis-Saint Paul Airport", city: "Minneapolis", country: "USA" },
  { iata: "DTW", name: "Detroit Metropolitan Airport", city: "Detroit", country: "USA" },
  { iata: "HNL", name: "Daniel K. Inouye Airport", city: "Honolulu", country: "USA" },
  { iata: "OGG", name: "Kahului Airport", city: "Maui", country: "USA" },
  { iata: "ANC", name: "Ted Stevens Airport", city: "Anchorage", country: "USA" },
  { iata: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "Canada" },
  { iata: "YYZ", name: "Toronto Pearson Airport", city: "Toronto", country: "Canada" },
  { iata: "YUL", name: "Montreal-Trudeau Airport", city: "Montreal", country: "Canada" },
  { iata: "MEX", name: "Mexico City Airport", city: "Mexico City", country: "Mexico" },
  { iata: "CUN", name: "Cancun International Airport", city: "Cancun", country: "Mexico" },

  // Europe
  { iata: "LHR", name: "Heathrow Airport", city: "London", country: "UK" },
  { iata: "LGW", name: "Gatwick Airport", city: "London", country: "UK" },
  { iata: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
  { iata: "ORY", name: "Orly Airport", city: "Paris", country: "France" },
  { iata: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { iata: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
  { iata: "AMS", name: "Schiphol Airport", city: "Amsterdam", country: "Netherlands" },
  { iata: "FCO", name: "Fiumicino Airport", city: "Rome", country: "Italy" },
  { iata: "MXP", name: "Malpensa Airport", city: "Milan", country: "Italy" },
  { iata: "MAD", name: "Adolfo Suarez Airport", city: "Madrid", country: "Spain" },
  { iata: "BCN", name: "El Prat Airport", city: "Barcelona", country: "Spain" },
  { iata: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland" },
  { iata: "VIE", name: "Vienna Airport", city: "Vienna", country: "Austria" },
  { iata: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark" },
  { iata: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "Sweden" },
  { iata: "OSL", name: "Oslo Gardermoen Airport", city: "Oslo", country: "Norway" },
  { iata: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland" },
  { iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  { iata: "ATH", name: "Athens International Airport", city: "Athens", country: "Greece" },
  { iata: "LIS", name: "Lisbon Airport", city: "Lisbon", country: "Portugal" },
  { iata: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland" },
  { iata: "PRG", name: "Vaclav Havel Airport", city: "Prague", country: "Czech Republic" },
  { iata: "BUD", name: "Budapest Airport", city: "Budapest", country: "Hungary" },
  { iata: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland" },
  { iata: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium" },
  { iata: "EDI", name: "Edinburgh Airport", city: "Edinburgh", country: "UK" },
  { iata: "MAN", name: "Manchester Airport", city: "Manchester", country: "UK" },

  // Middle East
  { iata: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE" },
  { iata: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "UAE" },
  { iata: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar" },
  { iata: "JED", name: "King Abdulaziz Airport", city: "Jeddah", country: "Saudi Arabia" },
  { iata: "RUH", name: "King Khalid Airport", city: "Riyadh", country: "Saudi Arabia" },
  { iata: "TLV", name: "Ben Gurion Airport", city: "Tel Aviv", country: "Israel" },
  { iata: "BAH", name: "Bahrain International Airport", city: "Bahrain", country: "Bahrain" },
  { iata: "MCT", name: "Muscat International Airport", city: "Muscat", country: "Oman" },

  // Africa
  { iata: "JNB", name: "O.R. Tambo Airport", city: "Johannesburg", country: "South Africa" },
  { iata: "CPT", name: "Cape Town International Airport", city: "Cape Town", country: "South Africa" },
  { iata: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt" },
  { iata: "NBO", name: "Jomo Kenyatta Airport", city: "Nairobi", country: "Kenya" },
  { iata: "ADD", name: "Bole International Airport", city: "Addis Ababa", country: "Ethiopia" },
  { iata: "CMN", name: "Mohammed V Airport", city: "Casablanca", country: "Morocco" },
  { iata: "LOS", name: "Murtala Muhammed Airport", city: "Lagos", country: "Nigeria" },
  { iata: "DAR", name: "Julius Nyerere Airport", city: "Dar es Salaam", country: "Tanzania" },

  // South America
  { iata: "GRU", name: "Guarulhos Airport", city: "Sao Paulo", country: "Brazil" },
  { iata: "GIG", name: "Galeao Airport", city: "Rio de Janeiro", country: "Brazil" },
  { iata: "EZE", name: "Ministro Pistarini Airport", city: "Buenos Aires", country: "Argentina" },
  { iata: "SCL", name: "Arturo Merino Benitez Airport", city: "Santiago", country: "Chile" },
  { iata: "BOG", name: "El Dorado Airport", city: "Bogota", country: "Colombia" },
  { iata: "LIM", name: "Jorge Chavez Airport", city: "Lima", country: "Peru" },
];

/** Search airports by query (IATA code, city, name, or country) */
export function searchAirports(query: string, limit = 8): Airport[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Exact IATA match first
  const exactMatch = AIRPORTS.filter((a) => a.iata.toLowerCase() === q);
  if (exactMatch.length > 0) return exactMatch.slice(0, limit);

  // Then partial matches, prioritizing IATA starts-with, then city starts-with
  const results: Airport[] = [];
  const seen = new Set<string>();

  // IATA starts with
  for (const a of AIRPORTS) {
    if (a.iata.toLowerCase().startsWith(q) && !seen.has(a.iata)) {
      results.push(a);
      seen.add(a.iata);
    }
  }

  // City starts with
  for (const a of AIRPORTS) {
    if (a.city.toLowerCase().startsWith(q) && !seen.has(a.iata)) {
      results.push(a);
      seen.add(a.iata);
    }
  }

  // Contains match (city, name, country)
  for (const a of AIRPORTS) {
    if (
      !seen.has(a.iata) &&
      (a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q))
    ) {
      results.push(a);
      seen.add(a.iata);
    }
  }

  return results.slice(0, limit);
}
