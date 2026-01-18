"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Phone, Shield, Building, Loader2, Search, Plus, X } from "lucide-react";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        fetch('/api/admin/users')
            .then(res => res.json())
            .then(data => {
                if (data.success) setUsers(data.users);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
        setUpdating(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
            } else {
                alert("Failed: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error updating user status");
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.profile?.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.role?.toLowerCase().includes(search.toLowerCase());

        const matchesRole = filterRole === 'all' || u.role === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' ? u.isActive : !u.isActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'super_admin': return 'bg-purple-900 text-purple-300';
            case 'vendor_admin': return 'bg-blue-900 text-blue-300';
            case 'vendor_staff': return 'bg-cyan-900 text-cyan-300';
            case 'support_staff': return 'bg-orange-900 text-orange-300';
            case 'ticket_manager': return 'bg-yellow-900 text-yellow-300';
            case 'guest': return 'bg-gray-700 text-gray-300';
            default: return 'bg-gray-700 text-gray-300';
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Users Management</h1>
                    <p className="text-gray-400">Manage all platform users</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            className="bg-transparent border-none outline-none text-white placeholder-gray-500 w-48"
                            placeholder="Search users..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="bg-gray-800 text-sm text-white border border-gray-700 rounded-lg px-3 py-2 outline-none"
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="vendor_admin">Vendor Admin</option>
                        <option value="vendor_staff">Vendor Staff</option>
                        <option value="support_staff">Support Staff</option>
                        <option value="guest">Guest</option>
                    </select>

                    <select
                        className="bg-gray-800 text-sm text-white border border-gray-700 rounded-lg px-3 py-2 outline-none"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Staff
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Contact</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Hotel</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredUsers.map(user => (
                            <tr key={user._id} className="hover:bg-gray-750">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                                            {user.profile?.name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{user.profile?.name || 'Unnamed'}</div>
                                            <div className="text-sm text-gray-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {user.phone || 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                        {user.role?.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {user.hotelId ? (
                                        <div className="flex items-center gap-1">
                                            <Building className="h-3 w-3" />
                                            <span className="text-sm">{user.hotelId.name || 'Assigned'}</span>
                                        </div>
                                    ) : 'None'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                                        disabled={updating === user._id}
                                        className={`text-xs px-3 py-1.5 rounded border transition-colors ${user.isActive
                                                ? 'border-red-500 text-red-400 hover:bg-red-500/10'
                                                : 'border-green-500 text-green-400 hover:bg-green-500/10'
                                            }`}
                                    >
                                        {updating === user._id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            user.isActive ? 'Deactivate' : 'Activate'
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No users found
                    </div>
                )}
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <AddStaffModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
}

function AddStaffModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'support_staff'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert('Failed to create staff');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating staff');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Add New Staff</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                        <select
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="support_staff">Support Staff</option>
                            <option value="ticket_manager">Ticket Manager</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Creating...' : 'Create Staff User'}
                    </button>
                </form>
            </div>
        </div>
    );
}
