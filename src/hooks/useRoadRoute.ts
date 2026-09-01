import { useEffect, useState } from 'react';
import { fetchRoadRoute, LatLng, RoadRoute } from '../services/routing';

export function useRoadRoute(from: LatLng | null, to: LatLng | null, enabled = true) {
  const [route, setRoute] = useState<RoadRoute | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !from || !to) {
      setRoute(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchRoadRoute(from, to).then((r) => {
      if (!cancelled) {
        setRoute(r);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [from?.lat, from?.lng, to?.lat, to?.lng, enabled]);

  return { route, loading };
}
