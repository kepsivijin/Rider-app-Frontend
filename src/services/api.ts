import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  sendOTP: (phone_number: string) =>
    api.post('/auth/send-otp', { phone_number }),
  
  verifyOTP: (phone_number: string, otp: string) =>
    api.post('/auth/verify-otp', { phone_number, otp }),
  
  register: (data: { phone_number: string; full_name: string; email?: string }) =>
    api.post('/auth/register', data),
};

export const rideAPI = {
  requestRide: (data: any) => api.post('/rides/request', data),
  getNearbyDrivers: (latitude: number, longitude: number) =>
    api.get('/rides/nearby-drivers', { params: { latitude, longitude } }),
  getRide: (rideId: string) => api.get(`/rides/${rideId}`),
  getMyRides: () => api.get('/rides/my-rides'),
  cancelRide: (rideId: string) => api.post(`/rides/${rideId}/cancel`),
  verifyPickupOtp: (rideId: string, pickup_otp: string) =>
    api.post(`/rides/${rideId}/verify-pickup`, { pickup_otp }),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.patch('/users/me', data),
};

export const ratingAPI = {
  createRating: (data: { ride_id: string; to_user_id: string; rating: number; comment?: string }) =>
    api.post('/ratings', data),
  getRideRatings: (rideId: string) => api.get(`/ratings/ride/${rideId}`),
};

export const walletAPI = {
  getWallet: () => api.get('/payments/wallet'),
  addMoney: (data: { amount: number; payment_transaction_id: string }) =>
    api.post('/payments/wallet/add-money', data),
  createOrder: (amount: number, ride_id?: string) =>
    api.post('/payments/create-order', { amount, ride_id }),
};
