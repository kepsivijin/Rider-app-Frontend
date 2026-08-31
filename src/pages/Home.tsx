import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { MapClickEvent } from '../components/Map';
import { useGeolocation } from '../hooks/useGeolocation';
import { rideAPI } from '../services/api';
import { ROUTE_PRESETS, SERVICE_AREA_NAME } from '../constants/serviceArea';
import { reverseGeocode } from '../utils/format';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const { latitude, longitude, error } = useGeolocation();
  const [pickup, setPickup] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [step, setStep] = useState<'select' | 'pickup' | 'dropoff' | 'confirm'>('select');
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [vehicleType, setVehicleType] = useState<'bike' | 'auto' | 'car'>('bike');
  const [passengerCount, setPassengerCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const navigate = useNavigate();

  const setLocationAddress = async (
    lat: number,
    lng: number,
    setter: (addr: string) => void
  ) => {
    setResolvingAddress(true);
    try {
      const address = await reverseGeocode(lat, lng);
      setter(address);
    } catch {
      setter(`Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setResolvingAddress(false);
    }
  };

  const handleMapClick = async (e: MapClickEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    if (step === 'pickup') {
      setPickup({ lat, lng });
      await setLocationAddress(lat, lng, setPickupAddress);
      setStep('dropoff');
    } else if (step === 'dropoff') {
      setDropoff({ lat, lng });
      await setLocationAddress(lat, lng, setDropoffAddress);
      calculateFare(pickup!, { lat, lng });
      setStep('confirm');
    }
  };

  const calculateFare = (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    vType: 'bike' | 'auto' | 'car' = vehicleType
  ) => {
    const R = 6371;
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    const rates = { bike: { base: 20, perKm: 8 }, auto: { base: 40, perKm: 12 }, car: { base: 60, perKm: 15 } };
    const fare = rates[vType].base + distance * rates[vType].perKm;
    setEstimatedFare(Math.round(fare));
  };

  const applyPreset = (preset: (typeof ROUTE_PRESETS)[0]) => {
    setPickup({ lat: preset.pickup.lat, lng: preset.pickup.lng });
    setDropoff({ lat: preset.dropoff.lat, lng: preset.dropoff.lng });
    setPickupAddress(preset.pickup.address);
    setDropoffAddress(preset.dropoff.address);
    calculateFare(
      { lat: preset.pickup.lat, lng: preset.pickup.lng },
      { lat: preset.dropoff.lat, lng: preset.dropoff.lng }
    );
    setStep('confirm');
  };

  const handleBookRide = async () => {
    if (!pickup || !dropoff) return;

    setLoading(true);
    try {
      const response = await rideAPI.requestRide({
        pickup_latitude: pickup.lat,
        pickup_longitude: pickup.lng,
        pickup_address: pickupAddress,
        dropoff_latitude: dropoff.lat,
        dropoff_longitude: dropoff.lng,
        dropoff_address: dropoffAddress,
        payment_method: 'cash',
        vehicle_type: vehicleType,
        passenger_count: passengerCount,
      });

      toast.success('Ride requested! Finding drivers...');
      navigate(`/ride/${response.data.id}`);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to book ride';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const markers = [];
  if (pickup) markers.push({ ...pickup, label: 'A' });
  if (dropoff) markers.push({ ...dropoff, label: 'B' });

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">RideShare</h1>
        <button
          onClick={() => navigate('/profile')}
          className="text-gray-600 hover:text-primary"
        >
          Profile
        </button>
      </div>

      <div className="flex-1 relative">
        <Map
          center={latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
          markers={markers}
          onMapClick={handleMapClick}
        />

        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-100 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6">
          {step === 'select' && (
            <div>
              <h2 className="text-2xl font-bold mb-1">Book a Ride</h2>
              <p className="text-xs text-gray-500 mb-4">
                {SERVICE_AREA_NAME}: Eramanthurai, Vallavilai, Nithiravilai, Marthandam
              </p>
              <button
                onClick={async () => {
                  if (latitude && longitude) {
                    setPickup({ lat: latitude, lng: longitude });
                    setStep('dropoff');
                    await setLocationAddress(latitude, longitude, setPickupAddress);
                  } else {
                    setStep('pickup');
                  }
                }}
                disabled={resolvingAddress}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 transition mb-4 disabled:opacity-50"
              >
                {resolvingAddress ? 'Finding address...' : latitude && longitude ? 'Use Current Location' : 'Select Pickup on Map'}
              </button>
              <p className="text-sm text-gray-500 mb-2">Popular routes</p>
              <div className="space-y-2">
                {ROUTE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="w-full text-left p-3 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition"
                  >
                    <p className="font-medium text-gray-800">{preset.name}</p>
                    <p className="text-xs text-gray-500">{preset.pickup.address} → {preset.dropoff.address}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'pickup' && (
            <div>
              <h2 className="text-xl font-bold mb-2">Select Pickup Location</h2>
              <p className="text-gray-600 mb-4">Tap inside the blue area — {SERVICE_AREA_NAME} only</p>
              {pickup && (
                <button
                  onClick={() => setStep('dropoff')}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold"
                >
                  Next: Select Dropoff
                </button>
              )}
            </div>
          )}

          {step === 'dropoff' && (
            <div>
              <h2 className="text-xl font-bold mb-2">Select Dropoff Location</h2>
              <p className="text-gray-600 mb-4">Tap destination inside the blue service area</p>
              {dropoff && (
                <button
                  onClick={() => setStep('confirm')}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold"
                >
                  Confirm Locations
                </button>
              )}
            </div>
          )}

          {step === 'confirm' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Confirm Ride</h2>
              <div className="space-y-3 mb-4">
                <div className="flex items-start">
                  <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    A
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">Pickup</p>
                    <p className="font-medium">{pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    B
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">Dropoff</p>
                    <p className="font-medium">{dropoffAddress}</p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Vehicle / passengers</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { type: 'bike' as const, label: 'Bike', pax: 1 },
                    { type: 'auto' as const, label: 'Auto', pax: 3 },
                    { type: 'car' as const, label: 'Car', pax: 4 },
                  ]).map((v) => (
                    <button
                      key={v.type}
                      type="button"
                      onClick={() => {
                        setVehicleType(v.type);
                        setPassengerCount(v.pax);
                        if (pickup && dropoff) calculateFare(pickup, dropoff, v.type);
                      }}
                      className={`p-3 rounded-xl border-2 text-center ${
                        vehicleType === v.type ? 'border-primary bg-primary/10' : 'border-gray-200'
                      }`}
                    >
                      <p className="font-semibold">{v.label}</p>
                      <p className="text-xs text-gray-500">{v.pax} seat{v.pax > 1 ? 's' : ''}</p>
                    </button>
                  ))}
                </div>
              </div>
              {estimatedFare && (
                <div className="bg-primary/10 p-4 rounded-xl mb-4">
                  <p className="text-sm text-gray-600">Estimated Fare · Cash only</p>
                  <p className="text-3xl font-bold text-primary">₹{estimatedFare}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStep('select');
                    setPickup(null);
                    setDropoff(null);
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookRide}
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Booking...' : 'Book Ride'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
