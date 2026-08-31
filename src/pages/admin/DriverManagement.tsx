import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const DriverManagement: React.FC = () => {
  const navigate = useNavigate();
  const [allDrivers, setAllDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    vehicle_type: 'bike',
    passenger_capacity: 1,
    vehicle_number: '',
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const response = await api.get('/admin/drivers');
      setAllDrivers(response.data);
    } catch {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId: string) => {
    try {
      await api.post(`/admin/drivers/${driverId}/approve`);
      toast.success('Driver approved successfully');
      loadDrivers();
    } catch {
      toast.error('Failed to approve driver');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/drivers', form);
      toast.success('Driver created — they can login with this phone + OTP 123456');
      setForm({ full_name: '', phone_number: '', vehicle_type: 'bike', passenger_capacity: 1, vehicle_number: '' });
      loadDrivers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create driver');
    } finally {
      setCreating(false);
    }
  };

  const onVehicleChange = (vehicle_type: string) => {
    const caps: Record<string, number> = { bike: 1, auto: 3, car: 4 };
    setForm({ ...form, vehicle_type, passenger_capacity: caps[vehicle_type] || 1 });
  };

  const handleReject = async (driverId: string) => {
    try {
      await api.post(`/admin/drivers/${driverId}/reject`);
      toast.success('Driver application rejected');
      loadDrivers();
    } catch {
      toast.error('Failed to reject driver');
    }
  };

  const filtered = allDrivers.filter((d) => {
    if (tab === 'pending') return !d.is_approved;
    if (tab === 'approved') return d.is_approved;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/admin')} className="text-gray-600 mr-4">← Back</button>
        <h1 className="text-xl font-bold text-primary">Driver Management</h1>
      </div>

      <div className="p-4">
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-4 mb-6 space-y-3">
          <h2 className="font-bold text-lg">Create Driver</h2>
          <p className="text-xs text-gray-500">Driver logs in with this phone number. OTP is 123456.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              placeholder="Full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="border rounded-lg p-3"
            />
            <input
              required
              placeholder="Phone (10 digits)"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              className="border rounded-lg p-3"
            />
            <select
              value={form.vehicle_type}
              onChange={(e) => onVehicleChange(e.target.value)}
              className="border rounded-lg p-3"
            >
              <option value="bike">Bike — 1 passenger</option>
              <option value="auto">Auto — 3 passengers</option>
              <option value="car">Car — 4 passengers</option>
            </select>
            <input
              type="number"
              min={1}
              max={8}
              value={form.passenger_capacity}
              onChange={(e) => setForm({ ...form, passenger_capacity: Number(e.target.value) })}
              className="border rounded-lg p-3"
              placeholder="Passengers"
            />
            <input
              required
              placeholder="Vehicle number (e.g. TN-75-AB-1234)"
              value={form.vehicle_number}
              onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
              className="border rounded-lg p-3 md:col-span-2"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Driver'}
          </button>
        </form>
        <div className="flex gap-2 mb-4">
          {(['all', 'pending', 'approved'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                tab === t ? 'bg-primary text-white' : 'bg-white text-gray-600 shadow'
              }`}
            >
              {t} ({t === 'all' ? allDrivers.length : allDrivers.filter((d) => (t === 'pending' ? !d.is_approved : d.is_approved)).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow">
            <p className="text-xl">No drivers in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((driver) => (
              <div key={driver.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{driver.full_name || 'Unknown Driver'}</h3>
                    <p className="text-gray-600">{driver.phone_number}</p>
                    {driver.email && <p className="text-sm text-gray-400">{driver.email}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      driver.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {driver.is_approved ? 'Approved' : 'Pending'}
                    </span>
                    {driver.is_online && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">Online</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Vehicle Type</p>
                    <p className="font-semibold capitalize">{driver.vehicle_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Passengers</p>
                    <p className="font-semibold">{driver.passenger_capacity || 1}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Vehicle Number</p>
                    <p className="font-semibold">{driver.vehicle_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">License</p>
                    <p className="font-semibold">{driver.license_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Rides</p>
                    <p className="font-semibold">{driver.total_rides} · ★ {driver.rating}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">License Expiry</p>
                    <p className="font-semibold">{new Date(driver.license_expiry).toLocaleDateString()}</p>
                  </div>
                  {driver.current_latitude && (
                    <div className="md:col-span-2">
                      <p className="text-gray-500">Last Location</p>
                      <p className="font-semibold">{driver.current_latitude.toFixed(4)}, {driver.current_longitude.toFixed(4)}</p>
                    </div>
                  )}
                </div>

                {!driver.is_approved && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(driver.id)}
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600"
                    >
                      ✓ Approve Driver
                    </button>
                    <button
                      onClick={() => handleReject(driver.id)}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverManagement;
