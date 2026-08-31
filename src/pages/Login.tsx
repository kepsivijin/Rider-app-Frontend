import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { normalizePhone } from '../utils/phone';
import { homeForRole } from '../components/RoleRoute';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

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
      setAuth(response.data.user, response.data.access_token);
      toast.success('Login successful!');
      navigate(homeForRole(response.data.user.role));
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Kanyakumari RideShare
        </h1>
        <p className="text-center text-gray-600 mb-2">One app — Customer · Driver · Admin</p>
        <p className="text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-2 px-3 mb-4">
          Demo mode: OTP is always <strong>123456</strong> (shown after Send OTP)
        </p>

        {step === 'phone' && (
          <form onSubmit={handleSendOTP}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9876543210"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            {devOtp && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-sm text-green-700">Dev OTP (auto-filled)</p>
                <p className="text-2xl font-bold text-green-800 tracking-widest">{devOtp}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full mt-2 text-gray-600 py-2 hover:text-gray-800"
            >
              Change Number
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
