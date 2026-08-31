import { SERVICE_LOCATIONS } from '../constants/serviceArea';

const COORD_PATTERN = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
const PRESET_SNAP_KM = 0.4;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestPreset(lat: number, lng: number): string | null {
  let best: string | null = null;
  let bestDist = PRESET_SNAP_KM;
  for (const loc of Object.values(SERVICE_LOCATIONS)) {
    const dist = haversineKm(lat, lng, loc.lat, loc.lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = loc.address;
    }
  }
  return best;
}

function formatNominatimAddress(addr: Record<string, string>, displayName?: string): string | null {
  const road =
    addr.road || addr.street || addr.pedestrian || addr.footway || addr.path || addr.residential;
  const area = addr.neighbourhood || addr.suburb || addr.hamlet || addr.locality;
  const village = addr.village || addr.town || addr.city;
  const district = addr.state_district || addr.county;

  const parts: string[] = [];
  if (road) parts.push(road);
  if (area && !parts.includes(area)) parts.push(area);
  if (village && !parts.includes(village)) parts.push(village);
  if (district && !parts.includes(district) && parts.length < 3) parts.push(district);

  if (parts.length) return parts.slice(0, 4).join(', ');
  if (displayName) return displayName.split(',').slice(0, 3).join(',').trim();
  return null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (res.ok) {
      const data = await res.json();
      const formatted = formatNominatimAddress(data.address || {}, data.display_name);
      if (formatted) return formatted;
    }
  } catch {
    // fall through to preset snap
  }

  return nearestPreset(lat, lng) || `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function looksLikeCoordinates(address: string): boolean {
  return !address || address === 'Current Location' || COORD_PATTERN.test(address.trim());
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    requested: 'Finding Driver',
    accepted: 'Driver Accepted',
    started: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    requested: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    started: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
