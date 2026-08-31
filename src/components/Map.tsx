import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  SERVICE_AREA_BOUNDS,
  SERVICE_AREA_CENTER,
  SERVICE_LOCATIONS,
} from '../constants/serviceArea';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const USE_GOOGLE_MAPS = GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.includes('your-') && GOOGLE_MAPS_API_KEY !== 'local-test-key';

export interface MapClickEvent {
  latLng: { lat: () => number; lng: () => number };
}

interface MapProps {
  center?: { lat: number; lng: number };
  markers?: Array<{ lat: number; lng: number; label?: string }>;
  onMapClick?: (e: MapClickEvent) => void;
  trackingMode?: boolean;
  driverPath?: Array<{ lat: number; lng: number }>;
}

const pickupIcon = L.divIcon({
  className: '',
  html: '<div style="background:#22c55e;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">A</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const dropoffIcon = L.divIcon({
  className: '',
  html: '<div style="background:#ef4444;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">B</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const driverIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:24px;line-height:1">🚗</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const placeIcon = L.divIcon({
  className: '',
  html: '<div style="background:#0ea5e9;color:white;width:8px;height:8px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
  iconSize: [8, 8],
  iconAnchor: [4, 4],
});

function MapClickHandler({ onMapClick }: { onMapClick?: (e: MapClickEvent) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.({
        latLng: {
          lat: () => e.latlng.lat,
          lng: () => e.latlng.lng,
        },
      });
    },
  });
  return null;
}

const LeafletMap: React.FC<MapProps> = ({ center, markers = [], onMapClick, trackingMode, driverPath = [] }) => {
  const mapCenter = center || SERVICE_AREA_CENTER;

  const pickup = markers.find((m) => m.label === 'A');
  const dropoff = markers.find((m) => m.label === 'B');
  const routeLine: [number, number][] = [];
  if (pickup) routeLine.push([pickup.lat, pickup.lng]);
  if (dropoff) routeLine.push([dropoff.lat, dropoff.lng]);

  const driverLine = driverPath.map((p) => [p.lat, p.lng] as [number, number]);

  const areaMarkers = Object.values(SERVICE_LOCATIONS);

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Rectangle
        bounds={SERVICE_AREA_BOUNDS}
        pathOptions={{ color: '#0ea5e9', weight: 2, fillColor: '#0ea5e9', fillOpacity: 0.1, dashArray: '6 4' }}
      />
      {!trackingMode && areaMarkers.map((loc) => (
        <Marker key={loc.address} position={[loc.lat, loc.lng]} icon={placeIcon}>
          <Popup>{loc.address}</Popup>
        </Marker>
      ))}
      <MapClickHandler onMapClick={onMapClick} />
      {routeLine.length === 2 && (
        <Polyline
          positions={routeLine}
          pathOptions={{
            color: trackingMode ? '#22c55e' : '#0ea5e9',
            weight: trackingMode ? 5 : 4,
            dashArray: trackingMode ? undefined : '8 8',
            opacity: 0.85,
          }}
        />
      )}
      {driverLine.length >= 2 && (
        <Polyline positions={driverLine} pathOptions={{ color: '#f59e0b', weight: 3, dashArray: '4 6' }} />
      )}
      {markers.map((marker, index) => {
        const icon =
          marker.label === 'A' ? pickupIcon : marker.label === 'B' ? dropoffIcon : marker.label === '🚗' ? driverIcon : undefined;
        return (
          <Marker key={index} position={[marker.lat, marker.lng]} icon={icon}>
            {marker.label && marker.label !== '🚗' && (
              <Popup>{marker.label === 'A' ? 'Pickup' : marker.label === 'B' ? 'Dropoff' : marker.label}</Popup>
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
};

const GoogleMapWrapper = React.lazy(async () => {
  const { GoogleMap, Marker, useJsApiLoader } = await import('@react-google-maps/api');

  const Component: React.FC<MapProps> = ({ center, markers = [], onMapClick }) => {
    const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

    if (loadError) {
      return <LeafletMap center={center} markers={markers} onMapClick={onMapClick} />;
    }
    if (!isLoaded) {
      return <div className="flex items-center justify-center h-full bg-gray-100">Loading map...</div>;
    }

    return (
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center || SERVICE_AREA_CENTER}
        zoom={13}
        onClick={onMapClick as any}
        options={{ zoomControl: true, streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
      >
        {markers.map((marker, index) => (
          <Marker key={index} position={{ lat: marker.lat, lng: marker.lng }} label={marker.label} />
        ))}
      </GoogleMap>
    );
  };

  return { default: Component };
});

const Map: React.FC<MapProps> = (props) => {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  if (USE_GOOGLE_MAPS) {
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center h-full bg-gray-100">Loading map...</div>}>
        <GoogleMapWrapper {...props} />
      </React.Suspense>
    );
  }

  return <LeafletMap {...props} />;
};

export default Map;
