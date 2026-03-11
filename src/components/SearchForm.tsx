"use client";

import { useState } from "react";
import type { SearchParams, TripType } from "@/lib/types";

interface Props {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const CABIN_OPTIONS = [
  { value: "ALL", label: "All Cabins" },
  { value: "ECONOMY", label: "Economy" },
  { value: "PREMIUM_ECONOMY", label: "Premium Economy" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First" },
];

export default function SearchForm({ onSearch, isLoading }: Props) {
  const [tripType, setTripType] = useState<TripType>("oneway");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [cabinClass, setCabinClass] = useState("ALL");

  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      tripType,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      adults,
      cabinClass,
    });
  }

  function swapCities() {
    setOrigin(destination);
    setDestination(origin);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
    >
      {/* Trip type toggle + cabin class row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Trip type toggle */}
        <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
          <button
            type="button"
            onClick={() => setTripType("oneway")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              tripType === "oneway"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            One way
          </button>
          <button
            type="button"
            onClick={() => setTripType("roundtrip")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              tripType === "roundtrip"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Round trip
          </button>
        </div>

        {/* Cabin class */}
        <select
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {CABIN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Passengers */}
        <select
          id="adults"
          value={adults}
          onChange={(e) => setAdults(Number(e.target.value))}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "passenger" : "passengers"}
            </option>
          ))}
        </select>
      </div>

      {/* Main search fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_1fr] gap-3 items-end">
        {/* Origin */}
        <div>
          <label
            htmlFor="origin"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From
          </label>
          <input
            id="origin"
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. NRT"
            maxLength={3}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase placeholder:normal-case text-gray-900"
          />
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={swapCities}
          className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors self-end mb-1"
          title="Swap cities"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>

        {/* Destination */}
        <div>
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            To
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. SIN"
            maxLength={3}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase placeholder:normal-case text-gray-900"
          />
        </div>

        {/* Departure date */}
        <div>
          <label
            htmlFor="departureDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Departure
          </label>
          <input
            id="departureDate"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={today}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Return date (only for round trip) */}
        {tripType === "roundtrip" && (
          <div>
            <label
              htmlFor="returnDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Return
            </label>
            <input
              id="returnDate"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={departureDate || today}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Searching...
            </span>
          ) : (
            "Search Flights"
          )}
        </button>
      </div>
    </form>
  );
}
