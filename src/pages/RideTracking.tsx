import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import RideStatusTimeline from '../components/RideStatusTimeline';
import RideLivePanel from '../components/RideLivePanel';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCustomerLocationBroadcast } from '../hooks/useCustomerLocationBroadcast';
import { useRoadRoute } from '../hooks/useRoadRoute';
import { rideAPI } from '../services/api';
import toast from 'react-hot-toast';

interface DriverLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

const RideTracking: React.FC = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const [ride, setRide] = useState<any>(null);
  const prevStatusRef = useRef<string | null>(null);
  const notifiedOtpRef = useRef(false);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [driverPath, setDriverPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [followDriver, setFollowDriver] = useState(true);

  const isLive = ride?.status === 'accepted' || ride?.status === 'started';
  const customerGeo = useCustomerLocationBroadcast(rideId || null, isLive);

  const handleDriverLocation = useCallback((data: any) => {
    const point = { latitude: data.latitude, longitude: data.longitude, timestamp: data.timestamp };
    setDriverLocation(point);
    setDriverPath((prev) => [...prev, { lat: point.latitude, lng: point.longitude }].slice(-60));
  }, []);

  useWebSocket(rideId || null, handleDriverLocation, undefined, 'customer');

  useEffect(() => {
    if (rideId) {
      loadRide();
      const interval = setInterval(loadRide, 5000);
      return () => clearInterval(interval);
    }
  }, [rideId]);

  const loadRide = async () => {
    try {
      const response = await rideAPI.getRide(rideId!);
      const next = response.data;
      setRide(next);
      setLoading(false);

      if (prevStatusRef.current === 'requested' && next.status === 'accepted') {
        toast.success(`Driver accepted! ${next.driver_name || ''}`, { duration: 5000 });
      }
      if (next.status === 'accepted' && next.pickup_otp && !notifiedOtpRef.current) {
        notifiedOtpRef.current = true;
        toast.success(`Pickup OTP: ${next.pickup_otp}`, { duration: 8000 });
      }
      if (prevStatusRef.current === 'accepted' && next.status === 'started') {
        toast.success('Ride started!');
      }
      prevStatusRef.current = next.status;

      if (next.status === 'completed') {
        toast.success('Ride completed!');
        setTimeout(() => navigate(`/ride/${rideId}/complete`), 1200);
      }
    } catch {
      toast.error('Failed to load ride');
    }
  };

  const pickup = useMemo(
    () => (ride ? { lat: ride.pickup_latitude, lng: ride.pickup_longitude } : null),
    [ride]
  );
  const dropoff = useMemo(
    () => (ride ? { lat: ride.dropoff_latitude, lng: ride.dropoff_longitude } : null),
    [ride]
  );

  const { route: tripRoute, loading: tripLoading } = useRoadRoute(pickup, dropoff, !!pickup && !!dropoff);

  const legFrom = driverLocation
    ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
    : null;
  const legTo =
    ride?.status === 'started' ? dropoff : ride?.status === 'accepted' ? pickup : null;

  const { route: activeLeg, loading: legLoading } = useRoadRoute(
    legFrom,
    legTo,
    !!legFrom && !!legTo && isLive
  );

  if (loading || !ride) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  const customerPos =
    customerGeo.latitude != null && customerGeo.longitude != null
      ? { lat: customerGeo.latitude, lng: customerGeo.longitude }
      : null;

  const markers = [
    { lat: ride.pickup_latitude, lng: ride.pickup_longitude, label: 'A' },
    { lat: ride.dropoff_latitude, lng: ride.dropoff_longitude, label: 'B' },
  ];
  if (driverLocation) {
    markers.push({ lat: driverLocation.latitude, lng: driverLocation.longitude, label: '🚗' });
  }
  if (customerPos && isLive) {
    markers.push({ ...customerPos, label: '👤' });
  }

  const mapCenter =
    followDriver && driverLocation
      ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
      : customerPos && isLive
        ? customerPos
        : pickup!;

  const etaMin = activeLeg?.durationMin ?? tripRoute?.durationMin ?? null;
  const navKm = activeLeg?.distanceKm ?? tripRoute?.distanceKm ?? ride.distance_km;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white">
      <div className="flex-1 relative min-h-[55vh] md:min-h-0 order-first">
        <Map
          center={mapCenter}
          markers={markers}
          trackingMode
          driverPath={driverPath}
          roadRoute={tripRoute?.coordinates}
          activeLegRoute={activeLeg?.coordinates}
          fitRoute
          followLive={followDriver && !!driverLocation}
        />

        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          {driverLocation && (
            <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 w-fit">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Driver on map
            </span>
          )}
          {customerPos && isLive && (
            <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg w-fit">
              📍 Your location shared
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setFollowDriver((f) => !f)}
          className="absolute bottom-4 right-4 z-[1000] bg-white shadow-lg rounded-full px-4 py-2 text-sm font-semibold border border-gray-200"
        >
          {followDriver ? '📍 Follow driver' : '🗺 Full route'}
        </button>
      </div>

      <aside className="w-full md:w-[400px] flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate('/')} className="text-gray-500 hover:text-black">
            ← Back
          </button>
          <div className="text-right">
            <p className="font-bold text-xl">₹{Math.round(ride.estimated_fare)}</p>
            <p className="text-xs text-gray-500">
              Trip {ride.distance_km?.toFixed(1)} km
              {ride.passenger_count > 1 ? ` · ${ride.passenger_count} pax` : ''}
            </p>
          </div>
        </div>

        <RideLivePanel
          status={ride.status}
          etaMin={etaMin}
          distanceKm={navKm}
          loading={tripLoading || legLoading}
          driverLive={!!driverLocation}
          customerLive={!!customerPos}
        />

        {ride.status === 'accepted' && ride.pickup_otp && !ride.pickup_verified && (
          <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl">
            <p className="text-sm font-semibold text-amber-900">Pickup OTP — tell your driver</p>
            <p className="text-4xl font-bold text-amber-800 tracking-widest my-2">{ride.pickup_otp}</p>
            <p className="text-xs text-amber-700">Demo: 987653</p>
          </div>
        )}

        <RideStatusTimeline status={ride.status} />

        {ride.status === 'requested' && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-3" />
            <p className="text-sm text-gray-600">Waiting for a driver…</p>
            {tripRoute && (
              <p className="text-xs text-gray-400 mt-2">
                Route ready · ~{tripRoute.durationMin} min on roads
              </p>
            )}
          </div>
        )}

        {ride.driver_name && (
          <div className="p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs text-gray-500">Driver</p>
            <p className="font-bold text-lg">{ride.driver_name}</p>
            <p className="text-sm text-gray-600">{ride.driver_vehicle}</p>
          </div>
        )}

        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">A</span>
            <p className="font-medium">{ride.pickup_address}</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-sm bg-black text-white flex items-center justify-center text-xs font-bold flex-shrink-0">B</span>
            <p className="font-medium">{ride.dropoff_address}</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default RideTracking;
