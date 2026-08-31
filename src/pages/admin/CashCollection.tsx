import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const CashCollection: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/cash')
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load cash collection'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/admin')} className="text-gray-600 mr-4">← Back</button>
        <h1 className="text-xl font-bold text-primary">Cash Collection</h1>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-5">
                <p className="text-sm text-gray-500">Today (cash)</p>
                <p className="text-3xl font-bold text-green-600">₹{Math.round(data?.today_cash_collected || 0)}</p>
                <p className="text-xs text-gray-400 mt-1">{data?.today_rides || 0} rides</p>
              </div>
              <div className="bg-white rounded-xl shadow p-5">
                <p className="text-sm text-gray-500">Total collected</p>
                <p className="text-3xl font-bold text-primary">₹{Math.round(data?.total_cash_collected || 0)}</p>
                <p className="text-xs text-gray-400 mt-1">{data?.completed_rides || 0} completed rides</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3">Cash only — no online payment. Amounts recorded when rides complete.</p>
            <div className="space-y-3">
              {(data?.rides || []).map((ride: any) => (
                <div key={ride.id} className="bg-white rounded-xl shadow p-4 flex justify-between">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{ride.pickup} → {ride.dropoff}</p>
                    <p className="text-xs text-gray-400">
                      {ride.completed_at ? new Date(ride.completed_at).toLocaleString('en-IN') : ''} · Cash
                    </p>
                  </div>
                  <p className="font-bold text-primary ml-3">₹{Math.round(ride.amount)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CashCollection;
