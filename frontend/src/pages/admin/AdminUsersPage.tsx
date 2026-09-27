import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  X,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Award,
  BookOpen,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminUser } from '../../mock/mockAdminData';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(adminService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeUserModal, setActiveUserModal] = useState<AdminUser | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'All' || u.role === selectedRole;
      const matchesStatus = selectedStatus === 'All' || u.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const handleToggleStatus = (id: string) => {
    const updated = adminService.toggleUserStatus(id);
    setUsers([...updated]);
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
            Manage tourists, tour operators, and system administrator accounts.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or email address..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0B3A53] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#16A6A1]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] px-3 py-2 rounded-xl focus:outline-none focus:border-[#16A6A1] cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Tourist">Tourist</option>
              <option value="Tour Operator">Tour Operator</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B3A53] px-3 py-2 rounded-xl focus:outline-none focus:border-[#16A6A1] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">User Profile</th>
                <th className="py-4 px-5">Email Address</th>
                <th className="py-4 px-5">Role</th>
                <th className="py-4 px-5">Registered Date</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-extrabold text-[#0B3A53]">{user.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-semibold">{user.email}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          user.role === 'Administrator'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'Tour Operator'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-teal-100 text-[#146C86]'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-500">{user.registeredAt}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          user.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : user.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveUserModal(user)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B3A53] font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer ${
                            user.status === 'Active'
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    No users matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Drawer Modal */}
      {activeUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-[#0B3A53] font-heading">User Account Profile</h3>
                <button
                  onClick={() => setActiveUserModal(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card Summary */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 text-center space-y-3">
                <img
                  src={activeUserModal.avatar}
                  alt={activeUserModal.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-[#16A6A1] shadow-md"
                />
                <div>
                  <h4 className="text-lg font-black text-[#0B3A53]">{activeUserModal.name}</h4>
                  <p className="text-xs font-semibold text-slate-500">{activeUserModal.email}</p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#16A6A1]/10 text-[#146C86]">
                    {activeUserModal.role}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      activeUserModal.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {activeUserModal.status}
                  </span>
                </div>
              </div>

              {/* User Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-0.5">
                  <div className="font-extrabold text-slate-400">Total Bookings</div>
                  <div className="text-lg font-black text-[#0B3A53]">{activeUserModal.totalBookings}</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-0.5">
                  <div className="font-extrabold text-slate-400">Completed Trips</div>
                  <div className="text-lg font-black text-[#0B3A53]">{activeUserModal.completedTrips}</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-0.5">
                  <div className="font-extrabold text-slate-400">Reviews</div>
                  <div className="text-lg font-black text-[#0B3A53]">{activeUserModal.reviewsCount}</div>
                </div>
              </div>

              {/* Account Metadata Details */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">Phone Number</span>
                  <span className="font-extrabold text-[#0B3A53]">{activeUserModal.phone}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-500">Registered Date</span>
                  <span className="font-extrabold text-[#0B3A53]">{activeUserModal.registeredAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">User Account ID</span>
                  <span className="font-mono font-extrabold text-[#146C86]">{activeUserModal.id}</span>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setActiveUserModal(null)}
                className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
              >
                Close Profile
              </button>
              <button
                onClick={() => {
                  handleToggleStatus(activeUserModal.id);
                  setActiveUserModal(null);
                }}
                className={`px-6 py-3 rounded-full font-extrabold text-xs uppercase tracking-wider text-white shadow-md transition-colors cursor-pointer ${
                  activeUserModal.status === 'Active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {activeUserModal.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
