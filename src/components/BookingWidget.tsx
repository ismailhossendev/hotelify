"use client";

import { useState, useEffect } from 'react';
import { Calendar, Users, ArrowRight, Star, CheckCircle, Info } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface BookingWidgetProps {
    hotel: any;
    basePrice: number;
    rooms: any[];
}

export default function BookingWidget({ hotel, basePrice, rooms }: BookingWidgetProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
    const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
    const [guests, setGuests] = useState("2");
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [selectedRoom, setSelectedRoom] = useState(rooms[0]?._id || "");
    const [loading, setLoading] = useState(false);

    // Initialize from URL or Session Storage
    useEffect(() => {
        // 1. Try URL Params first
        const urlCheckIn = searchParams.get('checkIn');
        const urlCheckOut = searchParams.get('checkOut');
        const urlGuests = searchParams.get('guests');

        if (urlCheckIn) setCheckIn(new Date(urlCheckIn));
        if (urlCheckOut) setCheckOut(new Date(urlCheckOut));
        if (urlGuests) {
            setGuests(urlGuests);
            setAdults(parseInt(urlGuests)); // Simplified mapping
        }

        // 2. Fallback to Session Storage if URL params missing
        if (!urlCheckIn || !urlCheckOut) {
            const savedParams = sessionStorage.getItem('bookingParams');
            if (savedParams) {
                try {
                    const parsed = JSON.parse(savedParams);
                    if (!urlCheckIn && parsed.checkIn) setCheckIn(new Date(parsed.checkIn));
                    if (!urlCheckOut && parsed.checkOut) setCheckOut(new Date(parsed.checkOut));
                    if (!urlGuests && parsed.guests) {
                        setGuests(parsed.guests.toString());
                        setAdults(parsed.guests);
                    }
                } catch (e) {
                    console.error("Failed to parse session params", e);
                }
            }
        }
    }, [searchParams]);

    // Save to Session Storage on Change
    useEffect(() => {
        if (checkIn || checkOut || guests) {
            const params = {
                checkIn: checkIn?.toISOString(),
                checkOut: checkOut?.toISOString(),
                guests: parseInt(guests)
            };
            sessionStorage.setItem('bookingParams', JSON.stringify(params));
        }
    }, [checkIn, checkOut, guests]);

    const handleBookNow = () => {
        setLoading(true);

        // Find full room details
        const roomDetails = rooms.find(r => r._id === selectedRoom) || rooms[0];

        // Calculate costs
        const computedNights = checkIn && checkOut
            ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
            : 1;
        const pricePerNight = roomDetails?.basePrice || basePrice;
        const computedTotalPrice = pricePerNight * computedNights;

        // Construct booking data object expected by CheckoutPage
        const bookingData = {
            hotel: hotel,
            room: roomDetails,
            checkIn: checkIn?.toISOString(),
            checkOut: checkOut?.toISOString(),
            guests: parseInt(guests),
            nights: computedNights,
            totalPrice: computedTotalPrice
        };

        // Save to Session Storage for CheckoutPage
        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));

        // Redirect to checkout
        router.push('/checkout');
    };

    // Calculate nights
    const nights = checkIn && checkOut
        ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
        : 1;

    // Find selected room price
    const currentRoom = rooms.find(r => r._id === selectedRoom) || rooms[0];
    const pricePerNight = currentRoom?.basePrice || basePrice;
    const totalPrice = pricePerNight * nights;

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 sticky top-24 z-20">
            {/* Price Header */}
            <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-6">
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">৳{pricePerNight.toLocaleString()}</span>
                        <span className="text-gray-500 font-medium">/night</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-yellow-500 font-bold bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="h-4 w-4 fill-yellow-500" />
                    <span>{hotel.starRating || 5.0}</span>
                    <span className="text-gray-400 font-normal ml-1">({hotel.reviews?.length || 128})</span>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Check-in</label>
                        <DatePicker
                            date={checkIn}
                            setDate={setCheckIn}
                            placeholder="Select Date"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Check-out</label>
                        <DatePicker
                            date={checkOut}
                            setDate={setCheckOut}
                            placeholder="Select Date"
                        />
                    </div>
                </div>

                {/* Guests */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Guests</label>
                    <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 p-3 h-12">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <SelectValue placeholder="Select Guests" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 Guest</SelectItem>
                            <SelectItem value="2">2 Guests</SelectItem>
                            <SelectItem value="3">3 Guests</SelectItem>
                            <SelectItem value="4">4 Guests</SelectItem>
                            <SelectItem value="5">5+ Guests</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Room Selection */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Room Type</label>
                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 font-medium"
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                        >
                            {rooms.map(room => (
                                <option key={room._id} value={room._id}>
                                    {room.name} (+৳{((room.basePrice || 0) - basePrice).toLocaleString()})
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Calculation */}
            {checkIn && checkOut && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>৳{pricePerNight.toLocaleString()} × {nights} nights</span>
                        <span>৳{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Service Fee</span>
                        <span>৳0</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                        <span>Total (BDT)</span>
                        <span>৳{totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            )}

            <button
                onClick={handleBookNow}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
                {loading ? 'Processing...' : 'Reserve Now'}
                {!loading && <ArrowRight className="h-5 w-5" />}
            </button>

            <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p>You won't be charged yet. Free cancellation up to 24 hours before check-in.</p>
            </div>
        </div>
    );
}
