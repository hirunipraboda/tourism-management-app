import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  X,
  Loader2,
  Trash2,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { userService } from '../../services/userService';
import { AdminUser } from '../../mock/mockAdminData';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Modals state
  const [activeUserModal, setActiveUserModal] = useState<AdminUser | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Form states for Create & Edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('Tourist');
  const [formStatus, setFormStatus] = useState('Active');
  const [formPhone, setFormPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users from database on load
  const loadUsers = async () => {
    setIsLoading(true);
    const data = await userService.getUsers();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

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

  // Handle Toggle Status in DB
  const handleToggleStatus = async (id: string) => {
    const updated = await userService.toggleUserStatus(id);
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      if (activeUserModal && activeUserModal.id === id) {
        setActiveUserModal(updated);
      }
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('Tourist');
    setFormStatus('Active');
    setFormPhone('');
    setFormError(null);
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPhone(user.phone || '');
    setFormError(null);
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword) {
      setFormError('Name, email, and password are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const newUser = await userService.createUser({
      fullName: formName,
      email: formEmail,
      password: formPassword,
      role: formRole,
      phone: formPhone,
    });

    setIsSubmitting(false);

    if (newUser) {
      setUsers([newUser, ...users]);
      setShowCreateModal(false);
    } else {
      setFormError('Failed to create user. Email may already exist.');
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Name and email are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const updatedUser = await userService.updateUser(editingUser.id, {
      fullName: formName,
      email: formEmail,
      role: formRole,
      status: formStatus,
      phone: formPhone,
    });

    setIsSubmitting(false);

    if (updatedUser) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updatedUser : u)));
      setEditingUser(null);
      if (activeUserModal && activeUserModal.id === editingUser.id) {
        setActiveUserModal(updatedUser);
      }
    } else {
      setFormError('Failed to update user details.');
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async (id: string) => {
    setIsSubmitting(true);
    const success = await userService.deleteUser(id);
    setIsSubmitting(false);

    if (success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeletingUserId(null);
      if (activeUserModal && activeUserModal.id === id) {
        setActiveUserModal(null);
      }
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
            Manage live system users, roles, and status directly connected to PostgreSQL database.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="h-11 px-5 rounded-2xl bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#16A6A1]" />
          <span>Add New User</span>
        </button>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#16A6A1] mb-2" />
                    Loading database users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
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
                          View
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer ${
                            user.status === 'Active'
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          onClick={() => setDeletingUserId(user.id)}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-[#0B3A53] font-heading flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#16A6A1]" />
                Create New User
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase">Full Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-medium text-xs text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase">Email Address *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-medium text-xs text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase">Password *</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-medium text-xs text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  >
                    <option value="Tourist">Tourist</option>
                    <option value="Tour Operator">Tour Operator</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-xs text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#0B3A53] hover:bg-[#072537] text-white font-extrabold uppercase shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[#16A6A1]" /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-[#0B3A53] font-heading flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Edit User Account
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-medium text-xs text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 uppercase">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 font-medium text-xs text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full h-11 px-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  >
                    <option value="Tourist">Tourist</option>
                    <option value="Tour Operator">Tour Operator</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full h-11 px-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full h-11 px-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-xs text-[#0B3A53] focus:outline-none focus:border-[#16A6A1]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold uppercase shadow-md flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0B3A53]">Delete Account?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                This will permanently delete the user account from the database. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingUserId(null)}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingUserId)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase shadow-md flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <span className="font-bold text-slate-500">Database User ID</span>
                  <span className="font-mono font-extrabold text-[#146C86]">{activeUserModal.id}</span>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleOpenEditModal(activeUserModal)}
                className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase"
              >
                Edit Account
              </button>

              <button
                onClick={() => handleToggleStatus(activeUserModal.id)}
                className={`px-5 py-2.5 rounded-full font-extrabold text-xs uppercase tracking-wider text-white shadow-md transition-colors cursor-pointer ${
                  activeUserModal.status === 'Active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {activeUserModal.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
