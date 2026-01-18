"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar, MapPin, Clock, Search, Filter, Ban, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function MyBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, upcoming, completed, cancelled

    useEffect(() => {
        // Fetch bookings
        const fetchBookings = async () => {
            try {
                // Determine user (simulated or real)
                // In production, API handles user scope via token
                const res = await fetch('/api/bookings');
                const data = await res.json();

                if (data.success) {
                    setBookings(data.bookings);
                } else {
                    // If 401, redirect to login
                    if (res.status === 401) {
                        // router.push('/login');
                        // For now, let's just handle it gracefully or assume public demo
                    }
                }
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        if (filter === "all") return true;
        if (filter === "upcoming") return booking.status === "confirmed" && new Date(booking.checkIn) > new Date();
        if (filter === "completed") return booking.status === "completed" || (booking.status === "confirmed" && new Date(booking.checkOut) < new Date());
        if (filter === "cancelled") return booking.status === "cancelled";
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-white rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-gray-500">Manage your upcoming stays and history</p>
                    </div>

                    {/* Filters */}
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        {['all', 'upcoming', 'completed', 'cancelled'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="h-10 w-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h2>
                        <p className="text-gray-500 mb-8">You haven't made any bookings in this category yet.</p>
                        <Link href="/hotels" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                            <Search className="h-5 w-5" />
                            Browse Hotels
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredBookings.map((booking) => (
                            <div key={booking._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="grid md:grid-cols-4 gap-6">
                                    {/* Image */}
                                    <div className="relative h-48 md:h-full rounded-2xl overflow-hidden md:col-span-1">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                                            style={{ backgroundImage: `url(${booking.hotelId?.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'})` }}
                                        />
                                        <div className="absolute inset-0 bg-black/20" />
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="md:col-span-3 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {booking.hotelId?.name || "Unknown Hotel"}
                                                </h3>
                                                <span className="text-lg font-bold text-blue-600">৳{booking.totalAmount?.toLocaleString()}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                                <MapPin className="h-4 w-4" />
                                                <span>{booking.hotelId?.address?.city || "Bangladesh"}</span>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase">Check-in</p>
                                                    <p className="font-semibold text-gray-900">{format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                                                    <p className="text-xs text-gray-400">2:00 PM</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase">Check-out</p>
                                                    <p className="font-semibold text-gray-900">{format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                                                    <p className="text-xs text-gray-400">11:00 AM</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase">Guests</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {typeof booking.guests === 'object'
                                                            ? (booking.guests.adults || 0) + (booking.guests.children || 0)
                                                            : booking.guests} Guests
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase">Booking ID</p>
                                                    <p className="font-mono text-sm text-gray-600">{booking._id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 justify-end border-t border-gray-100 pt-4">
                                            {booking.status === 'confirmed' && (
                                                <button className="px-5 py-2 text-gray-600 hover:text-red-600 font-medium text-sm transition-colors border border-transparent hover:border-red-100 rounded-lg">
                                                    Cancel Booking
                                                </button>
                                            )}
                                            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-200">
                                                View E-Ticket
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
