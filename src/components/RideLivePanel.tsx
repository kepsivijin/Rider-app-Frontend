import React from 'react';
import { formatEta } from '../services/routing';

interface RideLivePanelProps {
  status: string;
  etaMin: number | null;
  distanceKm: number | null;
  loading?: boolean;
  driverLive?: boolean;
  customerLive?: boolean;
}

const RideLivePanel: React.FC<RideLivePanelProps> = ({
  status,
  etaMin,
  distanceKm,
  loading,
  driverLive,
  customerLive,
}) => {
  const headline: Record<string, string> = {
    requested: 'Finding a driver…',
    accepted: 'Driver coming to pickup',
    started: 'Heading to dropoff',
    completed: 'Ride completed',
  };

  return (
    <div className="p-4 bg-black text-white rounded-2xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-sm">{headline[status] || status}</p>
        <div className="flex gap-2 text-[10px]">
          {driverLive && (
            <span className="bg-green-500/30 text-green-200 px-2 py-0.5 rounded-full">🚗 Driver live</span>
          )}
          {customerLive && (
            <span className="bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full">📍 You live</span>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Calculating route on roads…</p>
      ) : etaMin != null && distanceKm != null ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-gray-400">ETA</p>
            <p className="text-2xl font-bold">{formatEta(etaMin)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-gray-400">On roads</p>
            <p className="text-2xl font-bold">{distanceKm.toFixed(1)} km</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-sm">Waiting for location…</p>
      )}

      <p className="text-[11px] text-gray-500">Route follows village roads · updates as you move</p>
    </div>
  );
};

export default RideLivePanel;
