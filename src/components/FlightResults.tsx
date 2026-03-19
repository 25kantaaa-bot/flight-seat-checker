"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  FlightOffer,
  SortField,
  SortDirection,
  CabinAvailability,
  SearchParams,
} from "@/lib/types";
import { getBookingLinks } from "@/lib/booking";

/* ================================================================
   Props
   ================================================================ */

interface Props {
  flights: FlightOffer[];
  fxRate: number | null;
  searchParams: SearchParams | null;
}

/* ================================================================
   Helpers
   ================================================================ */

/**
 * Format time from "YYYY-MM-DDTHH:MM" → "HH:MM"
 * We do NOT use new Date() to avoid timezone conversion —
 * the time is already in the airport's local timezone.
 */
function fmtTime(timeStr: string): string {
  const match = timeStr.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : timeStr;
}

/**
 * Format date from "YYYY-MM-DDTHH:MM" → "Mar 25" etc.
 * Parse manually to avoid timezone shifts.
 */
function fmtDate(timeStr: string): string {
  const match = timeStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return timeStr;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = months[parseInt(match[2]) - 1] || match[2];
  const day = parseInt(match[3]);
  return `${month} ${day}`;
}

function usd(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function jpy(n: number, rate: number): string {
  return "¥" + Math.round(n * rate).toLocaleString("en-US");
}

/* ================================================================
   Small UI atoms
   ================================================================ */

function SeatBadge({ seats }: { seats: number | null }) {
  if (seats === null) {
    // Google Flights doesn't show seat count when plenty of seats are available
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-600">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Seats available
      </span>
    );
  }
  if (seats === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
        Sold out
      </span>
    );
  }
  const label = seats >= 9 ? "9+" : String(seats);
  const urgent = seats <= 3;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        urgent
          ? "bg-orange-100 text-orange-700 animate-pulse"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      🔥 {label} left
    </span>
  );
}

function StopsBadge({ stops }: { stops: number }) {
  if (stops === 0)
    return <span className="text-green-600 font-medium text-sm">Direct</span>;
  return (
    <span className="text-orange-600 font-medium text-sm">
      {stops} stop{stops > 1 ? "s" : ""}
    </span>
  );
}

function CabinPills({
  cabins,
  rate,
}: {
  cabins: CabinAvailability[];
  rate: number | null;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {cabins.map((c) => {
        const priceNum = Number(c.price);
        return (
          <div
            key={c.cabin}
            className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
          >
            <span className="font-medium text-gray-700">{c.cabin}</span>
            <SeatBadge seats={c.seatsAvailable} />
            <span className="text-gray-500">
              {usd(priceNum)}
              {rate && (
                <span className="text-gray-400 ml-0.5">
                  ({jpy(priceNum, rate)})
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   Booking dropdown
   ================================================================ */

function BookingDropdown({
  flight,
  searchParams,
}: {
  flight: FlightOffer;
  searchParams: SearchParams | null;
}) {
  const [open, setOpen] = useState(false);

  if (!searchParams) return null;

  const links = getBookingLinks({
    origin: flight.departure,
    destination: flight.arrival,
    departureDate: flight.departureTime,
    returnDate: searchParams.returnDate,
    adults: searchParams.adults,
    cabinClass: flight.cabins[0]?.cabin,
    airlineCode: flight.airlineCode,
  });

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="text-xs font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2"
      >
        Book →
      </button>
      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-6 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-44">
            {links.map((l) => (
              <a
                key={l.name}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.name}
                <span className="text-gray-400 ml-1">↗</span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================================================================
   Sort arrow
   ================================================================ */

function SortArrow({
  field,
  current,
}: {
  field: SortField;
  current: { field: SortField; direction: SortDirection };
}) {
  if (current.field !== field)
    return <span className="text-gray-300 ml-1">↕</span>;
  return (
    <span className="text-blue-600 ml-1">
      {current.direction === "asc" ? "↑" : "↓"}
    </span>
  );
}

/* ================================================================
   Filter bar
   ================================================================ */

const ALL_CABINS = ["Economy", "Premium Econ", "Business", "First"];

function FilterBar({
  stopsFilter,
  setStopsFilter,
  cabinFilter,
  setCabinFilter,
  airlines,
  airlineFilter,
  setAirlineFilter,
}: {
  stopsFilter: string;
  setStopsFilter: (v: string) => void;
  cabinFilter: string;
  setCabinFilter: (v: string) => void;
  airlines: string[];
  airlineFilter: string;
  setAirlineFilter: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 md:px-6 py-3 border-b border-gray-100 bg-gray-50/50">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Filters
      </span>

      <select
        value={stopsFilter}
        onChange={(e) => setStopsFilter(e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All stops</option>
        <option value="direct">Direct only</option>
        <option value="1stop">1 stop max</option>
      </select>

      <select
        value={cabinFilter}
        onChange={(e) => setCabinFilter(e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All cabins</option>
        {ALL_CABINS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {airlines.length > 1 && (
        <select
          value={airlineFilter}
          onChange={(e) => setAirlineFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All airlines</option>
          {airlines.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

/* ================================================================
   Table header cell
   ================================================================ */

function ThSortable({
  children,
  field,
  sort,
  onSort,
  className = "",
}: {
  children: React.ReactNode;
  field: SortField;
  sort: { field: SortField; direction: SortDirection };
  onSort: (f: SortField) => void;
  className?: string;
}) {
  return (
    <th
      className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700 whitespace-nowrap ${className}`}
      onClick={() => onSort(field)}
    >
      {children}
      <SortArrow field={field} current={sort} />
    </th>
  );
}

/* ================================================================
   Desktop table
   ================================================================ */

function FlightTable({
  flights,
  sort,
  onSort,
  rate,
  searchParams,
}: {
  flights: FlightOffer[];
  sort: { field: SortField; direction: SortDirection };
  onSort: (f: SortField) => void;
  rate: number | null;
  searchParams: SearchParams | null;
}) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 text-left">
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Airline
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Flight
            </th>
            <ThSortable field="departure" sort={sort} onSort={onSort}>
              Departure
            </ThSortable>
            <ThSortable field="arrival" sort={sort} onSort={onSort}>
              Arrival
            </ThSortable>
            <ThSortable field="duration" sort={sort} onSort={onSort}>
              Duration
            </ThSortable>
            <ThSortable field="stops" sort={sort} onSort={onSort}>
              Stops
            </ThSortable>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Cabin &amp; Seats
            </th>
            <ThSortable
              field="price"
              sort={sort}
              onSort={onSort}
              className="text-right"
            >
              From
            </ThSortable>
            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16" />
          </tr>
        </thead>
        <tbody>
          {flights.map((f, idx) => (
            <tr
              key={`${f.flightNumber}-${f.departureTime}-${idx}`}
              className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors align-top"
            >
              <td className="py-4 px-4">
                <div className="font-medium text-gray-900 text-sm">
                  {f.airlineName}
                </div>
                <div className="text-xs text-gray-400">{f.airlineCode}</div>
              </td>
              <td className="py-4 px-4 font-mono text-sm text-gray-800">
                {f.flightNumber}
              </td>
              <td className="py-4 px-4">
                <div className="font-semibold text-gray-900">
                  {fmtTime(f.departureTime)}
                </div>
                <div className="text-xs text-gray-500">
                  {f.departure} · {fmtDate(f.departureTime)}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="font-semibold text-gray-900">
                  {fmtTime(f.arrivalTime)}
                </div>
                <div className="text-xs text-gray-500">
                  {f.arrival} · {fmtDate(f.arrivalTime)}
                </div>
              </td>
              <td className="py-4 px-4 text-sm text-gray-700">
                {f.duration}
              </td>
              <td className="py-4 px-4">
                <StopsBadge stops={f.stops} />
              </td>
              <td className="py-4 px-4">
                <CabinPills cabins={f.cabins} rate={rate} />
              </td>
              <td className="py-4 px-4 text-right">
                <div className="font-bold text-lg text-gray-900">
                  {usd(f.lowestPrice)}
                </div>
                {rate && (
                  <div className="text-xs text-gray-400">
                    {jpy(f.lowestPrice, rate)}
                  </div>
                )}
              </td>
              <td className="py-4 px-4 text-right">
                <BookingDropdown
                  flight={f}
                  searchParams={searchParams}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   Mobile cards
   ================================================================ */

function FlightCards({
  flights,
  rate,
  searchParams,
}: {
  flights: FlightOffer[];
  rate: number | null;
  searchParams: SearchParams | null;
}) {
  return (
    <div className="lg:hidden space-y-4 p-4">
      {flights.map((f, idx) => (
        <div
          key={`${f.flightNumber}-${f.departureTime}-${idx}`}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-gray-900">
                {f.airlineName}
              </div>
              <div className="text-sm text-gray-500 font-mono">
                {f.flightNumber}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl text-gray-900">
                {usd(f.lowestPrice)}
              </div>
              {rate && (
                <div className="text-xs text-gray-400">
                  {jpy(f.lowestPrice, rate)}
                </div>
              )}
              <div className="text-[11px] text-gray-400">from</div>
            </div>
          </div>

          {/* Times */}
          <div className="flex items-center gap-3 mb-3">
            <div className="text-center">
              <div className="font-bold text-lg text-gray-900">
                {fmtTime(f.departureTime)}
              </div>
              <div className="text-xs text-gray-500">{f.departure}</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">{f.duration}</div>
              <div className="w-full h-px bg-gray-300 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full" />
              </div>
              <div className="mt-1">
                <StopsBadge stops={f.stops} />
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-gray-900">
                {fmtTime(f.arrivalTime)}
              </div>
              <div className="text-xs text-gray-500">{f.arrival}</div>
            </div>
          </div>

          {/* Cabin pills */}
          <div className="pt-3 border-t border-gray-100">
            <CabinPills cabins={f.cabins} rate={rate} />
          </div>

          {/* Booking */}
          <div className="pt-3 mt-3 border-t border-gray-100 flex justify-end">
            <BookingDropdown flight={f} searchParams={searchParams} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   Main component
   ================================================================ */

export default function FlightResults({
  flights,
  fxRate,
  searchParams,
}: Props) {
  const [sort, setSort] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({ field: "departure", direction: "asc" });

  const [stopsFilter, setStopsFilter] = useState("all");
  const [cabinFilter, setCabinFilter] = useState("all");
  const [airlineFilter, setAirlineFilter] = useState("all");

  const toggleSort = useCallback(
    (field: SortField) => {
      setSort((prev) => ({
        field,
        direction:
          prev.field === field && prev.direction === "asc" ? "desc" : "asc",
      }));
    },
    []
  );

  // Unique airlines
  const airlineList = useMemo(() => {
    const set = new Set<string>();
    flights.forEach((f) => set.add(f.airlineName));
    return Array.from(set).sort();
  }, [flights]);

  // Filter + sort
  const processed = useMemo(() => {
    let result = flights.slice();

    // stops
    if (stopsFilter === "direct") result = result.filter((f) => f.stops === 0);
    else if (stopsFilter === "1stop")
      result = result.filter((f) => f.stops <= 1);

    // cabin: keep flights that offer the selected cabin
    if (cabinFilter !== "all") {
      result = result.filter((f) =>
        f.cabins.some((c) => c.cabin === cabinFilter)
      );
    }

    // airline
    if (airlineFilter !== "all") {
      result = result.filter((f) => f.airlineName === airlineFilter);
    }

    // sort
    const dir = sort.direction === "asc" ? 1 : -1;
    result.sort((a, b) => {
      let cmp = 0;
      switch (sort.field) {
        case "departure":
          cmp =
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime();
          break;
        case "arrival":
          cmp =
            new Date(a.arrivalTime).getTime() -
            new Date(b.arrivalTime).getTime();
          break;
        case "price":
          cmp = a.lowestPrice - b.lowestPrice;
          break;
        case "duration":
          cmp = a.durationMinutes - b.durationMinutes;
          break;
        case "stops":
          cmp = a.stops - b.stops;
          break;
      }
      return dir * cmp;
    });

    return result;
  }, [flights, stopsFilter, cabinFilter, airlineFilter, sort]);

  /* ─── empty state ─── */
  if (flights.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="text-lg font-medium">No flights found</p>
        <p className="text-sm mt-1">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Results</h2>
        <span className="text-sm text-gray-500">
          {processed.length} of {flights.length} flight
          {flights.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <FilterBar
        stopsFilter={stopsFilter}
        setStopsFilter={setStopsFilter}
        cabinFilter={cabinFilter}
        setCabinFilter={setCabinFilter}
        airlines={airlineList}
        airlineFilter={airlineFilter}
        setAirlineFilter={setAirlineFilter}
      />

      {/* Mobile sort */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Sort
        </span>
        <select
          value={`${sort.field}_${sort.direction}`}
          onChange={(e) => {
            const [f, d] = e.target.value.split("_") as [
              SortField,
              SortDirection,
            ];
            setSort({ field: f, direction: d });
          }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700"
        >
          <option value="departure_asc">Departure ↑</option>
          <option value="departure_desc">Departure ↓</option>
          <option value="arrival_asc">Arrival ↑</option>
          <option value="arrival_desc">Arrival ↓</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="duration_asc">Duration ↑</option>
          <option value="duration_desc">Duration ↓</option>
          <option value="stops_asc">Stops ↑</option>
          <option value="stops_desc">Stops ↓</option>
        </select>
      </div>

      {/* Content */}
      {processed.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          No flights match the selected filters.
        </div>
      ) : (
        <>
          <FlightTable
            flights={processed}
            sort={sort}
            onSort={toggleSort}
            rate={fxRate}
            searchParams={searchParams}
          />
          <FlightCards
            flights={processed}
            rate={fxRate}
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
}
