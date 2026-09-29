import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  ShieldCheck,
  Power,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminUserItem } from '../../types/adminTypes';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [activeUserModal, setActiveUserModal] = useState<AdminUserItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchUsers(searchQuery, selectedRole);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedRole]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user: AdminUserItem) => {
    const newStatus = user.status !== 'Active';
    setUpdatingId(user.id);
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: newStatus ? 'Active' : 'Inactive' } : u
        )
      );
      if (activeUserModal && activeUserModal.id === user.id) {
        setActiveUserModal({
          ...activeUserModal,
          status: newStatus ? 'Active' : 'Inactive',
        });
      }
    } catch (err) {
      console.error('Failed to update user status', err);
      alert('Could not update user status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3A53] font-heading tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Inspect, manage, and toggle account activation status for registered users and administrators.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#16A6A1]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Admin', 'User'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRole === role
                  ? 'bg-[#0B3A53] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">User</th>
                <th className="py-4 px-5">Role</th>
                <th className="py-4 px-5">Trips Formulated</th>
                <th className="py-4 px-5">Tours Booked</th>
                <th className="py-4 px-5">Registered</th>
                <th className="py-4 px-5">Account Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading users from database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-slate-800">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          u.role === 'Admin'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role === 'Admin' && <ShieldCheck className="w-3 h-3" />}
                        <span>{u.role === 'Admin' ? 'ADMIN' : 'USER'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-[#0B3A53]">{u.tripsCount}</td>
                    <td className="py-4 px-5 font-bold text-slate-700">{u.bookingsCount}</td>
                    <td className="py-4 px-5 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={updatingId === u.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer transition-all ${
                          u.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        } ${updatingId === u.id ? 'opacity-50' : ''}`}
                        title="Click to toggle status in database"
                      >
                        <Power className="w-3 h-3" />
                        <span>{updatingId === u.id ? 'Updating...' : u.status}</span>
                      </button>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setActiveUserModal(u)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Inspect user details"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="font-bold text-[11px]">Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAIL MODAL */}
      {activeUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-[#0B3A53]">User Account Profile</h3>
              <button
                onClick={() => setActiveUserModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#16A6A1] to-[#0B3A53] text-white flex items-center justify-center font-black text-base shadow-xs">
                  {activeUserModal.name.charAt(0)}
                </div>
                <div>
                  <div className="font-black text-sm text-slate-800">{activeUserModal.name}</div>
                  <div className="text-slate-400 text-xs">{activeUserModal.email}</div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase mt-1 ${
                      activeUserModal.role === 'Admin'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {activeUserModal.role === 'Admin' && <ShieldCheck className="w-3 h-3" />}
                    <span>{activeUserModal.role === 'Admin' ? 'ADMIN' : 'USER'}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                <div>
                  <div className="font-black text-sm text-[#0B3A53]">{activeUserModal.tripsCount}</div>
                  <div className="text-[10px] text-slate-500 font-bold">Trips</div>
                </div>
                <div>
                  <div className="font-black text-sm text-[#0B3A53]">{activeUserModal.bookingsCount}</div>
                  <div className="text-[10px] text-slate-500 font-bold">Bookings</div>
                </div>
              </div>

              <div className="space-y-2 text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div><strong>Account ID:</strong> <span className="font-mono text-[11px]">{activeUserModal.id}</span></div>
                <div><strong>Registered:</strong> {new Date(activeUserModal.createdAt).toLocaleString()}</div>
                <div className="flex items-center justify-between">
                  <span><strong>Account Status:</strong></span>
                  <button
                    onClick={() => handleToggleStatus(activeUserModal)}
                    disabled={updatingId === activeUserModal.id}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer ${
                      activeUserModal.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeUserModal.status} (Toggle)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveUserModal(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
