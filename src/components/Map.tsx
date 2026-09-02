import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, Rectangle, useMap, ZoomControl } from 'react-leaflet';
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
  onMarkerDrag?: (label: 'A' | 'B', lat: number, lng: number) => void;
  selectionMode?: boolean;
  trackingMode?: boolean;
  driverPath?: Array<{ lat: number; lng: number }>;
  roadRoute?: LatLng[];
  activeLegRoute?: LatLng[];
  fitRoute?: boolean;
  fitRouteTrigger?: number;
  followLive?: boolean;
}

const MIN_ZOOM = 11;
const MAX_ZOOM = 19;
const SELECTION_ZOOM = 13;

const pickupIcon = L.divIcon({
  className: '',
  html: '<div style="background:#22c55e;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.4);cursor:grab">A</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const dropoffIcon = L.divIcon({
  className: '',
  html: '<div style="background:#111;color:white;width:36px;height:36px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.4);cursor:grab">B</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const driverIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:32px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">🚗</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const customerIcon = L.divIcon({
  className: '',
  html: '<div style="background:#3b82f6;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)">👤</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const placeIcon = L.divIcon({
  className: '',
  html: '<div style="background:#0ea5e9;color:white;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

function MapClickHandler({ onMapClick, enabled }: { onMapClick?: (e: MapClickEvent) => void; enabled?: boolean }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
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
  trigger,
}: {
  markers: MapProps['markers'];
  roadRoute?: LatLng[];
  enabled?: boolean;
  trigger?: number;
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
      map.setView(pts[0], 16);
      return;
    }
    map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 17 });
  }, [markers, roadRoute, enabled, trigger, map]);
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

function LockServiceArea({ selectionMode, trackingMode }: { selectionMode?: boolean; trackingMode?: boolean }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(SERVICE_AREA_BOUNDS);
    map.setMaxBounds(bounds.pad(0.08));
    map.options.minZoom = MIN_ZOOM;
    map.options.maxZoom = MAX_ZOOM;
    if (selectionMode && !trackingMode) {
      map.setView([SERVICE_AREA_CENTER.lat, SERVICE_AREA_CENTER.lng], SELECTION_ZOOM, { animate: false });
    } else if (!selectionMode) {
      map.fitBounds(bounds, { padding: [12, 12], maxZoom: 15 });
    }
  }, [map, selectionMode, trackingMode]);
  return null;
}

const LeafletMap: React.FC<MapProps> = ({
  center,
  markers = [],
  onMapClick,
  onMarkerDrag,
  selectionMode,
  trackingMode,
  driverPath = [],
  roadRoute,
  activeLegRoute,
  fitRoute,
  fitRouteTrigger,
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

  const canDrag = (label?: string) =>
    selectionMode && (label === 'A' || label === 'B');

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={selectionMode ? SELECTION_ZOOM : 14}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={SERVICE_AREA_BOUNDS}
      maxBoundsViscosity={0.85}
      style={{ width: '100%', height: '100%', cursor: selectionMode ? 'crosshair' : 'grab', touchAction: 'manipulation' }}
      scrollWheelZoom
      zoomControl={false}
      className="z-0"
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; OpenStreetMap · Kanyakumari'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={MAX_ZOOM}
        maxNativeZoom={19}
      />
      <LockServiceArea selectionMode={selectionMode} trackingMode={trackingMode} />
      <Rectangle
        bounds={SERVICE_AREA_BOUNDS}
        pathOptions={{ color: '#0ea5e9', weight: 2, fillColor: '#0ea5e9', fillOpacity: 0.05, dashArray: '6 4' }}
      />
      <FitRouteBounds markers={markers} roadRoute={roadRoute} enabled={fitRoute} trigger={fitRouteTrigger} />
      <FollowLiveCenter center={center} enabled={followLive} />
      {!trackingMode &&
        areaMarkers.map((loc) => (
          <Marker key={loc.address} position={[loc.lat, loc.lng]} icon={placeIcon}>
            <Popup>{loc.address}</Popup>
          </Marker>
        ))}
      <MapClickHandler onMapClick={onMapClick} enabled={!!selectionMode && !!onMapClick} />

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

      {legLine.length >= 2 && (
        <Polyline positions={legLine} pathOptions={{ color: '#22c55e', weight: 7, opacity: 0.95 }} />
      )}

      {driverLine.length >= 2 && (
        <Polyline positions={driverLine} pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.85, dashArray: '4 6' }} />
      )}

      {markers.map((marker, index) => (
        <Marker
          key={`${marker.label}-${marker.lat}-${marker.lng}-${index}`}
          position={[marker.lat, marker.lng]}
          icon={iconFor(marker.label)}
          draggable={canDrag(marker.label)}
          eventHandlers={
            canDrag(marker.label) && onMarkerDrag
              ? {
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    onMarkerDrag(marker.label as 'A' | 'B', lat, lng);
                  },
                }
              : undefined
          }
        >
          {marker.label === 'A' && <Popup>Pickup — drag to move</Popup>}
          {marker.label === 'B' && <Popup>Dropoff — drag to move</Popup>}
          {marker.label === '🚗' && <Popup>Driver (live)</Popup>}
          {marker.label === '👤' && <Popup>Customer (live)</Popup>}
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
