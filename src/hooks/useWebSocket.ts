import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8001';

export const useWebSocket = (rideId: string | null, onLocationUpdate: (data: any) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!rideId) return;

    socketRef.current = io(WS_URL, {
      transports: ['websocket'],
      path: '/ws/socket.io/',
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      socketRef.current?.emit('join_ride', {
        ride_id: rideId,
        user_type: 'customer',
      });
    });

    socketRef.current.on('customer_location_receive', (data) => {
      console.log('Location update:', data);
      onLocationUpdate(data);
    });

    socketRef.current.on('ride_status_update', (data) => {
      console.log('Ride status update:', data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_ride', { ride_id: rideId });
        socketRef.current.disconnect();
      }
    };
  }, [rideId, onLocationUpdate]);

  return socketRef.current;
};
