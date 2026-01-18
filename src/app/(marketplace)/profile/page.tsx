"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch User Config
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(userData => {
                if (userData.success) {
                    setUser(userData.user);

                    // 2. Fetch User Bookings (Guest View)
                    // We can reuse GET /api/bookings which filters by current user automatically
                    fetch('/api/bookings')
                        .then(res => res.json())
                        .then(bookingData => {
                            if (bookingData.success) {
                                setBookings(bookingData.bookings);
                            }
                            setLoading(false);
                        });
                } else {
                    // Not logged in
                    window.location.href = '/login';
                }
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div className="p-20 text-center">Loading profile...</div>;
    if (!user) return null; // Redirects handled in useEffect

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                <User className="h-10 w-10" />
                            </div>
                            <h2 className="text-xl font-bold">{user.profile?.name || 'Guest User'}</h2>
                            <p className="text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail className="h-5 w-5" />
                                <span>{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="h-5 w-5" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t">
                            <button className="w-full border border-gray-300 rounded-lg py-2 font-medium hover:bg-gray-50 text-gray-700">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Booking History */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                        Booking History
                    </h2>

                    <div className="space-y-4">
                        {bookings.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 text-center border shadow-sm">
                                <div className="text-gray-400 mb-2">No bookings found</div>
                                <p className="text-sm text-gray-500">You haven&apos;t made any reservations yet.</p>
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <div key={booking._id} className="bg-white rounded-xl p-6 shadow-sm border flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-lg">{booking.roomId?.name || 'Hotel Room'}</h3>
                                            <StatusBadge status={booking.status} />
                                        </div>
                                        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {booking.hotelId?.name || 'Hotelify Property'}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                                            <div>
                                                <span className="text-gray-500 block text-xs uppercase font-bold">Check-in</span>
                                                <span>{format(new Date(booking.checkIn), 'MMM d, yyyy')}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs uppercase font-bold">Check-out</span>
                                                <span>{format(new Date(booking.checkOut), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-100 min-w-[150px]">
                                        <div>
                                            <span className="text-xs text-gray-400 block text-right">Total Paid</span>
                                            <div className="text-xl font-bold text-blue-600 text-right">BDT {booking.pricing.totalAmount}</div>
                                        </div>
                                        <button className="text-sm text-blue-600 hover:underline mt-4">
                                            Download Receipt
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        confirmed: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        cancelled: 'bg-red-100 text-red-700',
        checked_in: 'bg-blue-100 text-blue-700',
        checked_out: 'bg-gray-100 text-gray-700'
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${styles[status] || 'bg-gray-100'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
