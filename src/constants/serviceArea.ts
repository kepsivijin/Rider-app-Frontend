/**
 * Service area: Eramanthurai, Vallavilai, Nithiravilai & Marthandam surroundings
 * Kanyakumari district (Kollemcode / Vilavancode region)
 */

export const SERVICE_AREA_NAME = 'Marthandam Region';

export const SERVICE_AREA_CENTER = { lat: 8.29, lng: 77.165 };

// Leaflet bounds: [[south, west], [north, east]]
export const SERVICE_AREA_BOUNDS: [[number, number], [number, number]] = [
  [8.255, 77.085],
  [8.325, 77.245],
];

export const SERVICE_LOCATIONS = {
  eramanthurai: { lat: 8.2875, lng: 77.105, address: 'Eramanthurai' },
  marthandanthurai: { lat: 8.2875, lng: 77.105, address: 'Marthandanthurai' },
  vallavilai: { lat: 8.2815, lng: 77.1143, address: 'Vallavilai' },
  nithiravilai: { lat: 8.2739, lng: 77.1436, address: 'Nithiravilai' },
  marthandam: { lat: 8.3076, lng: 77.2218, address: 'Marthandam' },
  kollancode: { lat: 8.289, lng: 77.108, address: 'Kollancode' },
  poothurai: { lat: 8.264, lng: 77.138, address: 'Poothurai (Pottur)' },
  thoothoorChurch: { lat: 8.261, lng: 77.1431, address: 'St Thomas Forane Church, Thoothoor' },
};

export const ROUTE_PRESETS = [
  {
    name: 'Poothurai → Thoothoor Church',
    pickup: SERVICE_LOCATIONS.poothurai,
    dropoff: SERVICE_LOCATIONS.thoothoorChurch,
  },
  {
    name: 'Eramanthurai → Vallavilai',
    pickup: SERVICE_LOCATIONS.eramanthurai,
    dropoff: SERVICE_LOCATIONS.vallavilai,
  },
  {
    name: 'Vallavilai → Nithiravilai',
    pickup: SERVICE_LOCATIONS.vallavilai,
    dropoff: SERVICE_LOCATIONS.nithiravilai,
  },
  {
    name: 'Nithiravilai → Marthandam',
    pickup: SERVICE_LOCATIONS.nithiravilai,
    dropoff: SERVICE_LOCATIONS.marthandam,
  },
  {
    name: 'Eramanthurai → Marthandam',
    pickup: SERVICE_LOCATIONS.eramanthurai,
    dropoff: SERVICE_LOCATIONS.marthandam,
  },
];
