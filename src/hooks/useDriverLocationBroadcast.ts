import { useEffect } from 'react';
import { useWatchGeolocation } from './useGeolocation';
import { useWebSocket } from './useWebSocket';

/** Broadcast real driver GPS when available. */
export function useDriverLocationBroadcast(rideId: string | null, enabled: boolean) {
  const geo = useWatchGeolocation(enabled);
  const { emitDriverLocation } = useWebSocket(rideId, undefined, undefined, 'driver');

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

  return geo;
}
