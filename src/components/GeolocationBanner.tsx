import React from 'react';

interface Props {
  error: string | null;
  errorCode: number | null;
  loading?: boolean;
  onRetry?: () => void;
  onPickOnMap?: () => void;
}

const GeolocationBanner: React.FC<Props> = ({ error, errorCode, loading, onRetry, onPickOnMap }) => {
  if (loading || !error) return null;

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm">
      <div className="flex gap-3">
        <span className="text-xl flex-shrink-0" aria-hidden>
          {errorCode === 1 ? '🚫' : '📍'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {errorCode === 1 ? 'Location permission denied' : 'Location unavailable'}
          </p>
          <p className="text-sm mt-1 text-red-800">{error}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-100"
              >
                Try again
              </button>
            )}
            {onPickOnMap && (
              <button
                type="button"
                onClick={onPickOnMap}
                className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Pick on map
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeolocationBanner;
