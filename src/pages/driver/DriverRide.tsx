import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Map from '../../components/Map';
import { api, rideAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DriverRide: React.FC = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pickupOtpInput, setPickupOtpInput] = useState('');

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
      toast.success('Ride accepted! Ask customer for pickup OTP (987653 in demo)');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to accept ride');
    } finally {
      setActionLoading(false);
    }
  };

  const verifyPickupOtp = async () => {
    if (!pickupOtpInput.trim()) {
      toast.error('Enter the OTP from the customer');
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
      toast.success('Ride started — heading to dropoff');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to start ride');
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
      toast.error(error.response?.data?.detail || 'Failed to complete ride');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !ride) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    requested: 'New Request',
    accepted: 'Go to Pickup',
    started: 'On Trip',
    completed: 'Completed',
  };

  const markers = [
    { lat: ride.pickup_latitude, lng: ride.pickup_longitude, label: 'A' },
    { lat: ride.dropoff_latitude, lng: ride.dropoff_longitude, label: 'B' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/driver')} className="text-gray-600 mr-4">← Back</button>
        <h1 className="text-xl font-bold text-primary">{statusLabel[ride.status] || ride.status}</h1>
      </div>

      <div className="h-64 min-h-[240px] relative">
        <Map
          center={{ lat: ride.pickup_latitude, lng: ride.pickup_longitude }}
          markers={markers}
          trackingMode
        />
      </div>

      <div className="p-6 space-y-4 flex-1">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">A</span>
              <div>
                <p className="text-sm text-gray-500">Pickup</p>
                <p className="font-semibold">{ride.pickup_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">B</span>
              <div>
                <p className="text-sm text-gray-500">Dropoff</p>
                <p className="font-semibold">{ride.dropoff_address}</p>
              </div>
            </div>
            <div className="bg-primary/10 p-4 rounded-xl flex justify-between items-center">
              <span className="text-gray-600">Fare</span>
              <span className="text-2xl font-bold text-primary">₹{Math.round(ride.estimated_fare)}</span>
            </div>
            <div className="text-sm text-gray-500">
              Distance: {ride.distance_km?.toFixed(1)} km · Cash
              {ride.passenger_count ? ` · ${ride.passenger_count} passenger` : ''}
            </div>
            {ride.customer_name && (
              <div className="text-sm">
                <span className="text-gray-500">Customer: </span>
                <span className="font-semibold">{ride.customer_name}</span>
                {ride.customer_phone && <span className="text-gray-500"> · {ride.customer_phone}</span>}
              </div>
            )}
          </div>
        </div>

        {ride.status === 'requested' && (
          <button
            onClick={acceptRide}
            disabled={actionLoading}
            className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 disabled:opacity-50"
          >
            {actionLoading ? 'Accepting...' : 'Accept Ride'}
          </button>
        )}

        {ride.status === 'accepted' && !ride.pickup_verified && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
            <p className="font-semibold text-gray-800">Verify customer pickup OTP</p>
            <p className="text-sm text-gray-600">Ask the customer for the OTP shown in their app (demo: 987653)</p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pickupOtpInput}
              onChange={(e) => setPickupOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter customer OTP"
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-center text-2xl tracking-widest font-bold"
            />
            <button
              onClick={verifyPickupOtp}
              disabled={actionLoading}
              className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50"
            >
              {actionLoading ? 'Verifying...' : 'Verify Customer OTP'}
            </button>
          </div>
        )}

        {ride.status === 'accepted' && ride.pickup_verified && (
          <button
            onClick={startRide}
            disabled={actionLoading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {actionLoading ? 'Starting...' : 'Arrived — Start Ride (Pickup Done)'}
          </button>
        )}

        {ride.status === 'started' && (
          <button
            onClick={completeRide}
            disabled={actionLoading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading ? 'Completing...' : 'Reached Dropoff — Complete Ride'}
          </button>
        )}

        {ride.status === 'completed' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center text-green-700 font-semibold">
              Ride completed successfully!
            </div>
            <button
              onClick={() => navigate('/driver')}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverRide;
