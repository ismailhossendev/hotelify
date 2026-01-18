"use client";

import { useEffect, useState } from "react";
import { Building, Users, CreditCard, TrendingUp, Loader2, DollarSign, MessageSquare, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch admin stats
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                if (data.success) setStats(data.stats);
            });

        // Fetch activity feed
        fetch('/api/admin/activity')
            .then(res => res.json())
            .then(data => {
                if (data.success) setActivities(data.logs);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400 mt-1">Platform overview and management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Hotels" value={stats?.totalHotels || 0} icon={Building} color="bg-blue-600" />
                <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="bg-green-600" />
                <StatCard title="Total Revenue" value={`BDT ${stats?.totalRevenue?.toLocaleString() || 0}`} icon={TrendingUp} color="bg-purple-600" />
                <StatCard
                    title="Pending Withdrawals"
                    value={stats?.pendingWithdrawals || 0}
                    icon={DollarSign}
                    color="bg-orange-600"
                    alert={stats?.pendingWithdrawals > 0}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Graph - Takes 2 cols */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Graph */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-6">Revenue Overview (Last 30 Days)</h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats?.revenueGraph || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9CA3AF"
                                        tickFormatter={(str) => {
                                            const d = new Date(str);
                                            return `${d.getDate()}/${d.getMonth() + 1}`;
                                        }}
                                    />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                        labelStyle={{ color: '#9CA3AF' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#8B5CF6"
                                        strokeWidth={2}
                                        dot={{ fill: '#8B5CF6' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                        {activities.length === 0 ? (
                            <p className="text-gray-400">No recent activity.</p>
                        ) : (
                            <div className="space-y-4">
                                {activities.slice(0, 5).map((log) => (
                                    <div key={log._id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-750 border border-transparent hover:border-gray-700 transition-colors">
                                        <div className="mt-1">
                                            {log.action === 'login' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                            {log.action === 'failed_login' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                                            {log.action === 'settings_change' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                                            {!['login', 'failed_login', 'settings_change'].includes(log.action) && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-300">
                                                <span className="font-semibold text-white">
                                                    {log.userId?.profile?.name || log.userId?.email || 'Unknown User'}
                                                </span>
                                                {' '}{log.description || log.action}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                                {log.hotelId && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                                                        {log.hotelId.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Quick Actions & SMS Stats */}
                <div className="space-y-6">
                    {/* SMS Monitor */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">SMS Monitor</h2>
                            <MessageSquare className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-750 rounded-lg">
                                <span className="text-gray-400">Sent Today</span>
                                <span className="font-mono font-bold text-xl">{stats?.sms?.count || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-750 rounded-lg">
                                <span className="text-gray-400">Est. Cost</span>
                                <span className="font-mono font-bold text-xl text-orange-400">৳{stats?.sms?.cost || 0}</span>
                            </div>
                            <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
                                View Logs
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <QuickAction label="View Hotels" href="/admin/hotels" />
                            <QuickAction label="Manage Users" href="/admin/users" />
                            <QuickAction label="View Transactions" href="/admin/transactions" />
                            <QuickAction label="View Withdrawals" href="/admin/withdrawals" />
                            <QuickAction label="System Settings" href="/admin/settings" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, alert }: any) {
    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative overflow-hidden">
            {alert && (
                <div className="absolute top-0 right-0 p-2">
                    <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full block"></span>
                </div>
            )}
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </div>
        </div>
    );
}

function QuickAction({ label, href }: { label: string; href: string }) {
    return (
        <a
            href={href}
            className="block w-full bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-center font-medium transition-colors border border-gray-600 hover:border-gray-500 text-sm"
        >
            {label}
        </a>
    );
}
