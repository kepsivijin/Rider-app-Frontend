import React from 'react';

type Field = 'pickup' | 'dropoff';

interface MapSelectionBarProps {
  activeField: Field;
  onSelectField: (field: Field) => void;
  onUseMyLocation?: () => void;
  locating?: boolean;
}

const MapSelectionBar: React.FC<MapSelectionBarProps> = ({
  activeField,
  onSelectField,
  onUseMyLocation,
  locating,
}) => (
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-wrap justify-center gap-2 bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-gray-200 p-1.5 max-w-[95vw]">
    {onUseMyLocation && (
      <button
        type="button"
        onClick={onUseMyLocation}
        disabled={locating}
        className="px-4 py-2 rounded-xl text-sm font-semibold transition bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {locating ? 'Locating…' : '📍 My location'}
      </button>
    )}
    <button
      type="button"
      onClick={() => onSelectField('pickup')}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
        activeField === 'pickup' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      Set Pickup (A)
    </button>
    <button
      type="button"
      onClick={() => onSelectField('dropoff')}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
        activeField === 'dropoff' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      Set Dropoff (B)
    </button>
  </div>
);

export default MapSelectionBar;
