import React from 'react';

type Field = 'pickup' | 'dropoff';

interface MapSelectionBarProps {
  activeField: Field;
  onSelectField: (field: Field) => void;
}

const MapSelectionBar: React.FC<MapSelectionBarProps> = ({ activeField, onSelectField }) => (
  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-gray-200 p-1.5">
    <button
      type="button"
      onClick={() => onSelectField('pickup')}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
        activeField === 'pickup' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      📍 Set Pickup (A)
    </button>
    <button
      type="button"
      onClick={() => onSelectField('dropoff')}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
        activeField === 'dropoff' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      🎯 Set Dropoff (B)
    </button>
  </div>
);

export default MapSelectionBar;
