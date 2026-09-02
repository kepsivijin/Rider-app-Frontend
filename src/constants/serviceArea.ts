/**
 * Service area: Kolachel ↔ Poovar coast + Marthandam ↔ Chirayankeezhu & surroundings
 * Kanyakumari district — TN/Kerala border region
 */

export const SERVICE_AREA_NAME = 'Kanyakumari South Coast';

// Center between coastal (Kolachel–Poovar) and inland (Marthandam–Chirayankeezhu)
export const SERVICE_AREA_CENTER = { lat: 8.332, lng: 77.107 };

// Leaflet bounds: [[south, west], [north, east]]
export const SERVICE_AREA_BOUNDS: [[number, number], [number, number]] = [
  [8.238, 76.948],
  [8.425, 77.265],
];

export const SERVICE_LOCATIONS = {
  // Coastal — Kolachel to Poovar
  kolachel: { lat: 8.345, lng: 77.008, address: 'Kolachel' },
  eraviputhanthurai: { lat: 8.378, lng: 77.032, address: 'Eraviputhanthurai' },
  ezhudesam: { lat: 8.385, lng: 77.055, address: 'Ezhudesam' },
  poovar: { lat: 8.381, lng: 77.077, address: 'Poovar' },
  puvar: { lat: 8.372, lng: 77.098, address: 'Puvar' },
  vilavankodu: { lat: 8.358, lng: 77.118, address: 'Vilavankodu' },
  unnamalaikadai: { lat: 8.362, lng: 77.148, address: 'Unnamalaikadai' },
  // Inland — Marthandam to Chirayankeezhu
  chirayankeezhu: { lat: 8.248, lng: 77.152, address: 'Chirayankeezhu' },
  poothurai: { lat: 8.264, lng: 77.138, address: 'Poothurai (Pottur)' },
  thoothoor: { lat: 8.261, lng: 77.1431, address: 'Thoothoor' },
  nithiravilai: { lat: 8.2739, lng: 77.1436, address: 'Nithiravilai' },
  vallavilai: { lat: 8.2815, lng: 77.1143, address: 'Vallavilai' },
  eramanthurai: { lat: 8.2875, lng: 77.105, address: 'Eramanthurai' },
  kollancode: { lat: 8.289, lng: 77.108, address: 'Kollancode' },
  marthandam: { lat: 8.3076, lng: 77.2218, address: 'Marthandam' },
};

export const ROUTE_PRESETS = [
  {
    name: 'Kolachel → Poovar',
    pickup: SERVICE_LOCATIONS.kolachel,
    dropoff: SERVICE_LOCATIONS.poovar,
  },
  {
    name: 'Ezhudesam → Puvar',
    pickup: SERVICE_LOCATIONS.ezhudesam,
    dropoff: SERVICE_LOCATIONS.puvar,
  },
  {
    name: 'Marthandam → Chirayankeezhu',
    pickup: SERVICE_LOCATIONS.marthandam,
    dropoff: SERVICE_LOCATIONS.chirayankeezhu,
  },
  {
    name: 'Poothurai → Thoothoor',
    pickup: SERVICE_LOCATIONS.poothurai,
    dropoff: SERVICE_LOCATIONS.thoothoor,
  },
  {
    name: 'Eramanthurai → Marthandam',
    pickup: SERVICE_LOCATIONS.eramanthurai,
    dropoff: SERVICE_LOCATIONS.marthandam,
  },
  {
    name: 'Vallavilai → Nithiravilai',
    pickup: SERVICE_LOCATIONS.vallavilai,
    dropoff: SERVICE_LOCATIONS.nithiravilai,
  },
];

export function isInServiceArea(lat: number, lng: number): boolean {
  const [[south, west], [north, east]] = SERVICE_AREA_BOUNDS;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}
