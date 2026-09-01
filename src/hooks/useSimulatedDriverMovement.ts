import { useEffect, useRef } from 'react';
import { LatLng } from '../services/routing';

/**
 * Animate driver along road route for demo/testing.
 * Accepted → first half toward pickup. Started → full route to dropoff.
 */
export function useSimulatedDriverMovement(
  route: LatLng[] | undefined,
  rideStatus: string | undefined,
  enabled: boolean,
  onMove: (lat: number, lng: number) => void
) {
  const indexRef = useRef(0);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  useEffect(() => {
    if (!enabled || !route?.length || !rideStatus) return;

    indexRef.current = 0;
    const maxIndex =
      rideStatus === 'started'
        ? route.length - 1
        : Math.max(1, Math.floor(route.length * 0.45));

    const tick = () => {
      const idx = indexRef.current;
      const pt = route[idx];
      onMoveRef.current(pt.lat, pt.lng);
      if (idx < maxIndex) indexRef.current += 1;
    };

    tick();
    const interval = window.setInterval(tick, 1800);
    return () => window.clearInterval(interval);
  }, [route, rideStatus, enabled]);
}
