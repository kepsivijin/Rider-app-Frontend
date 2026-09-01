import React from 'react';

interface Props {
  onMyLocation?: () => void;
  onFitRoute?: () => void;
  locating?: boolean;
  showFitRoute?: boolean;
}

const MapControls: React.FC<Props> = ({ onMyLocation, onFitRoute, locating, showFitRoute }) => (
  <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
    {onMyLocation && (
      <button
        type="button"
        onClick={onMyLocation}
        disabled={locating}
        title="Use my location"
        className="w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-60"
      >
        {locating ? (
          <span className="w-5 h-5 border-2 border-gray-400 border-t-primary rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )}
      </button>
    )}
    {showFitRoute && onFitRoute && (
      <button
        type="button"
        onClick={onFitRoute}
        title="Fit route on map"
        className="w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-lg"
      >
        🗺
      </button>
    )}
  </div>
);

export default MapControls;
