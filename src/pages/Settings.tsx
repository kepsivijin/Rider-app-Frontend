import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/profile')} className="text-gray-600 mr-4">← Back</button>
        <h1 className="text-xl font-bold text-primary">Settings</h1>
      </div>
      <div className="p-6 space-y-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{user?.full_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{user?.phone_number}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium capitalize">{user?.role}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold mb-2">Service Area</h2>
          <p className="text-sm text-gray-600">Marthandam Region — Eramanthurai, Poothurai, Thoothoor, Vallavilai, Nithiravilai, Marthandam</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold mb-2">Notifications</h2>
          <p className="text-sm text-gray-600">Ride updates and OTP alerts are enabled.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
