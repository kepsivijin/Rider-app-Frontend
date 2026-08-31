import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    requested: 'Requested', accepted: 'Accepted', started: 'In Progress',
    completed: 'Completed', cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

const RideHistory: React.FC = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      const response = await api.get('/rides/driver/history');
      setRides(response.data);
    } catch {
      toast.error('Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/driver')} className="text-gray-600 mr-4">← Back</button>
        <h1 className="text-xl font-bold text-primary">My Rides</h1>
      </div>
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : rides.length === 0 ? (
          <p className="text-center py-16 text-gray-500">No rides yet</p>
        ) : (
          rides.map((ride) => (
            <button
              key={ride.id}
              onClick={() => navigate(`/driver/ride/${ride.id}`)}
              className="w-full bg-white rounded-xl shadow p-4 text-left"
            >
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full">
                  {formatStatus(ride.status)}
                </span>
                <span className="font-bold text-primary">
                  ₹{Math.round(ride.actual_fare ?? ride.estimated_fare)}
                </span>
              </div>
              <p className="font-medium truncate">{ride.pickup_address}</p>
              <p className="text-sm text-gray-500 truncate">→ {ride.dropoff_address}</p>
              <p className="text-xs text-gray-400 mt-2">
                {formatDateTime(ride.completed_at || ride.created_at)}
                {ride.customer_name && ` · ${ride.customer_name}`}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default RideHistory;
