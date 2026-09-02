/**
 * Service area: Ezhudesam & surroundings (Puvar, Kolachel, Vilavankodu)
 * Kanyakumari district — coastal TN/Kerala border
 */

export const SERVICE_AREA_NAME = 'Ezhudesam';

// Center on Ezhudesam village
export const SERVICE_AREA_CENTER = { lat: 8.385, lng: 77.055 };

// Leaflet bounds: [[south, west], [north, east]]
export const SERVICE_AREA_BOUNDS: [[number, number], [number, number]] = [
  [8.31, 76.96],
  [8.42, 77.18],
];

export const SERVICE_LOCATIONS = {
  ezhudesam: { lat: 8.385, lng: 77.055, address: 'Ezhudesam' },
  puvar: { lat: 8.372, lng: 77.098, address: 'Puvar' },
  kolachel: { lat: 8.345, lng: 77.008, address: 'Kolachel' },
  vilavankodu: { lat: 8.358, lng: 77.118, address: 'Vilavankodu' },
  unnamalaikadai: { lat: 8.362, lng: 77.148, address: 'Unnamalaikadai' },
  eraviputhanthurai: { lat: 8.378, lng: 77.032, address: 'Eraviputhanthurai' },
  thoothoor: { lat: 8.261, lng: 77.1431, address: 'Thoothoor' },
  poothurai: { lat: 8.264, lng: 77.138, address: 'Poothurai (Pottur)' },
};

export const ROUTE_PRESETS = [
  {
    name: 'Ezhudesam → Puvar',
    pickup: SERVICE_LOCATIONS.ezhudesam,
    dropoff: SERVICE_LOCATIONS.puvar,
  },
  {
    name: 'Ezhudesam → Kolachel',
    pickup: SERVICE_LOCATIONS.ezhudesam,
    dropoff: SERVICE_LOCATIONS.kolachel,
  },
  {
    name: 'Puvar → Vilavankodu',
    pickup: SERVICE_LOCATIONS.puvar,
    dropoff: SERVICE_LOCATIONS.vilavankodu,
  },
  {
    name: 'Kolachel → Ezhudesam',
    pickup: SERVICE_LOCATIONS.kolachel,
    dropoff: SERVICE_LOCATIONS.ezhudesam,
  },
  {
    name: 'Ezhudesam → Unnamalaikadai',
    pickup: SERVICE_LOCATIONS.ezhudesam,
    dropoff: SERVICE_LOCATIONS.unnamalaikadai,
  },
];

export function isInServiceArea(lat: number, lng: number): boolean {
  const [[south, west], [north, east]] = SERVICE_AREA_BOUNDS;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}
