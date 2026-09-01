import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8001';

export interface LocationPayload {
  ride_id: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
  user_type?: 'driver' | 'customer';
}

export const useWebSocket = (
  rideId: string | null,
  onDriverLocation?: (data: LocationPayload) => void,
  onCustomerLocation?: (data: LocationPayload) => void,
  userType: 'customer' | 'driver' = 'customer'
) => {
  const socketRef = useRef<Socket | null>(null);
  const onDriverRef = useRef(onDriverLocation);
  const onCustomerRef = useRef(onCustomerLocation);
  onDriverRef.current = onDriverLocation;
  onCustomerRef.current = onCustomerLocation;

  useEffect(() => {
    if (!rideId) return;

    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      path: '/ws/socket.io/',
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_ride', { ride_id: rideId, user_type: userType });
    });

    socket.on('customer_location_receive', (data: LocationPayload) => {
      onDriverRef.current?.({ ...data, user_type: 'driver' });
    });

    socket.on('driver_location_receive', (data: LocationPayload) => {
      onCustomerRef.current?.({ ...data, user_type: 'customer' });
    });

    socket.on('ride_status_update', (data) => {
      console.log('Ride status update:', data);
    });

    return () => {
      socket.emit('leave_ride', { ride_id: rideId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [rideId, userType]);

  const emitDriverLocation = useCallback(
    (latitude: number, longitude: number) => {
      if (!rideId || !socketRef.current?.connected) return;
      socketRef.current.emit('driver_location_update', {
        ride_id: rideId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    },
    [rideId]
  );

  const emitCustomerLocation = useCallback(
    (latitude: number, longitude: number) => {
      if (!rideId || !socketRef.current?.connected) return;
      socketRef.current.emit('customer_location_update', {
        ride_id: rideId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    },
    [rideId]
  );

  return { socket: socketRef.current, emitDriverLocation, emitCustomerLocation };
};
