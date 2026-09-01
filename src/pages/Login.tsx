import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { normalizePhone } from '../utils/phone';
import { homeForRole } from '../components/RoleRoute';
import toast from 'react-hot-toast';

type LoginRole = 'customer' | 'driver' | 'admin';

const DEMO_ACCOUNTS: Record<LoginRole, { phone: string; label: string; icon: string; hint: string }> = {
  customer: {
    phone: '9876543210',
    label: 'Customer',
    icon: '🧑',
    hint: 'Book rides & track driver',
  },
  driver: {
    phone: '9876543212',
    label: 'Driver',
    icon: '🛺',
    hint: 'Accept rides & earn cash',
  },
  admin: {
    phone: '9876543213',
    label: 'Admin',
    icon: '⚙️',
    hint: 'Manage drivers & rides',
  },
};

const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<LoginRole>('customer');
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(DEMO_ACCOUNTS.customer.phone);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const selectRole = (role: LoginRole) => {
    setSelectedRole(role);
    setPhoneNumber(DEMO_ACCOUNTS[role].phone);
    setStep('phone');
    setOtp('');
    setDevOtp('');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const phone = normalizePhone(phoneNumber);
      const response = await authAPI.sendOTP(phone);
      setDevOtp(response.data.otp || '123456');
      setOtp(response.data.otp || '123456');
      toast.success(`OTP sent! Use: ${response.data.otp || '123456'}`);
      setStep('otp');
    } catch (error: any) {
      if (error.response?.status === 404) {
        setStep('register');
        toast.error('Please register first');
      } else {
        toast.error('Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const phone = normalizePhone(phoneNumber);
      const response = await authAPI.verifyOTP(phone, otp.trim());
      const user = response.data.user;
      setAuth(user, response.data.access_token);

      if (user.role !== selectedRole) {
        toast.error(`This phone is registered as ${user.role}. Switching to ${user.role} view.`);
        navigate(homeForRole(user.role));
      } else {
        toast.success(`Welcome, ${DEMO_ACCOUNTS[selectedRole].label}!`);
        navigate(homeForRole(user.role));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const phone = normalizePhone(phoneNumber);
      await authAPI.register({ phone_number: phone, full_name: fullName, email });
      toast.success('Registration successful! Sending OTP...');
      const response = await authAPI.sendOTP(phone);
      setDevOtp(response.data.otp || '123456');
      setOtp(response.data.otp || '123456');
      setStep('otp');
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const demo = DEMO_ACCOUNTS[selectedRole];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center mb-1">Kanyakumari RideShare</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Sign in to continue</p>

        {/* Role selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {(Object.keys(DEMO_ACCOUNTS) as LoginRole[]).map((role) => {
            const acc = DEMO_ACCOUNTS[role];
            const active = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => selectRole(role)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition ${
                  active
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400'
                }`}
              >
                <span className="text-2xl mb-1">{acc.icon}</span>
                <span className="text-xs font-bold">{acc.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
          <p className="text-sm font-medium text-gray-800">{demo.icon} Login as {demo.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{demo.hint}</p>
          <p className="text-xs text-gray-400 mt-1">Demo phone: {demo.phone}</p>
        </div>

        <p className="text-center text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg py-2 px-3 mb-4">
          Demo OTP: <strong>123456</strong> (shown after Send OTP)
        </p>

        {step === 'phone' && (
          <form onSubmit={handleSendOTP}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={demo.phone}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition disabled:opacity-50"
            >
              {loading ? 'Sending…' : `Send OTP as ${demo.label}`}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            {devOtp && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                <p className="text-sm text-green-700">Your OTP</p>
                <p className="text-2xl font-bold text-green-800 tracking-widest">{devOtp}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black text-center text-2xl tracking-widest"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition disabled:opacity-50"
            >
              {loading ? 'Verifying…' : `Login as ${demo.label}`}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full mt-2 text-gray-600 py-2 hover:text-black text-sm"
            >
              ← Change number
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={phoneNumber}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
