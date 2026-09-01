export type VehicleFareType = 'bike' | 'auto' | 'car';

/** Book only when estimated fare is greater than ₹5 */
export const MIN_BOOK_FARE = 5;

export const VEHICLE_FARE: Record<
  VehicleFareType,
  { base: number; perKm: number; label: string; rateHint: string }
> = {
  bike: {
    base: 30,
    perKm: 9,
    label: 'Bike',
    rateHint: '₹30 + ₹9/km',
  },
  auto: {
    base: 29,
    perKm: 12,
    label: 'Auto',
    rateHint: '₹29 up to 4 km, then ₹12/km',
  },
  car: {
    base: 40,
    perKm: 18,
    label: 'Car',
    rateHint: '₹40 + ₹18/km',
  },
};

const AUTO_INCLUDED_KM = 4;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateFareFromKm(distanceKm: number, vehicleType: VehicleFareType): number {
  if (vehicleType === 'auto') {
    if (distanceKm <= AUTO_INCLUDED_KM) {
      return VEHICLE_FARE.auto.base;
    }
    const extra = distanceKm - AUTO_INCLUDED_KM;
    return Math.round(VEHICLE_FARE.auto.base + extra * VEHICLE_FARE.auto.perKm);
  }

  const rates = VEHICLE_FARE[vehicleType];
  return Math.round(rates.base + distanceKm * rates.perKm);
}

export function canBookFare(fare: number): boolean {
  return fare > MIN_BOOK_FARE;
}

export function fareSummary(vehicleType: VehicleFareType, distanceKm: number, fare: number): string {
  const v = VEHICLE_FARE[vehicleType];
  return `${v.label} · ${distanceKm.toFixed(1)} km · ${v.rateHint} · ₹${fare}`;
}

export function vehicleRateLabel(vehicleType: VehicleFareType): string {
  return VEHICLE_FARE[vehicleType].rateHint;
}
