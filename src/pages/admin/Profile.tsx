import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/')} className="text-gray-600 mr-4">
          ← Back
        </button>
        <h1 className="text-xl font-bold text-primary">Profile</h1>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-3xl text-primary mr-4">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.full_name}</h2>
              <p className="text-gray-600">{user?.phone_number}</p>
              {user?.email && <p className="text-gray-600">{user.email}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/rides')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
            >
              <span className="font-medium">My Rides</span>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => navigate('/wallet')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
            >
              <span className="font-medium">Wallet</span>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
            >
              <span className="font-medium">Settings</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
