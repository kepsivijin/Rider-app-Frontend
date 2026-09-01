export type VehicleFareType = 'bike' | 'auto' | 'car';

/** Book only when estimated fare is greater than ₹5 */
export const MIN_BOOK_FARE = 5;

/** Rural flat rates — no base fare */
export const BIKE_PER_KM = 10;
export const AUTO_PER_PERSON_KM = 8;
export const CAR_PER_PERSON_KM = 10;

export const VEHICLE_FARE: Record<VehicleFareType, { label: string; maxPassengers: number }> = {
  bike: { label: 'Bike', maxPassengers: 1 },
  auto: { label: 'Auto', maxPassengers: 3 },
  car: { label: 'Car', maxPassengers: 4 },
};

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

export function estimateFareFromKm(
  distanceKm: number,
  vehicleType: VehicleFareType,
  passengerCount = 1
): number {
  if (vehicleType === 'bike') {
    return Math.round(distanceKm * BIKE_PER_KM);
  }
  if (vehicleType === 'auto') {
    return Math.round(distanceKm * AUTO_PER_PERSON_KM * passengerCount);
  }
  return Math.round(distanceKm * CAR_PER_PERSON_KM * passengerCount);
}

export function canBookFare(fare: number): boolean {
  return fare > MIN_BOOK_FARE;
}

/** Short label for fare summary — no base-fare breakdown */
export function fareDetailLine(
  vehicleType: VehicleFareType,
  passengerCount: number
): string {
  if (vehicleType === 'bike') {
    return '₹10/km';
  }
  return `${passengerCount} passenger${passengerCount > 1 ? 's' : ''}`;
}
