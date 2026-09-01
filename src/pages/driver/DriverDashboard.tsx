import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { notifyError, notifySuccess } from '../../utils/toastNotify';

const DEFAULT_LOCATION = { latitude: 8.2875, longitude: 77.105 }; // Eramanthurai

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [driver, setDriver] = useState<any>(null);
  const [pendingRides, setPendingRides] = useState<any[]>([]);
  const seenRideIds = React.useRef<Set<string>>(new Set());
  const [activeRide, setActiveRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  const loadDriverProfile = useCallback(async () => {
    try {
      const response = await api.get('/drivers/me');
      setDriver(response.data);
      setIsOnline(response.data.is_online);
      setNoProfile(false);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setNoProfile(true);
      } else {
        notifyError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPendingRides = useCallback(async () => {
    try {
      const response = await api.get('/rides/pending');
      const rides = response.data || [];
      for (const ride of rides) {
        if (!seenRideIds.current.has(ride.id)) {
          seenRideIds.current.add(ride.id);
          notifySuccess(
            `New ride! ${ride.pickup_address} → ${ride.dropoff_address} · ₹${Math.round(ride.estimated_fare)}`,
            `ride-req-${ride.id}`
          );
        }
      }
      setPendingRides(rides);
    } catch {
      /* driver may be offline */
    }
  }, []);

  const loadActiveRide = useCallback(async () => {
    try {
      const response = await api.get('/rides/driver/active');
      setActiveRide(response.data);
    } catch {
      setActiveRide(null);
    }
  }, []);

  useEffect(() => {
    loadDriverProfile();
  }, [loadDriverProfile]);

  useEffect(() => {
    if (!driver?.is_approved || !isOnline) return;

    updateLocation(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    loadPendingRides();
    loadActiveRide();

    const interval = setInterval(() => {
      loadPendingRides();
      loadActiveRide();
    }, 5000);

    return () => clearInterval(interval);
  }, [driver, isOnline, loadPendingRides, loadActiveRide]);

  const updateLocation = async (latitude: number, longitude: number) => {
    try {
      await api.post('/drivers/location', { latitude, longitude });
    } catch {
      console.error('Failed to update location');
    }
  };

  const toggleOnline = async () => {
    try {
      const goingOnline = !isOnline;
      await api.post(`/drivers/toggle-online?is_online=${goingOnline}`);
      setIsOnline(goingOnline);
      if (goingOnline) {
        await updateLocation(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
        notifySuccess('You are online — ready for rides', 'online');
      } else {
        notifySuccess('You are offline', 'offline');
      }
    } catch (error: any) {
      notifyError(error.response?.data?.detail || 'Failed to toggle status');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (noProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Complete Driver Setup</h2>
          <p className="text-gray-600 mb-6">Register your vehicle to start accepting rides.</p>
          <button
            onClick={() => navigate('/register')}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold"
          >
            Register as Driver
          </button>
        </div>
      </div>
    );
  }

  if (!driver?.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-2">Pending Approval</h2>
          <p className="text-gray-600">
            Your driver application is under review. You'll be notified once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">Driver Dashboard</h1>
        <button onClick={() => navigate('/profile')} className="text-gray-600 hover:text-primary">
          Profile
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">{isOnline ? 'You are Online' : 'You are Offline'}</h2>
              <p className="text-gray-600">
                {isOnline ? 'Ready to accept rides in Marthandam region' : 'Go online to receive ride requests'}
              </p>
            </div>
            <button
              onClick={toggleOnline}
              className={`relative inline-flex h-16 w-32 items-center rounded-full transition-colors ${
                isOnline ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-12 w-12 transform rounded-full bg-white shadow-lg transition-transform ${
                  isOnline ? 'translate-x-16' : 'translate-x-2'
                }`}
              />
            </button>
          </div>
        </div>

        {activeRide && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6">
            <h3 className="font-bold text-blue-800 mb-2">Active Ride — {activeRide.status.toUpperCase()}</h3>
            <p className="text-sm mb-3">{activeRide.pickup_address} → {activeRide.dropoff_address}</p>
            <button
              onClick={() => navigate(`/driver/ride/${activeRide.id}`)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              Manage Ride
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">New Ride Requests</h3>
          {!isOnline ? (
            <p className="text-center py-6 text-gray-500">Go online to see ride requests</p>
          ) : pendingRides.length === 0 ? (
            <p className="text-center py-6 text-gray-500">No ride requests right now</p>
          ) : (
            <div className="space-y-3">
              {pendingRides.map((ride) => (
                <div key={ride.id} className="border-2 border-orange-200 bg-orange-50 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-semibold">{ride.pickup_address}</p>
                      <p className="text-sm text-gray-600">→ {ride.dropoff_address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(ride.vehicle_type || 'bike').toUpperCase()} · {ride.passenger_count || 1} passenger · Cash
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">₹{Math.round(ride.estimated_fare)}</p>
                      <p className="text-xs text-gray-500">{ride.distance_km?.toFixed(1)} km</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/driver/ride/${ride.id}`)}
                    className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600"
                  >
                    View & Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Vehicle Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type</span>
              <span className="font-semibold capitalize">{driver.vehicle_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle #</span>
              <span className="font-semibold">{driver.vehicle_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Rides</span>
              <span className="font-semibold">{driver.total_rides}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
