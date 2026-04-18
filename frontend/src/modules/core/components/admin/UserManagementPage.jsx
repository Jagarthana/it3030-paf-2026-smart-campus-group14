import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, UserCog } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data || []);
    } catch (e) {
      const msg = e.response?.data;
      setError(typeof msg === 'string' ? msg : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (id, role) => {
    setUpdatingId(id);
    try {
      const res = await axios.put(`/api/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    } catch (e) {
      const msg = e.response?.data;
      alert(typeof msg === 'string' ? msg : 'Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-sliit-orange" size={26} />
        <h1 className="text-3xl font-black text-slate-900">User Management</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 font-bold text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500">
          <div className="col-span-4">Name</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Current Role</div>
          <div className="col-span-2 text-right">Update Role</div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 font-bold">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-bold">No users found.</div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-slate-100 items-center text-sm"
            >
              <div className="col-span-4 font-bold text-slate-800 flex items-center gap-2">
                <UserCog size={16} className="text-slate-400" />
                {user.name}
              </div>
              <div className="col-span-4 text-slate-600">{user.email}</div>
              <div className="col-span-2">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase">
                  {user.role}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <select
                  className="border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-xs"
                  value={user.role}
                  disabled={updatingId === user.id}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                >
                  <option value="USER">USER</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
