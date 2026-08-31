import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function statusBadge(status: string): string {
  const colors: Record<string, string> = {
    requested: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    started: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

const RideManagement: React.FC = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      const response = await api.get('/admin/rides');
      setRides(response.data);
    } catch {
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/admin')} className="text-gray-600 mr-4">← Back</button>
        <h1 className="text-xl font-bold text-primary">All Rides</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : rides.length === 0 ? (
          <p className="text-center py-16 text-gray-500">No rides recorded yet</p>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusBadge(ride.status)}`}>
                    {ride.status}
                  </span>
                  <span className="font-bold text-primary">
                    ₹{Math.round(ride.actual_fare ?? ride.estimated_fare)}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="text-green-600 font-bold mr-1">A</span>
                    {ride.pickup_address}
                  </p>
                  <p className="text-sm">
                    <span className="text-red-600 font-bold mr-1">B</span>
                    {ride.dropoff_address}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-500">
                  <span>{formatDateTime(ride.completed_at || ride.created_at)}</span>
                  <span>{ride.distance_km?.toFixed(1)} km</span>
                  <span className="capitalize">{ride.payment_method}</span>
                  {ride.customer_name && <span>Customer: {ride.customer_name}</span>}
                  {ride.driver_name && <span>Driver: {ride.driver_name}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideManagement;
