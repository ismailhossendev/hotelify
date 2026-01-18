"use client";

import { useEffect, useState } from "react";
import {
    Users,
    DoorOpen,
    Clock,
    CreditCard
} from "lucide-react";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(userData => {
                if (userData.success && !userData.user.hotelId && userData.user.role !== 'super_admin') {
                    // Redirect to onboarding if no hotel assigned
                    window.location.href = '/onboarding';
                    return;
                }

                // If user has hotel, fetch stats
                fetch('/api/reports/dashboard')
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setStats(data.data);
                        }
                        setLoading(false);
                    })
                    .catch(err => setLoading(false));
            });
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-2">Welcome back to your hotel command center.</p>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Bookings"
                        value={stats?.totalBookings || 0}
                        icon={CreditCard}
                        trend="+12% from last month"
                    />
                    <StatCard
                        title="Today's Check-ins"
                        value={stats?.todayCheckIns || 0}
                        icon={Users}
                        trend="4 arriving today"
                    />
                    <StatCard
                        title="Pending Requests"
                        value={stats?.pendingRequests || 0}
                        icon={Clock}
                        critical={stats?.pendingRequests > 0}
                        trend="Requires attention"
                    />
                    <StatCard
                        title="Rooms Clean"
                        value={stats?.roomStatus?.find((s: any) => s._id === 'clean')?.count || 0}
                        icon={DoorOpen}
                        trend="Ready for guests"
                    />
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-white p-6 rounded-xl border shadow-sm h-[400px]">
                    <h3 className="font-semibold mb-4">Revenue Overview</h3>
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Chart Component Placeholder
                    </div>
                </div>
                <div className="col-span-3 bg-white p-6 rounded-xl border shadow-sm h-[400px]">
                    <h3 className="font-semibold mb-4">Recent Bookings</h3>
                    <div className="space-y-4">
                        <div className="text-sm text-gray-500 text-center py-10">No recent activity</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, trend, critical }: any) {
    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-gray-500">{title}</h3>
                <Icon className={`h-4 w-4 ${critical ? 'text-red-500' : 'text-gray-500'}`} />
            </div>
            <div className="flex flex-col gap-1">
                <div className={`text-2xl font-bold ${critical ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
                <p className="text-xs text-gray-500">{trend}</p>
            </div>
        </div>
    );
}
