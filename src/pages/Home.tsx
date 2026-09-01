import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { MapClickEvent } from '../components/Map';
import MapControls from '../components/MapControls';
import GeolocationBanner from '../components/GeolocationBanner';
import { useGeolocation } from '../hooks/useGeolocation';
import { rideAPI } from '../services/api';
import { ROUTE_PRESETS, SERVICE_AREA_NAME, SERVICE_AREA_CENTER } from '../constants/serviceArea';
import { reverseGeocode } from '../utils/format';
import toast from 'react-hot-toast';

type RideMode = 'now' | 'scheduled';
type ActiveField = 'pickup' | 'dropoff' | null;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const geo = useGeolocation(false);
  const [pickup, setPickup] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoff, setDropoff] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [activeField, setActiveField] = useState<ActiveField>('pickup');
  const [rideMode, setRideMode] = useState<RideMode>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [vehicleType, setVehicleType] = useState<'bike' | 'auto' | 'car'>('auto');
  const [passengerCount, setPassengerCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [fitRouteKey, setFitRouteKey] = useState(0);

  const setLocationAddress = async (lat: number, lng: number, setter: (a: string) => void) => {
    setResolvingAddress(true);
    try {
      setter(await reverseGeocode(lat, lng));
    } catch {
      setter(`Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setResolvingAddress(false);
    }
  };

  const calculateFare = useCallback((
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    vType: 'bike' | 'auto' | 'car' = vehicleType
  ) => {
    const R = 6371;
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const rates = { bike: { base: 20, perKm: 8 }, auto: { base: 40, perKm: 12 }, car: { base: 60, perKm: 15 } };
    setEstimatedFare(Math.round(rates[vType].base + distance * rates[vType].perKm));
  }, [vehicleType]);

  const applyCoords = async (lat: number, lng: number, field: ActiveField) => {
    if (field === 'pickup') {
      setPickup({ lat, lng });
      await setLocationAddress(lat, lng, setPickupAddress);
      setActiveField('dropoff');
    } else if (field === 'dropoff') {
      setDropoff({ lat, lng });
      await setLocationAddress(lat, lng, setDropoffAddress);
      if (pickup) calculateFare(pickup, { lat, lng });
      setActiveField(null);
      setFitRouteKey((k) => k + 1);
    }
  };

  const handleMapClick = async (e: MapClickEvent) => {
    if (!e.latLng || !activeField) return;
    await applyCoords(e.latLng.lat(), e.latLng.lng(), activeField);
  };

  const useMyLocationForPickup = async () => {
    geo.retry();
    if (geo.latitude != null && geo.longitude != null) {
      await applyCoords(geo.latitude, geo.longitude, 'pickup');
      return;
    }
    setTimeout(async () => {
      if (geo.latitude != null && geo.longitude != null) {
        await applyCoords(geo.latitude, geo.longitude, 'pickup');
      }
    }, 1500);
  };

  const applyPreset = (preset: (typeof ROUTE_PRESETS)[0]) => {
    setPickup({ lat: preset.pickup.lat, lng: preset.pickup.lng });
    setDropoff({ lat: preset.dropoff.lat, lng: preset.dropoff.lng });
    setPickupAddress(preset.pickup.address);
    setDropoffAddress(preset.dropoff.address);
    calculateFare(preset.pickup, preset.dropoff);
    setActiveField(null);
    setFitRouteKey((k) => k + 1);
  };

  const getScheduledAt = (): string | undefined => {
    if (rideMode !== 'scheduled' || !scheduleDate || !scheduleTime) return undefined;
    return new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
  };

  const handleBookRide = async () => {
    if (!pickup || !dropoff) {
      toast.error('Select pickup and dropoff on the map');
      return;
    }
    if (rideMode === 'scheduled' && (!scheduleDate || !scheduleTime)) {
      toast.error('Choose date and time for scheduled ride');
      return;
    }

    const scheduledAt = getScheduledAt();
    if (scheduledAt && new Date(scheduledAt) <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        pickup_latitude: pickup.lat,
        pickup_longitude: pickup.lng,
        pickup_address: pickupAddress,
        dropoff_latitude: dropoff.lat,
        dropoff_longitude: dropoff.lng,
        dropoff_address: dropoffAddress,
        payment_method: 'cash',
        vehicle_type: vehicleType,
        passenger_count: passengerCount,
      };
      if (scheduledAt) payload.scheduled_at = scheduledAt;

      const response = await rideAPI.requestRide(payload);

      if (scheduledAt && new Date(scheduledAt) > new Date()) {
        toast.success(`Ride scheduled for ${new Date(scheduledAt).toLocaleString()}`);
        navigate('/rides');
      } else {
        toast.success('Finding drivers…');
        navigate(`/ride/${response.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  const markers = [];
  if (pickup) markers.push({ ...pickup, label: 'A' });
  if (dropoff) markers.push({ ...dropoff, label: 'B' });

  const mapCenter = pickup || dropoff || (geo.latitude && geo.longitude
    ? { lat: geo.latitude, lng: geo.longitude }
    : SERVICE_AREA_CENTER);

  const minDate = new Date().toISOString().split('T')[0];
  const canBook = pickup && dropoff && estimatedFare;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">RideShare</h1>
        <nav className="hidden md:flex gap-6 text-sm text-gray-600">
          <span className="font-medium text-black">Request a ride</span>
          <button type="button" onClick={() => navigate('/rides')} className="hover:text-black">My rides</button>
        </nav>
        <button type="button" onClick={() => navigate('/profile')} className="text-sm font-medium text-gray-600 hover:text-black">
          Profile
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left panel — booking form (Uber-style) */}
        <aside className="w-full md:w-[420px] lg:w-[480px] flex-shrink-0 overflow-y-auto border-r border-gray-100 p-6 md:p-8 z-10 bg-white">
          <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
            <span>📍</span> {SERVICE_AREA_NAME}, Kanyakumari
          </p>
          <h2 className="text-3xl font-bold mb-6">Request a ride</h2>

          <GeolocationBanner
            error={geo.error}
            errorCode={geo.errorCode}
            loading={geo.loading}
            onRetry={geo.retry}
            onPickOnMap={() => setActiveField('pickup')}
          />

          {/* Now / Schedule */}
          <div className="flex gap-2 mb-5">
            {(['now', 'scheduled'] as RideMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setRideMode(mode)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold border-2 transition ${
                  rideMode === mode ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                {mode === 'now' ? 'Ride now' : 'Schedule'}
              </button>
            ))}
          </div>

          {rideMode === 'scheduled' && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Date</label>
                <input
                  type="date"
                  min={minDate}
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:border-black outline-none"
                />
              </div>
            </div>
          )}

          {/* Pickup / Dropoff fields */}
          <div className="relative mb-4">
            <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-300" />
            <div className="space-y-2">
              <div
                className={`relative flex items-center gap-3 rounded-xl border-2 bg-gray-50 px-4 py-3 transition ${
                  activeField === 'pickup' ? 'border-black ring-2 ring-black/10' : 'border-gray-200'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-black flex-shrink-0 z-10" />
                <input
                  type="text"
                  placeholder="Pickup location"
                  value={pickupAddress}
                  onFocus={() => setActiveField('pickup')}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={useMyLocationForPickup}
                  disabled={geo.loading}
                  title="Use current location"
                  className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"
                >
                  {geo.loading ? '…' : '🎯'}
                </button>
              </div>
              <div
                className={`relative flex items-center gap-3 rounded-xl border-2 bg-gray-50 px-4 py-3 transition ${
                  activeField === 'dropoff' ? 'border-black ring-2 ring-black/10' : 'border-gray-200'
                }`}
              >
                <span className="w-3 h-3 rounded-sm bg-black flex-shrink-0 z-10" />
                <input
                  type="text"
                  placeholder="Dropoff location"
                  value={dropoffAddress}
                  onFocus={() => setActiveField('dropoff')}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {activeField && (
            <p className="text-xs text-primary font-medium mb-4">
              Tap on the map to set {activeField === 'pickup' ? 'pickup' : 'dropoff'}
              {resolvingAddress && ' · finding address…'}
            </p>
          )}

          {/* Vehicle */}
          <p className="text-xs font-medium text-gray-500 mb-2">Vehicle</p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {([
              { type: 'bike' as const, label: 'Bike', pax: 1, icon: '🏍' },
              { type: 'auto' as const, label: 'Auto', pax: 3, icon: '🛺' },
              { type: 'car' as const, label: 'Car', pax: 4, icon: '🚗' },
            ]).map((v) => (
              <button
                key={v.type}
                type="button"
                onClick={() => {
                  setVehicleType(v.type);
                  setPassengerCount(v.pax);
                  if (pickup && dropoff) calculateFare(pickup, dropoff, v.type);
                }}
                className={`p-3 rounded-xl border-2 text-center transition ${
                  vehicleType === v.type ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{v.icon}</span>
                <p className="font-semibold text-sm mt-1">{v.label}</p>
              </button>
            ))}
          </div>

          {/* Suggestions */}
          <p className="text-sm font-semibold text-gray-800 mb-2">Popular routes</p>
          <div className="space-y-1 mb-6 max-h-36 overflow-y-auto">
            {ROUTE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
              >
                <span className="text-gray-400">🕐</span>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{preset.name}</p>
                  <p className="text-xs text-gray-500 truncate">{preset.dropoff.address}</p>
                </div>
              </button>
            ))}
          </div>

          {estimatedFare && (
            <div className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-sm text-gray-500">Estimated fare · Cash</p>
              <p className="text-3xl font-bold">₹{estimatedFare}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleBookRide}
            disabled={loading || !canBook}
            className="w-full py-4 rounded-xl bg-black text-white font-bold text-lg hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Booking…' : rideMode === 'now' ? 'See prices & book' : 'Schedule ride'}
          </button>
        </aside>

        {/* Right panel — map */}
        <div className="flex-1 relative min-h-[45vh] md:min-h-0 order-first md:order-last">
          <Map
            key={fitRouteKey}
            center={mapCenter}
            markers={markers}
            onMapClick={handleMapClick}
            fitRoute={!!pickup && !!dropoff}
          />
          <MapControls
            onMyLocation={useMyLocationForPickup}
            locating={geo.loading}
            showFitRoute={!!pickup && !!dropoff}
            onFitRoute={() => setFitRouteKey((k) => k + 1)}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
