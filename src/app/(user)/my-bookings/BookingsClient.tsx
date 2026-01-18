"use client";

import { useState } from "react";
import { Calendar, MapPin, Clock, Download, XCircle, CheckCircle, AlertCircle, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function BookingsClient({ bookings }: { bookings: any[] }) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

    const upcoming = bookings.filter((b: any) => ['pending', 'confirmed'].includes(b.status));
    const completed = bookings.filter((b: any) => ['checked_out'].includes(b.status));
    const cancelled = bookings.filter((b: any) => ['cancelled', 'no_show', 'rejected'].includes(b.status));

    const getActiveList = () => {
        switch (activeTab) {
            case 'upcoming': return upcoming;
            case 'completed': return completed;
            case 'cancelled': return cancelled;
            default: return upcoming;
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'upcoming'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Upcoming ({upcoming.length})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'completed'
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Completed ({completed.length})
                </button>
                <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'cancelled'
                            ? 'border-red-600 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Cancelled ({cancelled.length})
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {getActiveList().length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No {activeTab} bookings found</h3>
                        <p className="text-gray-500 text-sm mt-1">You don't have any bookings in this category.</p>
                        {activeTab === 'upcoming' && (
                            <Link
                                href="/hotels"
                                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                            >
                                Browse Hotels
                            </Link>
                        )}
                    </div>
                ) : (
                    getActiveList().map((booking: any) => (
                        <BookingCard key={booking._id} booking={booking} type={activeTab} />
                    ))
                )}
            </div>
        </div>
    );
}

function BookingCard({ booking, type }: { booking: any, type: string }) {
    const statusColors: any = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
        checked_out: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
        no_show: 'bg-gray-100 text-gray-800 border-gray-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {/* Placeholder for hotel image if available, else icon */}
                        <div className="text-2xl font-bold text-gray-400">{booking.hotelId?.name?.[0]}</div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {booking.hotelId?.name || 'Hotel Name'}
                        </h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> {booking.hotelId?.contact?.address?.area || booking.hotelId?.address || 'Location'}
                        </p>
                        <div className="text-xs text-gray-400 font-mono mt-2">ID: {booking.bookingNumber || booking._id.toString().slice(-6).toUpperCase()}</div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColors[booking.status] || 'bg-gray-100 border-gray-200'}`}>
                        {booking.status.replace('_', ' ')}
                    </span>
                    <span className="text-xl font-bold text-blue-900">
                        ৳{booking.grandTotal?.toLocaleString() ?? 0}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100 border-dashed">
                <div>
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Check-in</div>
                    <div className="text-sm font-bold text-gray-700">{new Date(booking.checkIn).toLocaleDateString()}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Check-out</div>
                    <div className="text-sm font-bold text-gray-700">{new Date(booking.checkOut).toLocaleDateString()}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Nights</div>
                    <div className="text-sm font-bold text-gray-700">{booking.nights} Night(s)</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Payment</div>
                    <div className="text-sm font-bold text-gray-700 capitalize flex items-center gap-2">
                        {booking.paymentStatus === 'paid' ? (
                            <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Paid</span>
                        ) : (
                            <span className="text-yellow-600 flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.paymentStatus}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {type === 'upcoming' && (
                    <button className="text-red-500 hover:text-red-700 text-sm font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition-colors">
                        Cancel
                    </button>
                )}
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors">
                    View Details
                </button>
            </div>
        </div>
    );
}
