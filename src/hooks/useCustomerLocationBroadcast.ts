import { useEffect } from 'react';
import { useWatchGeolocation } from './useGeolocation';
import { useWebSocket } from './useWebSocket';

/** Broadcast customer GPS to driver during active ride. */
export function useCustomerLocationBroadcast(rideId: string | null, enabled: boolean) {
  const geo = useWatchGeolocation(enabled);
  const { emitCustomerLocation } = useWebSocket(rideId, undefined, undefined, 'customer');

  useEffect(() => {
    if (!enabled || !rideId || geo.latitude == null || geo.longitude == null) return;

    emitCustomerLocation(geo.latitude, geo.longitude);
    const interval = setInterval(() => {
      if (geo.latitude != null && geo.longitude != null) {
        emitCustomerLocation(geo.latitude, geo.longitude);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [enabled, rideId, geo.latitude, geo.longitude, emitCustomerLocation]);

  return geo;
}
