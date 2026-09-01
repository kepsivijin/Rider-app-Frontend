import { useEffect, useRef } from 'react';
import { LatLng } from '../services/routing';

/**
 * Demo: move driver marker along road route when GPS is unavailable (VM / browser test).
 * Accepted → first half of route (toward pickup). Started → full route to dropoff.
 */
export function useSimulatedDriverMovement(
  route: LatLng[] | undefined,
  rideStatus: string | undefined,
  enabled: boolean,
  onMove: (lat: number, lng: number) => void
) {
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled || !route?.length || !rideStatus) return;

    indexRef.current = 0;
    const maxIndex =
      rideStatus === 'started' ? route.length - 1 : Math.max(1, Math.floor(route.length * 0.35));

    const tick = () => {
      const idx = indexRef.current;
      const pt = route[idx];
      onMove(pt.lat, pt.lng);
      if (idx < maxIndex) indexRef.current += 1;
    };

    tick();
    const interval = window.setInterval(tick, 2500);
    return () => window.clearInterval(interval);
  }, [route, rideStatus, enabled, onMove]);
}
