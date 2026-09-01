import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, MapPin, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { locationProvider } from '../../lib/locationProvider';
import { HospitalLocation } from '../../types';

interface HospitalSearchProps {
  selectedHospital: HospitalLocation | null;
  onSelectHospital: (hospital: HospitalLocation) => void;
  onClear?: () => void;
  className?: string;
  error?: string | null;
}

export const HospitalSearch: React.FC<HospitalSearchProps> = ({
  selectedHospital,
  onSelectHospital,
  onClear,
  className = '',
  error,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HospitalLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced hospital search with AbortController
  useEffect(() => {
    if (selectedHospital && query === selectedHospital.name) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    searchTimeoutRef.current = setTimeout(async () => {
      // Abort previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const data = await locationProvider.searchHospitals(query, controller.signal);
        setResults(data);
        setIsOpen(true);
        setHighlightedIndex(-1);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('[HospitalSearch] Search error:', err);
          setSearchError('Unable to search hospitals right now. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, selectedHospital]);

  const handleSelect = (hosp: HospitalLocation) => {
    onSelectHospital(hosp);
    setQuery(hosp.name);
    setIsOpen(false);
    setResults([]);
    setSearchError(null);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        handleSelect(results[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected Hospital Display */}
      {selectedHospital ? (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3 transition-all">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider bg-emerald-200/60 px-2 py-0.5 rounded-md">
                  Selected Medical Campus
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#1F3449] truncate mt-0.5">{selectedHospital.name}</h4>
              <p className="text-xs text-gray-600 truncate">{selectedHospital.address}</p>
              <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                GPS: {selectedHospital.latitude.toFixed(4)}, {selectedHospital.longitude.toFixed(4)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-bold text-gray-500 hover:text-[#E85D75] p-2 hover:bg-white rounded-xl transition-colors cursor-pointer shrink-0"
            title="Change selected hospital"
          >
            Change
          </button>
        </div>
      ) : (
        /* Autocomplete Search Input */
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && results.length > 0 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search hospital name, address, city, or area (e.g. NYU, Mount Sinai)..."
              className={`w-full text-xs pl-10 pr-10 py-3.5 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#E85D75] transition-all font-medium ${
                error ? 'border-rose-400 bg-rose-50/20' : 'border-gray-200'
              }`}
            />
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-[#E85D75] animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            ) : query ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {error && (
            <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 pl-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {searchError && (
            <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1 pl-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{searchError}</span>
            </p>
          )}
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && results.length > 0 && !selectedHospital && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden z-50 divide-y divide-gray-100 max-h-72 overflow-y-auto">
          <div className="px-3.5 py-2 bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-wider flex items-center justify-between">
            <span>Verified Healthcare Facilities</span>
            <span>OpenStreetMap</span>
          </div>

          {results.map((hosp, idx) => (
            <button
              key={`${hosp.providerPlaceId || hosp.name}-${idx}`}
              type="button"
              onClick={() => handleSelect(hosp)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                highlightedIndex === idx ? 'bg-rose-50/70' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-[#E85D75]/10 text-[#E85D75] flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-[#1F3449] truncate">{hosp.name}</span>
                  {hosp.category && (
                    <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                      {hosp.category}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">{hosp.address}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && query.trim().length >= 2 && !isLoading && !selectedHospital && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl p-6 text-center text-xs text-gray-500 z-50">
          <Building2 className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
          <p className="font-bold text-gray-700">No medical centers matched "{query}"</p>
          <p className="text-[11px] text-gray-400 mt-1">Try searching by hospital name or city (e.g. "NYU", "Mount Sinai", "Presbyterian").</p>
        </div>
      )}
    </div>
  );
};
