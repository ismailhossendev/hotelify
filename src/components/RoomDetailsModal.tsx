"use client";

import { useState, useEffect } from 'react';
import { X, Users, Bed, Maximize, Wifi, Tv, Wind, Coffee, Check, AlertCircle, Calendar } from 'lucide-react';

interface RoomDetailsModalProps {
    room: any;
    hotel: any;
    isOpen: boolean;
    onClose: () => void;
    onReserve?: (bookingDetails: any) => void;
}

export default function RoomDetailsModal({ room, hotel, isOpen, onClose, onReserve }: RoomDetailsModalProps) {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(2);
    const [checking, setChecking] = useState(false);
    const [availability, setAvailability] = useState<any>(null);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setAvailability(null);
        }
    }, [isOpen]);

    // Check availability when dates change
    useEffect(() => {
        if (checkIn && checkOut && isOpen) {
            checkAvailability();
        }
    }, [checkIn, checkOut]);

    const checkAvailability = async () => {
        setChecking(true);
        try {
            const res = await fetch('/api/bookings/check-availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: room._id,
                    checkIn,
                    checkOut
                })
            });
            const data = await res.json();
            setAvailability(data);
        } catch (err) {
            console.error('Availability check failed:', err);
            setAvailability({ available: false, error: 'Failed to check availability' });
        } finally {
            setChecking(false);
        }
    };

    const handleReserve = () => {
        if (availability?.available && onReserve) {
            onReserve({
                room,
                hotel,
                checkIn,
                checkOut,
                guests,
                nights: availability.nights,
                totalPrice: room.basePrice * availability.nights
            });
        }
    };

    const roomImages = room.images?.length > 0
        ? room.images.map((img: any) => img.url)
        : [hotel.coverImage || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80"];

    const amenityIcons: Record<string, any> = {
        'WiFi': Wifi,
        'TV': Tv,
        'AC': Wind,
        'Mini Bar': Coffee,
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="min-h-screen px-4 flex items-center justify-center">
                <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden">
                    {/* Header */}
                    <div className="relative">
                        {/* Image Gallery */}
                        <div className="relative h-96 bg-gray-200">
                            <img
                                src={roomImages[0]}
                                alt={room.name}
                                className="w-full h-full object-cover"
                            />
                            {roomImages.length > 1 && (
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold">
                                    1 / {roomImages.length}
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full hover:bg-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Room Info - Left Side */}
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h2>
                                    <p className="text-gray-600 mb-4">{room.description}</p>
                                </div>

                                {/* Room Features */}
                                <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Guests</p>
                                            <p className="font-bold text-gray-900">{room.capacity?.adults || 2} Adults</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Bed className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Bed</p>
                                            <p className="font-bold text-gray-900">{room.bedType || 'King'}</p>
                                        </div>
                                    </div>
                                    {room.roomSize && (
                                        <div className="flex items-center gap-3">
                                            <Maximize className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Size</p>
                                                <p className="font-bold text-gray-900">{room.roomSize} ft²</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Amenities */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Room Amenities</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {room.amenities?.map((amenity: string, idx: number) => {
                                            const Icon = amenityIcons[amenity] || Check;
                                            return (
                                                <div key={idx} className="flex items-center gap-2 text-gray-700">
                                                    <Icon className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm">{amenity}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
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
                            </div>

                            {/* Booking Card - Right Side */}
                            <div className="md:col-span-1">
                                <div className="bg-gray-50 p-6 rounded-2xl space-y-4 sticky top-4">
                                    <div className="pb-4 border-b border-gray-200">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-gray-900">
                                                ৳{room.basePrice?.toLocaleString()}
                                            </span>
                                            <span className="text-gray-500">/night</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Check-in</label>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Check-out</label>
                                        <input
                                            type="date"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            min={checkIn || new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Guests</label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setGuests(Math.max(1, guests - 1))}
                                                className="w-10 h-10 rounded bg-white border hover:bg-gray-100 flex items-center justify-center font-bold"
                                            >−</button>
                                            <span className="font-bold w-10 text-center">{guests}</span>
                                            <button
                                                onClick={() => setGuests(Math.min(room.capacity?.adults || 4, guests + 1))}
                                                className="w-10 h-10 rounded bg-white border hover:bg-gray-100 flex items-center justify-center font-bold"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Availability Status */}
                                    {checking && (
                                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                                            Checking availability...
                                        </div>
                                    )}

                                    {availability && !checking && (
                                        <div className={`p-3 rounded-lg text-sm ${availability.available
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-red-50 text-red-700'
                                            }`}>
                                            <div className="flex items-start gap-2">
                                                {availability.available ? (
                                                    <Check className="h-4 w-4 shrink-0 mt-0.5" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                )}
                                                <span>
                                                    {availability.available
                                                        ? `Available for ${availability.nights} nights`
                                                        : availability.message || 'Not available for selected dates'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Price Breakdown */}
                                    {availability?.available && (
                                        <div className="pt-4 border-t border-gray-200 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">৳{room.basePrice?.toLocaleString()} × {availability.nights} nights</span>
                                                <span className="font-bold">৳{(room.basePrice * availability.nights)?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                                <span>Total</span>
                                                <span>৳{(room.basePrice * availability.nights)?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleReserve}
                                        disabled={!availability?.available || checking}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors"
                                    >
                                        Reserve Now
                                    </button>

                                    <p className="text-xs text-gray-500 text-center">
                                        You won't be charged yet
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
