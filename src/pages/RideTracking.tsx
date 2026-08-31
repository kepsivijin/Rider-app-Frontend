import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import RideStatusTimeline from '../components/RideStatusTimeline';
import { useWebSocket } from '../hooks/useWebSocket';
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
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [driverPath, setDriverPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [loading, setLoading] = useState(true);

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
        toast.success(`Driver accepted! ${next.driver_name || 'Driver'} · ${next.driver_vehicle || ''}`);
      }
      if (prevStatusRef.current === 'accepted' && next.status === 'started') {
        toast.success('Ride started — heading to your destination');
      }
      prevStatusRef.current = next.status;

      if (next.status === 'completed') {
        toast.success('Ride completed! Pay cash to driver.');
        setTimeout(() => navigate(`/ride/${rideId}/complete`), 1200);
      }
    } catch {
      toast.error('Failed to load ride');
    }
  };

  const handleLocationUpdate = (data: any) => {
    const point = { latitude: data.latitude, longitude: data.longitude, timestamp: data.timestamp };
    setDriverLocation(point);
    setDriverPath((prev) => {
      const next = [...prev, { lat: point.latitude, lng: point.longitude }];
      return next.slice(-20);
    });
  };

  useWebSocket(rideId || null, handleLocationUpdate);

  if (loading || !ride) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  const markers = [
    { lat: ride.pickup_latitude, lng: ride.pickup_longitude, label: 'A' },
    { lat: ride.dropoff_latitude, lng: ride.dropoff_longitude, label: 'B' },
  ];
  if (driverLocation) {
    markers.push({ lat: driverLocation.latitude, lng: driverLocation.longitude, label: '🚗' });
  }

  const mapCenter = driverLocation
    ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
    : { lat: ride.pickup_latitude, lng: ride.pickup_longitude };

  const statusText: Record<string, string> = {
    requested: 'Finding nearby driver…',
    accepted: 'Driver is coming to pickup',
    started: 'On the way to dropoff',
    completed: 'Ride completed',
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="text-gray-600 mr-4">←</button>
          <div>
            <h1 className="text-lg font-bold text-primary">Live Ride</h1>
            <p className="text-xs text-gray-500">{statusText[ride.status] || ride.status}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Cash fare</p>
          <p className="font-bold text-primary">₹{Math.round(ride.estimated_fare)}</p>
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        <Map
          center={mapCenter}
          markers={markers}
          trackingMode
          driverPath={driverPath}
        />
      </div>

      <div className="bg-white border-t shadow-lg p-4 max-h-[45vh] overflow-y-auto">
        <RideStatusTimeline status={ride.status} />

        {ride.status === 'requested' && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Waiting for a driver to accept…</p>
          </div>
        )}

        {ride.driver_id && ride.status !== 'requested' && (
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Driver</p>
                <p className="font-semibold">{ride.driver_name}</p>
                <p className="text-xs text-gray-600">{ride.driver_vehicle}</p>
              </div>
              {driverLocation && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Live on map</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-green-50 p-2 rounded-lg">
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-medium line-clamp-2">{ride.pickup_address}</p>
              </div>
              <div className="bg-red-50 p-2 rounded-lg">
                <p className="text-xs text-gray-500">Dropoff</p>
                <p className="font-medium line-clamp-2">{ride.dropoff_address}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideTracking;
