import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const roleColor = (role: string) => {
    const colors: Record<string, string> = {
      customer: 'bg-blue-100 text-blue-800',
      driver: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center">
        <button onClick={() => navigate('/admin')} className="text-gray-600 mr-4">← Back</button>
        <h1 className="text-xl font-bold text-primary">All Users</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  {user.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{user.full_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${roleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{user.phone_number}</p>
                  {user.email && <p className="text-sm text-gray-400 truncate">{user.email}</p>}
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>{formatDateTime(user.created_at)}</p>
                  <p className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
