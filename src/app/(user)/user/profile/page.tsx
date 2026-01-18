"use client";

import { useEffect, useState } from "react";
import { User, Shield, MapPin, Save, Loader2, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'address'>('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // User Data State
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        avatar: "",
        role: ""
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Fetch User Data on Mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setUserData({
                        name: data.user.profile?.name || data.user.name || "",
                        email: data.user.email || "",
                        phone: data.user.phone || "",
                        address: data.user.profile?.address || "",
                        avatar: data.user.profile?.avatar || "",
                        role: data.user.role || "User"
                    });
                } else {
                    // Redirect if unauthorized
                    router.push('/login');
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email, // potentially read-only? let's allow Update for now
                    phone: userData.phone,
                    address: userData.address
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Profile updated successfully");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success("Password updated successfully");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        setLoading(true); // Or separate uploading state

        try {
            // 1. Upload File
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

            // 2. Update Profile with new Avatar URL
            const updateRes = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: uploadData.url }),
            });

            if (!updateRes.ok) throw new Error("Failed to update profile image");

            setUserData(prev => ({ ...prev, avatar: uploadData.url }));
            toast.success("Profile photo updated");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm("Are you sure you want to remove your profile photo?")) return;
        setLoading(true);
        try {
            // Update Profile to remove avatar
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatar: "" }), // Send empty string to clear
            });

            if (!res.ok) throw new Error("Failed to remove profile photo");

            setUserData(prev => ({ ...prev, avatar: "" }));
            toast.success("Profile photo removed");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-12 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Sidebar - Profile Summary & Nav */}
                    <div className="w-full md:w-80 flex-shrink-0 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                            <div className="relative group mb-4">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl overflow-hidden border-4 border-white shadow-md">
                                    {userData.avatar ? (
                                        <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        userData.name?.[0]?.toUpperCase()
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
                                    <Camera className="h-4 w-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
                            <p className="text-sm text-gray-500 mb-4">{userData.email}</p>
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100">
                                {userData.role.replace('_', ' ')}
                            </span>

                            {userData.avatar && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    className="mt-4 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Remove Photo
                                </button>
                            )}
                        </div>

                        {/* Navigation */}
                        <nav className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            {[
                                { id: 'general', label: 'General Information', icon: User },
                                { id: 'address', label: 'Address Details', icon: MapPin },
                                { id: 'security', label: 'Security & Password', icon: Shield },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-4 ${activeTab === item.id
                                        ? 'bg-blue-50 text-blue-700 border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 border-transparent'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1">
                        {activeTab === 'general' && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4">
                                <div className="mb-8 pb-6 border-b border-gray-100">
                                    <h2 className="text-2xl font-bold text-gray-900">General Information</h2>
                                    <p className="text-gray-500 mt-1">Update your personal details and contact info.</p>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                value={userData.name}
                                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                value={userData.phone}
                                                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-gray-700">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                value={userData.email}
                                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                        >
                                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4">
                                <div className="mb-8 pb-6 border-b border-gray-100">
                                    <h2 className="text-2xl font-bold text-gray-900">Address Details</h2>
                                    <p className="text-gray-500 mt-1">Manage your shipping and billing locations.</p>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Full Address</label>
                                        <textarea
                                            rows={4}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all resize-none"
                                            placeholder="Enter your full address (Street, City, Zip, Country)"
                                            value={userData.address}
                                            onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20"
                                        >
                                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                            <Save className="h-4 w-4" />
                                            Update Address
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4">
                                <div className="mb-8 pb-6 border-b border-gray-100">
                                    <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                                    <p className="text-gray-500 mt-1">Ensure your account stays safe and secure.</p>
                                </div>
                                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Current Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                                            placeholder="Enter current password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                                                placeholder="Enter new password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Confirm Password</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                                                placeholder="Confirm new password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
                                        >
                                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                            <Shield className="h-4 w-4" />
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
