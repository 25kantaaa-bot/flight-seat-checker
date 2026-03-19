"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchAirports, type Airport } from "@/lib/airports";

interface Props {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (iata: string) => void;
}

export default function AirportInput({
  id,
  label,
  placeholder,
  value,
  onChange,
}: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.toUpperCase();
      setInputValue(val);
      onChange(val);

      if (val.length >= 1) {
        const results = searchAirports(val);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setHighlightIndex(-1);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    },
    [onChange]
  );

  const selectAirport = useCallback(
    (airport: Airport) => {
      setInputValue(airport.iata);
      onChange(airport.iata);
      setIsOpen(false);
      setSuggestions([]);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        selectAirport(suggestions[highlightIndex]);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [isOpen, highlightIndex, suggestions, selectAirport]
  );

  return (
    <div ref={wrapperRef} className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
        maxLength={3}
        required
        autoComplete="off"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase placeholder:normal-case text-gray-900"
      />

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((airport, idx) => (
            <button
              key={airport.iata}
              type="button"
              onClick={() => selectAirport(airport)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                idx === highlightIndex
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="flex-shrink-0 w-11 h-7 bg-blue-600 text-white rounded-md flex items-center justify-center text-xs font-bold tracking-wide">
                {airport.iata}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {airport.city}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {airport.name} · {airport.country}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
