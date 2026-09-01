import { useEffect, useState } from 'react';
import { useWatchGeolocation } from './useGeolocation';
import { useWebSocket } from './useWebSocket';
import { useSimulatedDriverMovement } from './useSimulatedDriverMovement';
import { LatLng } from '../services/routing';

/** Broadcast driver GPS (real + demo simulation along road route for testing). */
export function useDriverLocationBroadcast(
  rideId: string | null,
  enabled: boolean,
  roadRoute?: LatLng[],
  rideStatus?: string
) {
  const geo = useWatchGeolocation(enabled);
  const { emitDriverLocation } = useWebSocket(rideId, undefined, undefined, 'driver');
  const [simPosition, setSimPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Demo: always animate along road route when active (rural testing without real GPS)
  const simulating = enabled && !!roadRoute?.length && !!rideStatus;

  useSimulatedDriverMovement(roadRoute, rideStatus, simulating, (lat, lng) => {
    setSimPosition({ lat, lng });
    emitDriverLocation(lat, lng);
  });

  useEffect(() => {
    if (!simulating) setSimPosition(null);
  }, [simulating, rideStatus]);

  // Also send real GPS when available (overrides display if moving)
  useEffect(() => {
    if (!enabled || !rideId || geo.latitude == null || geo.longitude == null) return;

    emitDriverLocation(geo.latitude, geo.longitude);
    const interval = setInterval(() => {
      if (geo.latitude != null && geo.longitude != null) {
        emitDriverLocation(geo.latitude, geo.longitude);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [enabled, rideId, geo.latitude, geo.longitude, emitDriverLocation]);

  const latitude = simulating ? (simPosition?.lat ?? geo.latitude) : geo.latitude ?? simPosition?.lat ?? null;
  const longitude = simulating ? (simPosition?.lng ?? geo.longitude) : geo.longitude ?? simPosition?.lng ?? null;

  return { ...geo, latitude, longitude, simulating };
}
