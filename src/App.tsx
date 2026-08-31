import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute, RoleRoute } from './components/RoleRoute';

import Login from './pages/Login';
import Home from './pages/Home';
import RideTracking from './pages/RideTracking';
import RideComplete from './pages/RideComplete';
import RideHistory from './pages/RideHistory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

import DriverDashboard from './pages/driver/DriverDashboard';
import DriverRide from './pages/driver/DriverRide';
import DriverRideHistory from './pages/driver/RideHistory';

import AdminDashboard from './pages/admin/AdminDashboard';
import DriverManagement from './pages/admin/DriverManagement';
import RideManagement from './pages/admin/RideManagement';
import UserManagement from './pages/admin/UserManagement';
import CashCollection from './pages/admin/CashCollection';
import AdminSettings from './pages/admin/AdminSettings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Customer */}
          <Route path="/" element={<ProtectedRoute><RoleRoute roles={['customer']}><Home /></RoleRoute></ProtectedRoute>} />
          <Route path="/ride/:rideId" element={<ProtectedRoute><RoleRoute roles={['customer']}><RideTracking /></RoleRoute></ProtectedRoute>} />
          <Route path="/ride/:rideId/complete" element={<ProtectedRoute><RoleRoute roles={['customer']}><RideComplete /></RoleRoute></ProtectedRoute>} />
          <Route path="/rides" element={<ProtectedRoute><RoleRoute roles={['customer']}><RideHistory /></RoleRoute></ProtectedRoute>} />

          {/* Driver */}
          <Route path="/driver" element={<ProtectedRoute><RoleRoute roles={['driver']}><DriverDashboard /></RoleRoute></ProtectedRoute>} />
          <Route path="/driver/ride/:rideId" element={<ProtectedRoute><RoleRoute roles={['driver']}><DriverRide /></RoleRoute></ProtectedRoute>} />
          <Route path="/driver/rides" element={<ProtectedRoute><RoleRoute roles={['driver']}><DriverRideHistory /></RoleRoute></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/drivers" element={<ProtectedRoute><RoleRoute roles={['admin']}><DriverManagement /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/rides" element={<ProtectedRoute><RoleRoute roles={['admin']}><RideManagement /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><RoleRoute roles={['admin']}><UserManagement /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/cash" element={<ProtectedRoute><RoleRoute roles={['admin']}><CashCollection /></RoleRoute></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminSettings /></RoleRoute></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
