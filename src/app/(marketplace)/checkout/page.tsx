"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Calendar, Users, Mail, Phone, User, MapPin, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const [bookingData, setBookingData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form fields
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{
        id: string;
        code: string;
        discountAmount: number;
        message: string;
    } | null>(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');

    useEffect(() => {
        // Load pending booking from sessionStorage
        const pending = sessionStorage.getItem('pendingBooking');
        if (pending) {
            setBookingData(JSON.parse(pending));
        } else {
            // No booking data, redirect back
            router.push('/hotels');
        }
    }, []);

    // Apply coupon
    const applyCoupon = async () => {
        if (!couponCode || !bookingData) return;

        setValidatingCoupon(true);
        setCouponError('');

        try {
            const res = await fetch('/api/offers/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: couponCode,
                    hotelId: bookingData.hotel._id,
                    bookingAmount: bookingData.totalPrice
                })
            });

            const data = await res.json();

            if (data.valid) {
                setAppliedCoupon({
                    id: data.offer.id,
                    code: data.offer.code,
                    discountAmount: data.discountAmount,
                    message: data.message
                });
                setCouponError('');
            } else {
                setCouponError(data.error || 'Invalid coupon');
                setAppliedCoupon(null);
            }
        } catch (error) {
            setCouponError('Failed to validate coupon');
            setAppliedCoupon(null);
        } finally {
            setValidatingCoupon(false);
        }
    };

    // Remove coupon
    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                roomId: bookingData.room._id,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                guests: typeof bookingData.guests === 'number'
                    ? { adults: bookingData.guests, children: 0 }
                    : bookingData.guests,
                guestDetails: {
                    name: guestName,
                    email: guestEmail,
                    phone: guestPhone,
                },
                specialRequests,
                paymentMethod: 'cash', // 'pay_at_hotel' parses to 'cash' for backend validation
                // If coupon applied, maybe send it? The API needs to support it. 
                // For now, calculating price on backend might not include coupon if not passed.
                // The API recalculates price using `calculateBookingPrice`. 
                // We'll need to update API to support coupons later, but for now this creates the base booking.
            };

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    // Redirect to login if unauthorized
                    // Save current checkout state return url could be handled here
                    alert("Please sign in to complete your booking.");
                    router.push('/login?redirect=/checkout');
                    return;
                }
                throw new Error(data.error || 'Booking failed');
            }

            // Success
            sessionStorage.removeItem('pendingBooking');
            // Redirect to success invoice page
            router.push(`/checkout/success?bookingId=${data.booking._id}`);

        } catch (error: any) {
            console.error('Booking Error:', error);
            alert(error.message || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!bookingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    const { room, hotel, checkIn, checkOut, guests, nights, totalPrice } = bookingData;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-16 z-10">
                <div className="container mx-auto px-4 py-4">
                    <Link href={`/hotel/${hotel.slug}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Hotel
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="md:col-span-2 space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Guest Information */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Guest Information</h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                <User className="h-4 w-4 inline mr-1" />
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                                className="w-full px-4 py-3 border rounded-lg"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                <Mail className="h-4 w-4 inline mr-1" />
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={guestEmail}
                                                onChange={(e) => setGuestEmail(e.target.value)}
                                                className="w-full px-4 py-3 border rounded-lg"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                <Phone className="h-4 w-4 inline mr-1" />
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={guestPhone}
                                                onChange={(e) => setGuestPhone(e.target.value)}
                                                className="w-full px-4 py-3 border rounded-lg"
                                                placeholder="+880 1700 000000"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Special Requests (Optional)
                                            </label>
                                            <textarea
                                                value={specialRequests}
                                                onChange={(e) => setSpecialRequests(e.target.value)}
                                                rows={4}
                                                className="w-full px-4 py-3 border rounded-lg resize-none"
                                                placeholder="Any special requests or requirements..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Coupon Code Section */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Have a Coupon?</h2>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter coupon code"
                                            className="flex-grow px-4 py-3 border rounded-lg font-mono uppercase"
                                            disabled={!!appliedCoupon}
                                        />
                                        {appliedCoupon ? (
                                            <button
                                                type="button"
                                                onClick={removeCoupon}
                                                className="px-6 py-3 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200"
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={applyCoupon}
                                                disabled={!couponCode || validatingCoupon}
                                                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                                            >
                                                {validatingCoupon ? 'Checking...' : 'Apply'}
                                            </button>
                                        )}
                                    </div>
                                    {couponError && (
                                        <p className="text-red-500 text-sm mt-2">{couponError}</p>
                                    )}
                                    {appliedCoupon && (
                                        <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-200">
                                            <p className="text-green-700 text-sm font-medium">
                                                ✓ {appliedCoupon.message}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Section */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                                        <CreditCard className="h-5 w-5 inline mr-2" />
                                        Payment Method
                                    </h2>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                        <div className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-blue-900 mb-1">Pay at Hotel</h4>
                                                <p className="text-sm text-blue-700">
                                                    No payment required now. You'll pay at the hotel when you check in.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">
                                        * Online payment integration coming soon
                                    </p>
                                </div>

                                {/* Cancellation Policy */}
                                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                    <div className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-green-900 mb-1">Free Cancellation</h4>
                                            <p className="text-sm text-green-700">
                                                Cancel up to {hotel.policies?.cancellationHours || 24} hours before check-in for a full refund
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors"
                                >
                                    {loading ? 'Processing...' : 'Confirm Booking'}
                                </button>
                            </form>
                        </div>

                        {/* Booking Summary Sidebar */}
                        <div className="md:col-span-1">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 sticky top-28">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Booking Summary</h2>

                                {/* Hotel & Room */}
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-1">{hotel.name}</h3>
                                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                                        <MapPin className="h-3 w-3" />
                                        {hotel.contact?.address?.city}, Bangladesh
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">{room.name}</p>
                                </div>

                                {/* Dates & Guests */}
                                <div className="mb-6 pb-6 border-b border-gray-200 space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">Check-in</p>
                                            <p className="text-gray-600">{new Date(checkIn).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">Check-out</p>
                                            <p className="text-gray-600">{new Date(checkOut).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <p className="text-gray-700">{guests} {guests === 1 ? 'Guest' : 'Guests'}</p>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">৳{room.basePrice?.toLocaleString()} × {nights} nights</span>
                                        <span className="font-bold text-gray-900">৳{totalPrice?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Service fee</span>
                                        <span>৳0</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span className="flex items-center gap-1">
                                                Coupon ({appliedCoupon.code})
                                            </span>
                                            <span>-৳{appliedCoupon.discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                                        <span>Total</span>
                                        <span className="text-blue-600">
                                            ৳{((totalPrice || 0) - (appliedCoupon?.discountAmount || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
