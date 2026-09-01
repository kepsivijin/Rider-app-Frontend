import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Map from '../../components/Map';
import GeolocationBanner from '../../components/GeolocationBanner';
import RideLivePanel from '../../components/RideLivePanel';
import { useDriverLocationBroadcast } from '../../hooks/useDriverLocationBroadcast';
import { useRoadRoute } from '../../hooks/useRoadRoute';
import { useWebSocket } from '../../hooks/useWebSocket';
import { api, rideAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DriverRide: React.FC = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pickupOtpInput, setPickupOtpInput] = useState('');
  const [customerLocation, setCustomerLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const isActive = ride?.status === 'accepted' || ride?.status === 'started';
  const driverGeo = useDriverLocationBroadcast(rideId || null, isActive);

  const handleCustomerLocation = useCallback((data: any) => {
    setCustomerLocation({ latitude: data.latitude, longitude: data.longitude });
  }, []);

  useWebSocket(rideId || null, undefined, handleCustomerLocation, 'driver');

  useEffect(() => {
    if (rideId) loadRide();
  }, [rideId]);

  const loadRide = async () => {
    try {
      const response = await api.get(`/rides/${rideId}`);
      setRide(response.data);
    } catch {
      toast.error('Failed to load ride');
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = async () => {
    setActionLoading(true);
    try {
      const response = await api.post(`/rides/${rideId}/accept`);
      setRide(response.data);
      toast.success('Accepted! Ask customer for OTP 987653');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to accept');
    } finally {
      setActionLoading(false);
    }
  };

  const verifyPickupOtp = async () => {
    if (!pickupOtpInput.trim()) {
      toast.error('Enter customer OTP');
      return;
    }
    setActionLoading(true);
    try {
      const response = await rideAPI.verifyPickupOtp(rideId!, pickupOtpInput.trim());
      setRide(response.data);
      toast.success('Customer verified!');
      setPickupOtpInput('');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setActionLoading(false);
    }
  };

  const startRide = async () => {
    setActionLoading(true);
    try {
      const response = await api.post(`/rides/${rideId}/start`);
      setRide(response.data);
      toast.success('Ride started!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to start');
    } finally {
      setActionLoading(false);
    }
  };

  const completeRide = async () => {
    setActionLoading(true);
    try {
      const response = await api.post(`/rides/${rideId}/complete`);
      setRide(response.data);
      toast.success('Ride completed!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to complete');
    } finally {
      setActionLoading(false);
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

  const driverPos =
    driverGeo.latitude != null && driverGeo.longitude != null
      ? { lat: driverGeo.latitude, lng: driverGeo.longitude }
      : null;

  const navTarget = ride?.status === 'started' ? dropoff : ride?.status === 'accepted' ? pickup : null;

  const { route: activeLeg, loading: legLoading } = useRoadRoute(
    driverPos,
    navTarget,
    !!driverPos && !!navTarget && isActive
  );

  if (loading || !ride) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    requested: 'New Request',
    accepted: 'Go to Pickup',
    started: 'On Trip',
    completed: 'Done',
  };

  const markers = [
    { lat: ride.pickup_latitude, lng: ride.pickup_longitude, label: 'A' },
    { lat: ride.dropoff_latitude, lng: ride.dropoff_longitude, label: 'B' },
  ];
  if (driverPos) {
    markers.push({ ...driverPos, label: '🚗' });
  }
  if (customerLocation && isActive) {
    markers.push({ lat: customerLocation.latitude, lng: customerLocation.longitude, label: '👤' });
  }

  const mapCenter = driverPos ?? pickup!;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white">
      <div className="flex-1 relative min-h-[50vh] md:min-h-0">
        <Map
          center={mapCenter}
          markers={markers}
          trackingMode
          roadRoute={tripRoute?.coordinates}
          activeLegRoute={activeLeg?.coordinates}
          fitRoute
          followLive={isActive && !!driverPos}
        />
        {isActive && driverPos && (
          <div className="absolute top-4 left-4 z-[1000] bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            📡 Live · customer can see you
          </div>
        )}
        {customerLocation && isActive && (
          <div className="absolute top-14 left-4 z-[1000] bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            👤 Customer location on map
          </div>
        )}
      </div>

      <aside className="w-full md:w-[400px] flex-shrink-0 border-t md:border-l border-gray-100 overflow-y-auto p-5 space-y-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/driver')} className="text-gray-500">←</button>
          <h1 className="text-lg font-bold">{statusLabel[ride.status]}</h1>
        </div>

        <GeolocationBanner
          error={isActive ? driverGeo.error : null}
          errorCode={driverGeo.errorCode}
          onRetry={() => window.location.reload()}
        />

        {isActive && (
          <RideLivePanel
            status={ride.status}
            etaMin={activeLeg?.durationMin ?? tripRoute?.durationMin ?? null}
            distanceKm={activeLeg?.distanceKm ?? tripRoute?.distanceKm ?? ride.distance_km}
            loading={tripLoading || legLoading}
            driverLive={!!driverPos}
            customerLive={!!customerLocation}
          />
        )}

        <div className="p-4 bg-gray-50 rounded-2xl space-y-3 text-sm">
          <div className="flex gap-2">
            <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">A</span>
            <p className="font-medium">{ride.pickup_address}</p>
          </div>
          <div className="flex gap-2">
            <span className="w-6 h-6 rounded-sm bg-black text-white flex items-center justify-center text-xs font-bold">B</span>
            <p className="font-medium">{ride.dropoff_address}</p>
          </div>
          <p className="text-2xl font-bold">₹{Math.round(ride.estimated_fare)} <span className="text-sm font-normal text-gray-500">cash</span></p>
          <p className="text-sm text-gray-500">
            {ride.distance_km?.toFixed(1)} km trip
            {tripRoute ? ` · ~${tripRoute.durationMin} min on roads` : ''}
          </p>
          {ride.customer_name && <p className="text-gray-600">Customer: {ride.customer_name}</p>}
        </div>

        {ride.status === 'requested' && (
          <button type="button" onClick={acceptRide} disabled={actionLoading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold disabled:opacity-50">
            {actionLoading ? 'Accepting…' : 'Accept Ride'}
          </button>
        )}

        {ride.status === 'accepted' && !ride.pickup_verified && (
          <div className="space-y-3 p-4 border-2 border-amber-300 rounded-2xl bg-amber-50">
            <p className="font-semibold">Verify customer OTP</p>
            <p className="text-sm text-gray-600">Customer shows OTP in their app (demo: 987653)</p>
            <input type="text" inputMode="numeric" maxLength={6} value={pickupOtpInput}
              onChange={(e) => setPickupOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="987653"
              className="w-full border-2 rounded-xl p-3 text-center text-2xl font-bold tracking-widest" />
            <button type="button" onClick={verifyPickupOtp} disabled={actionLoading}
              className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold disabled:opacity-50">
              Verify OTP
            </button>
          </div>
        )}

        {ride.status === 'accepted' && ride.pickup_verified && (
          <button type="button" onClick={startRide} disabled={actionLoading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold disabled:opacity-50">
            Start Ride
          </button>
        )}

        {ride.status === 'started' && (
          <button type="button" onClick={completeRide} disabled={actionLoading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold disabled:opacity-50">
            Complete Ride
          </button>
        )}

        {ride.status === 'completed' && (
          <button type="button" onClick={() => navigate('/driver')}
            className="w-full bg-black text-white py-3 rounded-xl font-bold">
            Back to Dashboard
          </button>
        )}
      </aside>
    </div>
  );
};

export default DriverRide;
