import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  SERVICE_AREA_BOUNDS,
  SERVICE_AREA_CENTER,
  SERVICE_LOCATIONS,
} from '../constants/serviceArea';
import { LatLng } from '../services/routing';

export interface MapClickEvent {
  latLng: { lat: () => number; lng: () => number };
}

interface MapProps {
  center?: { lat: number; lng: number };
  markers?: Array<{ lat: number; lng: number; label?: string }>;
  onMapClick?: (e: MapClickEvent) => void;
  trackingMode?: boolean;
  driverPath?: Array<{ lat: number; lng: number }>;
  /** Full trip route on roads (pickup → dropoff) */
  roadRoute?: LatLng[];
  /** Current leg on roads (e.g. driver → pickup or driver → dropoff) */
  activeLegRoute?: LatLng[];
  fitRoute?: boolean;
  followLive?: boolean;
}

const pickupIcon = L.divIcon({
  className: '',
  html: '<div style="background:#22c55e;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)">A</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const dropoffIcon = L.divIcon({
  className: '',
  html: '<div style="background:#111;color:white;width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)">B</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const driverIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">🚗</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const customerIcon = L.divIcon({
  className: '',
  html: '<div style="background:#3b82f6;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)">👤</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
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
        latLng: { lat: () => e.latlng.lat, lng: () => e.latlng.lng },
      });
    },
  });
  return null;
}

function FitRouteBounds({
  markers,
  roadRoute,
  enabled,
}: {
  markers: MapProps['markers'];
  roadRoute?: LatLng[];
  enabled?: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!enabled) return;
    const pts: [number, number][] = [];

    roadRoute?.forEach((p) => pts.push([p.lat, p.lng]));
    markers?.forEach((m) => {
      if (m.label === 'A' || m.label === 'B' || m.label === '🚗' || m.label === '👤') {
        pts.push([m.lat, m.lng]);
      }
    });

    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView(pts[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 15 });
  }, [markers, roadRoute, enabled, map]);
  return null;
}

function FollowLiveCenter({ center, enabled }: { center?: { lat: number; lng: number }; enabled?: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !center) return;
    map.panTo([center.lat, center.lng], { animate: true, duration: 0.8 });
  }, [center?.lat, center?.lng, enabled, map]);
  return null;
}

function LockServiceArea({ fitRoute }: { fitRoute?: boolean }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(SERVICE_AREA_BOUNDS);
    map.setMaxBounds(bounds.pad(0.02));
    map.options.minZoom = 11;
    map.options.maxZoom = 16;
    if (!fitRoute) {
      map.fitBounds(bounds, { padding: [8, 8], maxZoom: 14 });
    }
  }, [map, fitRoute]);
  return null;
}

const LeafletMap: React.FC<MapProps> = ({
  center,
  markers = [],
  onMapClick,
  trackingMode,
  driverPath = [],
  roadRoute,
  activeLegRoute,
  fitRoute,
  followLive,
}) => {
  const mapCenter = center || SERVICE_AREA_CENTER;
  const pickup = markers.find((m) => m.label === 'A');
  const dropoff = markers.find((m) => m.label === 'B');
  const driverLine = driverPath.map((p) => [p.lat, p.lng] as [number, number]);

  const tripLine: [number, number][] =
    roadRoute?.map((p) => [p.lat, p.lng] as [number, number]) ??
    (pickup && dropoff ? [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]] : []);

  const legLine: [number, number][] =
    activeLegRoute?.map((p) => [p.lat, p.lng] as [number, number]) ?? [];

  const areaMarkers = Object.values(SERVICE_LOCATIONS);

  const iconFor = (label?: string) => {
    if (label === 'A') return pickupIcon;
    if (label === 'B') return dropoffIcon;
    if (label === '🚗') return driverIcon;
    if (label === '👤') return customerIcon;
    return undefined;
  };

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={13}
      minZoom={11}
      maxZoom={16}
      maxBounds={SERVICE_AREA_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom
      className="z-0"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap · Kanyakumari'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LockServiceArea fitRoute={fitRoute} />
      <Rectangle
        bounds={SERVICE_AREA_BOUNDS}
        pathOptions={{ color: '#0ea5e9', weight: 2, fillColor: '#0ea5e9', fillOpacity: 0.06, dashArray: '6 4' }}
      />
      <FitRouteBounds markers={markers} roadRoute={roadRoute} enabled={fitRoute} />
      <FollowLiveCenter center={center} enabled={followLive} />
      {!trackingMode &&
        areaMarkers.map((loc) => (
          <Marker key={loc.address} position={[loc.lat, loc.lng]} icon={placeIcon}>
            <Popup>{loc.address}</Popup>
          </Marker>
        ))}
      <MapClickHandler onMapClick={onMapClick} />

      {/* Full trip on roads (muted) */}
      {tripLine.length >= 2 && (
        <Polyline
          positions={tripLine}
          pathOptions={{
            color: trackingMode ? '#94a3b8' : '#2563eb',
            weight: trackingMode ? 5 : 5,
            opacity: trackingMode ? 0.55 : 0.85,
          }}
        />
      )}

      {/* Active navigation leg on roads (highlighted) */}
      {legLine.length >= 2 && (
        <Polyline
          positions={legLine}
          pathOptions={{ color: '#22c55e', weight: 7, opacity: 0.95 }}
        />
      )}

      {/* Trail of where driver has been */}
      {driverLine.length >= 2 && (
        <Polyline positions={driverLine} pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.85, dashArray: '4 6' }} />
      )}

      {markers.map((marker, index) => (
        <Marker key={`${marker.lat}-${marker.lng}-${index}`} position={[marker.lat, marker.lng]} icon={iconFor(marker.label)}>
          {marker.label && marker.label !== '🚗' && marker.label !== '👤' && (
            <Popup>{marker.label === 'A' ? 'Pickup' : marker.label === 'B' ? 'Dropoff' : marker.label}</Popup>
          )}
          {marker.label === '🚗' && <Popup>Driver</Popup>}
          {marker.label === '👤' && <Popup>Customer</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
};

const Map: React.FC<MapProps> = (props) => {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  return <LeafletMap {...props} />;
};

export default Map;
