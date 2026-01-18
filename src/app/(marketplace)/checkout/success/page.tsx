"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Clock, MapPin, Calendar, Phone, Mail, Download, Printer, Home } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingId = searchParams.get('bookingId');
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bookingId) {
            router.push('/');
            return;
        }

        fetch(`/api/bookings/${bookingId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBooking(data.booking);
                } else {
                    alert('Booking not found');
                    router.push('/');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Failed to load booking');
            })
            .finally(() => setLoading(false));
    }, [bookingId, router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">লোডিং...</div>;
    }

    if (!booking) return null;

    // Determine Status Message based on Payment
    // Logic: If 'pay_at_hotel', it is Pending confirmation/payment.
    // If online (paid), it is Confirmed.
    const isPayAtHotel = booking.paymentStatus !== 'paid'; // generic check
    // Or specifically:
    // const isPayAtHotel = true; // For now forcing logic as requested 'pay at hotel' -> pending

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 text-center p-10">
                    <div className="flex justify-center mb-6">
                        {isPayAtHotel ? (
                            <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="h-10 w-10 text-yellow-600" />
                            </div>
                        ) : (
                            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isPayAtHotel ? 'আপনার বুকিংটি পেন্ডিং রয়েছে!' : 'ধন্যবাদ! আপনার বুকিং নিশ্চিত হয়েছে।'}
                    </h1>

                    <p className="text-gray-600 max-w-lg mx-auto mb-6">
                        {isPayAtHotel
                            ? 'আপনার বুকিং রিকোয়েস্টটি আমাদের কাছে পৌঁছেছে। আমাদের একজন প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করে বুকিং কনফার্ম করবেন।'
                            : 'আপনার পেমেন্ট সফল হয়েছে। আপনার বুকিং ডিটেইলস নিচে দেওয়া হলো।'}
                    </p>

                    <div className="flex justify-center gap-3">
                        <Link href="/" className="inline-flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                            <Home className="h-4 w-4" /> হোম পেজ
                        </Link>
                        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <Download className="h-4 w-4" /> ইনভয়েস ডাউনলোড
                        </button>
                    </div>
                </div>

                {/* Invoice Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-0">
                    {/* Header */}
                    <div className="bg-blue-600 px-8 py-6 flex justify-between items-center text-white print:bg-gray-100 print:text-black">
                        <div>
                            <h2 className="text-xl font-bold">INVOICE</h2>
                            <p className="text-blue-100 print:text-gray-600">Booking ID: #{booking.bookingNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg">Hotelify</p>
                            <p className="text-xs text-blue-100 opacity-80 print:text-gray-600">Your Perfect Stay</p>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Hotel Info */}
                        <div className="flex flex-col md:flex-row justify-between mb-8 pb-8 border-b border-gray-100 gap-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">হোটেল ডিটেইলস</h3>
                                <h4 className="font-bold text-gray-900 text-lg mb-1">{booking.roomId?.name || 'Hotel Room'}</h4>
                                <div className="text-gray-600 text-sm flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>
                                        {/* Ideally fetch Hotel name via populate but currently using roomId.name. Fix later if needed. */}
                                        Cox's Bazar, Bangladesh
                                    </span>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">গেস্ট ইনফরমেশন</h3>
                                <p className="font-bold text-gray-900">{booking.guestDetails?.name}</p>
                                <p className="text-gray-600 text-sm">{booking.guestDetails?.phone}</p>
                                <p className="text-gray-600 text-sm">{booking.guestDetails?.email}</p>
                            </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">চেক-ইন</p>
                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    {format(new Date(booking.checkIn), 'dd MMM yyyy')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">চেক-আউট</p>
                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-orange-500" />
                                    {format(new Date(booking.checkOut), 'dd MMM yyyy')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">মোট রাত</p>
                                <p className="font-bold text-gray-900">{booking.nights} Nights</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">গেস্ট সংখ্যা</p>
                                <p className="font-bold text-gray-900">
                                    {typeof booking.guests === 'object'
                                        ? (booking.guests.adults || 0) + (booking.guests.children || 0)
                                        : booking.guests} Guests
                                </p>
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">পেমেন্ট ডিটেইলস</h3>

                            <div className="flex justify-between text-sm text-gray-600">
                                <span>রুম ভাড়া ({booking.nights} রাত)</span>
                                <span>৳{booking.pricing.subtotal?.toLocaleString()}</span>
                            </div>
                            {booking.pricing.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>ডিসকাউন্ট</span>
                                    <span>-৳{booking.pricing.discount?.toLocaleString()}</span>
                                </div>
                            )}
                            {/* Taxes could be added here */}

                            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                                <span className="font-bold text-gray-900 text-lg">মোট টাকা</span>
                                <span className="font-bold text-blue-600 text-xl">৳{booking.pricing.totalAmount?.toLocaleString()}</span>
                            </div>

                            <div className="mt-6 bg-blue-50 text-blue-800 text-sm p-4 rounded-lg flex items-start gap-3">
                                <div className="mt-0.5 font-bold">নোট:</div>
                                <p>
                                    {isPayAtHotel
                                        ? 'বুকিংটি কনফার্ম করার জন্য হোটেল কর্তৃপক্ষের সাথে যোগাযোগ রাখা হতে পারে। চেক-ইন এর সময় পেমেন্ট সম্পন্ন করতে হবে।'
                                        : 'আপনার পেমেন্ট সফল হয়েছে। কোন অতিরিক্ত চার্জ প্রযোজ্য নয়।'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 text-center text-sm text-gray-500">
                        <p className="mb-2 font-medium">প্রয়োজনে যোগাযোগ করুন</p>
                        <div className="flex justify-center gap-6">
                            <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> +880 1700 000000</span>
                            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> support@hotelify.com</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
