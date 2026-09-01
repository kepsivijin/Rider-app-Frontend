import { useEffect } from 'react';
import { useWatchGeolocation } from './useGeolocation';
import { useWebSocket } from './useWebSocket';

/** Broadcast driver GPS to ride room while active ride is in progress. */
export function useDriverLocationBroadcast(rideId: string | null, enabled: boolean) {
  const geo = useWatchGeolocation(enabled);
  const { emitDriverLocation } = useWebSocket(rideId, () => {}, 'driver');

  useEffect(() => {
    if (!enabled || !rideId || geo.latitude == null || geo.longitude == null) return;

    emitDriverLocation(geo.latitude, geo.longitude);
    const interval = setInterval(() => {
      if (geo.latitude != null && geo.longitude != null) {
        emitDriverLocation(geo.latitude, geo.longitude);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [enabled, rideId, geo.latitude, geo.longitude, emitDriverLocation]);

  return geo;
}
