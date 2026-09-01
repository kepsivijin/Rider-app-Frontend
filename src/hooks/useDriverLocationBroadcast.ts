import { useEffect, useState } from 'react';
import { useWatchGeolocation } from './useGeolocation';
import { useWebSocket } from './useWebSocket';
import { useSimulatedDriverMovement } from './useSimulatedDriverMovement';
import { LatLng } from '../services/routing';

/** Broadcast driver GPS (or demo simulation along road) to customer. */
export function useDriverLocationBroadcast(
  rideId: string | null,
  enabled: boolean,
  roadRoute?: LatLng[],
  rideStatus?: string
) {
  const geo = useWatchGeolocation(enabled);
  const { emitDriverLocation } = useWebSocket(rideId, undefined, undefined, 'driver');
  const [simPosition, setSimPosition] = useState<{ lat: number; lng: number } | null>(null);

  const simulating =
    enabled &&
    !!roadRoute?.length &&
    (geo.error != null || geo.latitude == null) &&
    (rideStatus === 'accepted' || rideStatus === 'started');

  useSimulatedDriverMovement(roadRoute, rideStatus, simulating, (lat, lng) => {
    setSimPosition({ lat, lng });
    emitDriverLocation(lat, lng);
  });

  useEffect(() => {
    if (!simulating) setSimPosition(null);
  }, [simulating, rideStatus]);

  useEffect(() => {
    if (!enabled || simulating || !rideId || geo.latitude == null || geo.longitude == null) return;

    emitDriverLocation(geo.latitude, geo.longitude);
    const interval = setInterval(() => {
      if (geo.latitude != null && geo.longitude != null) {
        emitDriverLocation(geo.latitude, geo.longitude);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [enabled, simulating, rideId, geo.latitude, geo.longitude, emitDriverLocation]);

  const latitude = geo.latitude ?? simPosition?.lat ?? null;
  const longitude = geo.longitude ?? simPosition?.lng ?? null;

  return { ...geo, latitude, longitude, simulating };
}
