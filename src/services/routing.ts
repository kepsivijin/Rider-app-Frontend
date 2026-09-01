export interface LatLng {
  lat: number;
  lng: number;
}

export interface RoadRoute {
  coordinates: LatLng[];
  distanceKm: number;
  durationMin: number;
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Straight-line fallback when OSRM is unavailable */
function fallbackRoute(from: LatLng, to: LatLng): RoadRoute {
  const km = haversineKm(from, to);
  const durationMin = Math.max(1, Math.round((km / 25) * 60));
  return { coordinates: [from, to], distanceKm: km, durationMin };
}

/** Fetch driving route on real roads via OSRM (free, OpenStreetMap) */
export async function fetchRoadRoute(from: LatLng, to: LatLng): Promise<RoadRoute> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson&steps=false`;

    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return fallbackRoute(from, to);

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route?.geometry?.coordinates?.length) return fallbackRoute(from, to);

    const coordinates: LatLng[] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ lat, lng })
    );

    return {
      coordinates,
      distanceKm: route.distance / 1000,
      durationMin: Math.max(1, Math.round(route.duration / 60)),
    };
  } catch {
    return fallbackRoute(from, to);
  }
}

export function formatEta(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}
