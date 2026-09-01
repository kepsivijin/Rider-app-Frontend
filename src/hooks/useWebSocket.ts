import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8001';

export const useWebSocket = (
  rideId: string | null,
  onLocationUpdate: (data: any) => void,
  userType: 'customer' | 'driver' = 'customer'
) => {
  const socketRef = useRef<Socket | null>(null);
  const onUpdateRef = useRef(onLocationUpdate);
  onUpdateRef.current = onLocationUpdate;

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

    socket.on('customer_location_receive', (data) => {
      onUpdateRef.current(data);
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

  return { socket: socketRef.current, emitDriverLocation };
};
