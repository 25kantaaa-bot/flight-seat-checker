"use client";

import { useState, useEffect } from "react";
import SearchForm from "@/components/SearchForm";
import FlightResults from "@/components/FlightResults";
import type { SearchParams, FlightOffer } from "@/lib/types";

export default function Home() {
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  // Fetch FX rate on mount
  useEffect(() => {
    fetch("/api/fx")
      .then((res) => res.json())
      .then((data) => {
        if (data.rate) setFxRate(data.rate);
      })
      .catch(() => setFxRate(150)); // fallback
  }, []);

  async function handleSearch(params: SearchParams) {
    setIsLoading(true);
    setError(null);
    setFlights([]);
    setHasSearched(true);
    setSearchParams(params);

    try {
      const queryObj: Record<string, string> = {
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        adults: String(params.adults),
        cabinClass: params.cabinClass,
      };

      if (params.returnDate) {
        queryObj.returnDate = params.returnDate;
      }

      const query = new URLSearchParams(queryObj);
      const res = await fetch(`/api/search?${query}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setFlights(data.flights);
    } catch {
      setError(
        "Failed to fetch flight data. Please check your network connection."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      {/* Hero Section — Google Flights style */}
      {!hasSearched && (
        <div className="relative overflow-hidden">
          {/* Background illustration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Pop art style decorative elements */}
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-yellow-300/30 to-orange-400/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-400/20 to-cyan-300/30 blur-3xl" />
            <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-gradient-to-br from-pink-300/20 to-purple-400/15 blur-2xl" />

            {/* Dotted pattern (pop art) */}
            <svg className="absolute top-10 right-10 w-64 h-64 opacity-[0.06]" viewBox="0 0 200 200">
              {Array.from({ length: 100 }).map((_, i) => (
                <circle key={i} cx={(i % 10) * 20 + 10} cy={Math.floor(i / 10) * 20 + 10} r="3" fill="currentColor" className="text-blue-900" />
              ))}
            </svg>
            <svg className="absolute bottom-20 left-10 w-48 h-48 opacity-[0.06]" viewBox="0 0 200 200">
              {Array.from({ length: 64 }).map((_, i) => (
                <circle key={i} cx={(i % 8) * 25 + 12} cy={Math.floor(i / 8) * 25 + 12} r="4" fill="currentColor" className="text-orange-600" />
              ))}
            </svg>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                {/* Pop art burst background */}
                <svg className="absolute -inset-6 w-[calc(100%+48px)] h-[calc(100%+48px)]" viewBox="0 0 120 120" fill="none">
                  <polygon points="60,2 72,40 110,40 78,62 88,100 60,78 32,100 42,62 10,40 48,40" fill="url(#burst-gradient)" opacity="0.15" />
                  <defs>
                    <linearGradient id="burst-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Main logo */}
                <div className="relative flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 rotate-[-3deg]">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    {/* Pop art accent dot */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-sm" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      <span className="text-gray-900">Flight</span>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent"> Seat</span>
                      <span className="text-gray-900"> Checker</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-0.5 w-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" />
                      <p className="text-sm text-gray-500 font-medium">
                        Compare seat availability across airlines
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel illustration */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <svg className="w-full max-w-lg h-32 sm:h-40" viewBox="0 0 500 160" fill="none">
                  {/* Sky gradient */}
                  <defs>
                    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DBEAFE" />
                      <stop offset="100%" stopColor="#EFF6FF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="500" height="120" fill="url(#sky)" rx="16" />

                  {/* Clouds */}
                  <ellipse cx="80" cy="50" rx="40" ry="18" fill="white" opacity="0.8" />
                  <ellipse cx="60" cy="45" rx="25" ry="15" fill="white" opacity="0.9" />
                  <ellipse cx="100" cy="45" rx="25" ry="15" fill="white" opacity="0.9" />

                  <ellipse cx="350" cy="35" rx="35" ry="15" fill="white" opacity="0.7" />
                  <ellipse cx="335" cy="30" rx="22" ry="12" fill="white" opacity="0.8" />
                  <ellipse cx="370" cy="32" rx="20" ry="11" fill="white" opacity="0.8" />

                  <ellipse cx="220" cy="25" rx="25" ry="10" fill="white" opacity="0.6" />

                  {/* Airplane path (dashed arc) */}
                  <path d="M 80 100 Q 250 20 420 100" stroke="#93C5FD" strokeWidth="2" strokeDasharray="8 4" fill="none" />

                  {/* Departure city */}
                  <rect x="50" y="105" width="60" height="35" rx="4" fill="#E0E7FF" />
                  <rect x="60" y="100" width="12" height="5" rx="1" fill="#A5B4FC" />
                  <rect x="78" y="98" width="8" height="7" rx="1" fill="#818CF8" />
                  <rect x="55" y="115" width="20" height="10" rx="1" fill="#C7D2FE" />
                  <rect x="85" y="110" width="15" height="15" rx="1" fill="#C7D2FE" />

                  {/* Destination city */}
                  <rect x="390" y="100" width="60" height="40" rx="4" fill="#FEE2E2" />
                  <rect x="395" y="95" width="15" height="5" rx="1" fill="#FCA5A5" />
                  <rect x="420" y="93" width="10" height="7" rx="1" fill="#F87171" />
                  <rect x="440" y="97" width="8" height="3" rx="1" fill="#FECACA" />
                  <rect x="395" y="115" width="25" height="12" rx="1" fill="#FECACA" />
                  <rect x="425" y="110" width="18" height="17" rx="1" fill="#FECACA" />

                  {/* Airplane icon */}
                  <g transform="translate(248, 48) rotate(-15)">
                    <path d="M0 4 L16 0 L14 4 L16 8 L0 4Z" fill="#3B82F6" />
                    <path d="M4 0 L8 3 L4 3Z" fill="#2563EB" />
                    <path d="M4 5 L8 5 L4 8Z" fill="#2563EB" />
                  </g>
                </svg>
              </div>
            </div>

            {/* FX rate badge */}
            {fxRate && (
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-full px-3 py-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  1 USD = {fxRate.toFixed(1)} JPY
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compact header when results are showing */}
      {hasSearched && (
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm rotate-[-3deg]">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h1 className="text-lg font-bold text-gray-900">
                  Flight <span className="text-blue-600">Seat</span> Checker
                </h1>
              </div>
              {fxRate && (
                <span className="text-xs text-gray-400">
                  1 USD = {fxRate.toFixed(1)} JPY
                </span>
              )}
            </div>
          </div>
        </header>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Form */}
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg
              className="h-5 w-5 text-red-500 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
            </div>
            <p className="mt-4 text-gray-500 text-sm">
              Searching for flights...
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && !error && (
          <FlightResults
            flights={flights}
            fxRate={fxRate}
            searchParams={searchParams}
          />
        )}

        {/* Initial tip text (below search form on hero) */}
        {!hasSearched && (
          <div className="text-center pb-8">
            <p className="text-gray-400 text-sm">
              Enter 3-letter IATA airport codes (e.g. NRT, SIN, LAX) and search to compare seat availability
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
