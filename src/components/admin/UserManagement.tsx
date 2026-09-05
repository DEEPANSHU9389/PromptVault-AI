import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Filter,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getAllUsersFromFirestore, updateUserRoleInFirestore } from '../../firebase';
import { useApp } from '../../context/AppContext';

export const UserManagement: React.FC = () => {
  const { addToast } = useApp();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsersFromFirestore();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      addToast('Failed to fetch user list', 'error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (targetUser: UserProfile) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmText = `Are you sure you want to change ${targetUser.displayName || targetUser.email}'s role to "${newRole.toUpperCase()}"?`;
    
    if (!window.confirm(confirmText)) return;

    setUpdatingUid(targetUser.uid);
    try {
      await updateUserRoleInFirestore(targetUser.uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, role: newRole } : u))
      );
      addToast(`Updated user role to ${newRole}`, 'success', targetUser.email);
    } catch (err: any) {
      console.error(err);
      addToast('Failed to update user role', 'error', err.message);
    } finally {
      setUpdatingUid(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    // Role filter
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = u.displayName?.toLowerCase().includes(q) || false;
    const firstNameMatch = u.firstName?.toLowerCase().includes(q) || false;
    const lastNameMatch = u.lastName?.toLowerCase().includes(q) || false;
    const emailMatch = u.email?.toLowerCase().includes(q) || false;
    const phoneMatch = u.phone?.toLowerCase().includes(q) || false;
    const bgMatch = u.background?.toLowerCase().includes(q) || false;

    return nameMatch || firstNameMatch || lastNameMatch || emailMatch || phoneMatch || bgMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Registered Users ({users.length})</h2>
            <p className="text-xs text-slate-400">View, search, and manage user accounts and security roles.</p>
          </div>
        </div>

        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, phone number, or professional background..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-purple-500 text-white text-xs rounded-xl focus:outline-none transition-colors"
          />
        </div>

        <div className="sm:col-span-4 relative">
          <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Account Roles</option>
            <option value="admin">Administrators Only</option>
            <option value="user">Standard Users Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading user records from Firestore...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-sm font-bold text-white">No matching users found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || roleFilter !== 'all'
                ? 'Try adjusting your search keywords or role filters.'
                : 'No registered user documents exist in Firestore yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Professional Background</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredUsers.map((u) => {
                  const fullName = u.firstName && u.lastName
                    ? `${u.firstName} ${u.lastName}`
                    : u.displayName || 'Anonymous User';

                  const joinedDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : 'N/A';

                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center space-x-1.5">
                              <span>{fullName}</span>
                              {u.role === 'admin' && (
                                <span title="Admin User">
                                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {u.phone ? (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">Not set</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {u.background ? (
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="truncate">{u.background}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic">Not set</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {u.role === 'admin' ? (
                          <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider inline-flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold rounded-full uppercase tracking-wider inline-flex items-center space-x-1">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            <span>User</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{joinedDate}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleRoleToggle(u)}
                          disabled={updatingUid === u.uid}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                            u.role === 'admin'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
                              : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300'
                          }`}
                        >
                          {updatingUid === u.uid ? (
                            <span>Updating...</span>
                          ) : u.role === 'admin' ? (
                            <span>Demote to User</span>
                          ) : (
                            <span>Promote to Admin</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
