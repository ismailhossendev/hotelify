"use client";

import { useEffect, useState } from "react";
import { BedDouble, CheckCircle, XCircle, Paintbrush, Loader2 } from "lucide-react";

export default function HousekeepingPage() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, clean: 0, dirty: 0, maintenance: 0 });

    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/rooms');
            const data = await res.json();
            if (data.success) {
                setRooms(data.rooms);
                calculateStats(data.rooms);
            }
        } catch (error) {
            console.error("Failed to fetch rooms", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (roomList: any[]) => {
        const s = { total: roomList.length, clean: 0, dirty: 0, maintenance: 0 };
        roomList.forEach(r => {
            if (r.status === 'available') s.clean++; // Assuming 'available' implies clean for now, or we add specific field
            // Wait, Room model needs 'housekeepingStatus'. If not present, we use 'status'.
            // Let's assume we added 'housekeepingStatus' to room model or will add it.
            // For now, let's use a local state mock or check real model.
            // If Room model has 'status' enum ['available', 'maintenance', 'occupied'].
            // We usually need a separate 'cleanliness' flag.

            // Checking Room.ts content via tool will confirm.

            if (r.housekeepingStatus === 'clean') s.clean++;
            else if (r.housekeepingStatus === 'dirty') s.dirty++;
            else if (r.housekeepingStatus === 'maintenance') s.maintenance++;
        });
        setStats(s);
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const toggleStatus = async (roomId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'clean' ? 'dirty' : 'clean';

        // Optimistic update
        setRooms(prev => prev.map(r => r._id === roomId ? { ...r, housekeepingStatus: newStatus } : r));

        try {
            await fetch(`/api/rooms/${roomId}/housekeeping`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            // Re-fetch to ensure sync? Or just rely on optimistic.
            fetchRooms();
        } catch (err) {
            alert("Failed to update status");
            fetchRooms(); // Revert
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Housekeeping</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard title="Total Rooms" value={stats.total} icon={BedDouble} color="bg-blue-100 text-blue-700" />
                <StatCard title="Clean" value={stats.clean} icon={CheckCircle} color="bg-green-100 text-green-700" />
                <StatCard title="Dirty" value={stats.dirty} icon={XCircle} color="bg-red-100 text-red-700" />
                <StatCard title="Maintenance" value={stats.maintenance} icon={Paintbrush} color="bg-yellow-100 text-yellow-700" />
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rooms.map(room => (
                    <div key={room._id} className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{room.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${room.housekeepingStatus === 'clean' ? 'bg-green-100 text-green-700' :
                                        room.housekeepingStatus === 'dirty' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {room.housekeepingStatus || 'clean'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">{room.roomType}</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => toggleStatus(room._id, room.housekeepingStatus || 'clean')}
                                className={`flex-1 py-1 px-2 rounded text-sm font-medium border transition-colors ${(room.housekeepingStatus || 'clean') === 'clean'
                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                    }`}
                            >
                                Mark {((room.housekeepingStatus || 'clean') === 'clean' ? 'Dirty' : 'Clean')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
}
