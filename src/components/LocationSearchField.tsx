import React, { useEffect, useRef, useState } from 'react';
import { AddressResult, searchAddress } from '../utils/format';

interface LocationSearchFieldProps {
  value: string;
  placeholder: string;
  active: boolean;
  icon: React.ReactNode;
  onFocus: () => void;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
  trailing?: React.ReactNode;
}

const LocationSearchField: React.FC<LocationSearchFieldProps> = ({
  value,
  placeholder,
  active,
  icon,
  onFocus,
  onChange,
  onSelect,
  trailing,
}) => {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [searching, setSearching] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        setSuggestions(await searchAddress(value));
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={`relative flex items-center gap-3 rounded-xl border-2 bg-gray-50 px-4 py-3 transition ${
          active ? 'border-black ring-2 ring-black/10' : 'border-gray-200'
        }`}
      >
        {icon}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-gray-400"
        />
        {trailing}
      </div>

      {(suggestions.length > 0 || searching) && active && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {searching && suggestions.length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-500">Searching addresses…</p>
          )}
          {suggestions.map((item) => (
            <button
              key={`${item.lat}-${item.lng}-${item.address}`}
              type="button"
              onClick={() => {
                onSelect(item);
                setSuggestions([]);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <p className="text-sm font-medium text-gray-900 truncate">{item.address}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {item.source === 'local' ? 'Village in service area' : 'OpenStreetMap'}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearchField;
