import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8001';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp?: string;
}

export const useRideTracking = (
  rideId: string | null,
  userType: 'customer' | 'driver',
  options?: {
    enabled?: boolean;
    simulateMovement?: boolean;
    from?: { lat: number; lng: number };
    to?: { lat: number; lng: number };
    rideStatus?: string;
  }
) => {
  const [liveLocation, setLiveLocation] = useState<LocationPoint | null>(null);
  const [driverPath, setDriverPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simProgressRef = useRef(0);

  const pushLocation = (latitude: number, longitude: number, timestamp?: string) => {
    const point = { latitude, longitude, timestamp: timestamp || new Date().toISOString() };
    setLiveLocation(point);
    setDriverPath((prev) => [...prev, { lat: latitude, lng: longitude }].slice(-30));
  };

  const emitLocation = (latitude: number, longitude: number) => {
    const payload = {
      ride_id: rideId,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    };
    socketRef.current?.emit('driver_location_update', payload);
    pushLocation(latitude, longitude, payload.timestamp);
  };

  useEffect(() => {
    if (!rideId || options?.enabled === false) return;

    const socket = io(WS_URL, {
      transports: ['websocket'],
      path: '/ws/socket.io/',
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_ride', { ride_id: rideId, user_type: userType });
    });

    if (userType === 'customer') {
      socket.on('customer_location_receive', (data: LocationPoint) => {
        pushLocation(data.latitude, data.longitude, data.timestamp);
      });
    }

    return () => {
      socket.emit('leave_ride', { ride_id: rideId });
      socket.disconnect();
    };
  }, [rideId, userType, options?.enabled]);

  useEffect(() => {
    if (userType !== 'driver' || !rideId || options?.enabled === false) return;

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => emitLocation(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [userType, rideId, options?.enabled]);

  useEffect(() => {
    const canSim =
      userType === 'driver' &&
      rideId &&
      options?.simulateMovement &&
      options?.from &&
      options?.to &&
      options?.rideStatus === 'started';

    if (!canSim) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      simProgressRef.current = 0;
      return;
    }

    simIntervalRef.current = setInterval(() => {
      simProgressRef.current = Math.min(1, simProgressRef.current + 0.06);
      const t = simProgressRef.current;
      const lat = options.from!.lat + (options.to!.lat - options.from!.lat) * t;
      const lng = options.from!.lng + (options.to!.lng - options.from!.lng) * t;
      emitLocation(lat, lng);
    }, 2000);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [userType, rideId, options?.simulateMovement, options?.from, options?.to, options?.rideStatus]);

  return { liveLocation, driverPath };
};
