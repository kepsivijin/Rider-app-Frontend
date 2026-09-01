import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideAPI } from '../services/api';
import { formatDateTime, formatStatus, statusColor } from '../utils/format';
import toast from 'react-hot-toast';

interface Ride {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  estimated_fare: number;
  actual_fare?: number;
  completed_at?: string;
  scheduled_at?: string;
  created_at: string;
  driver_name?: string;
}

const RideHistory: React.FC = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      const response = await rideAPI.getMyRides();
      setRides(response.data);
    } catch {
      toast.error('Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/profile')} className="text-gray-600 mr-4">← Back</button>
        <h1 className="text-xl font-bold text-primary">My Rides</h1>
      </div>

      <div className="p-4 space-y-3">
        {rides.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">No rides yet</p>
            <button onClick={() => navigate('/')} className="text-primary font-semibold">
              Book your first ride →
            </button>
          </div>
        ) : (
          rides.map((ride) => (
            <button
              key={ride.id}
              onClick={() =>
                ride.status === 'completed'
                  ? navigate(`/ride/${ride.id}/complete`)
                  : navigate(`/ride/${ride.id}`)
              }
              className="w-full bg-white rounded-xl shadow p-4 text-left hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(ride.status)}`}>
                    {formatStatus(ride.status)}
                  </span>
                  {ride.scheduled_at && ride.status === 'requested' && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      Scheduled
                    </span>
                  )}
                </div>
                <span className="font-bold text-primary">
                  ₹{Math.round(ride.actual_fare ?? ride.estimated_fare)}
                </span>
              </div>
              <p className="font-medium text-gray-800 truncate">{ride.pickup_address}</p>
              <p className="text-sm text-gray-500 truncate">→ {ride.dropoff_address}</p>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>
                  {ride.scheduled_at && ride.status === 'requested'
                    ? `Scheduled: ${formatDateTime(ride.scheduled_at)}`
                    : formatDateTime(ride.completed_at || ride.created_at)}
                </span>
                {ride.driver_name && <span>Driver: {ride.driver_name}</span>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default RideHistory;
