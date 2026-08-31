import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/admin')} className="text-gray-600 mr-4">← Back</button>
        <h1 className="text-xl font-bold text-primary">Admin Settings</h1>
      </div>
      <div className="p-6 space-y-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold mb-4">Pricing</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500">Base Fare</p><p className="font-bold text-lg">₹20</p></div>
            <div><p className="text-gray-500">Per KM</p><p className="font-bold text-lg">₹8</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold mb-2">Service Area</h2>
          <p className="text-sm text-gray-600 mb-2">Marthandam Region (Kanyakumari district)</p>
          <p className="text-xs text-gray-400">Bounds: Lat 8.255–8.325, Lng 77.085–77.245</p>
          <p className="text-sm text-gray-600 mt-2">Villages: Eramanthurai, Poothurai, Thoothoor, Vallavilai, Nithiravilai, Marthandam, Kollancode</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold mb-2">Driver Approval</h2>
          <p className="text-sm text-gray-600">New drivers register via the Driver app and appear in Manage Drivers for approval.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
