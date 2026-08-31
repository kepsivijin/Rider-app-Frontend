import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-activity'),
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Users</h3>
            <p className="text-4xl font-bold text-blue-600">{stats?.total_users || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Drivers</h3>
            <p className="text-4xl font-bold text-green-600">{stats?.total_drivers || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              {stats?.approved_drivers || 0} approved
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Online Drivers</h3>
            <p className="text-4xl font-bold text-yellow-600">{stats?.online_drivers || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Cash Collected</h3>
            <p className="text-4xl font-bold text-green-600">₹{Math.round(stats?.cash_collected || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">completed rides · cash only</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Quick Actions</h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/drivers')}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  <div className="text-left">
                    <p className="font-semibold">Create / Manage Drivers</p>
                    <p className="text-sm text-gray-600">Vehicle type & passenger capacity</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={() => navigate('/admin/cash')}
                className="w-full flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💵</span>
                  <div className="text-left">
                    <p className="font-semibold">Cash Collection</p>
                    <p className="text-sm text-gray-600">How much cash was paid</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={() => navigate('/admin/rides')}
                className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🚗</span>
                  <div className="text-left">
                    <p className="font-semibold">View All Rides</p>
                    <p className="text-sm text-gray-600">Monitor ride activity</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={() => navigate('/admin/users')}
                className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📱</span>
                  <div className="text-left">
                    <p className="font-semibold">Manage Users</p>
                    <p className="text-sm text-gray-600">View and manage customers</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚙️</span>
                  <div className="text-left">
                    <p className="font-semibold">Settings</p>
                    <p className="text-sm text-gray-600">Configure pricing and geofence</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity yet</p>
            ) : (
              <div className="space-y-4">
                {activity.map((item, i) => (
                  <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      item.type === 'ride' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <span className={`font-bold ${item.type === 'ride' ? 'text-purple-600' : 'text-blue-600'}`}>
                        {item.type === 'ride' ? 'R' : 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-gray-500 truncate">{item.detail}</p>
                    </div>
                    <p className="text-xs text-gray-400 ml-2 whitespace-nowrap">{timeAgo(item.timestamp)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
