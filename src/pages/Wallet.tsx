import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../services/api';
import toast from 'react-hot-toast';

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const response = await walletAPI.getWallet();
      setWallet(response.data);
    } catch {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/profile')} className="text-gray-600 mr-4">← Back</button>
        <h1 className="text-xl font-bold text-primary">Wallet</h1>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500 mb-2">Available Balance</p>
            <p className="text-5xl font-bold text-primary">₹{wallet?.balance?.toFixed(0) ?? 0}</p>
            <p className="text-sm text-gray-400 mt-4">Use wallet balance for online payments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
