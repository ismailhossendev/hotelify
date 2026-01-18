"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Bed, Maximize } from 'lucide-react';
import RoomDetailsModal from '@/components/RoomDetailsModal';

export default function HotelRoomsSection({ rooms, hotel }: { rooms: any[]; hotel: any }) {
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    const handleRoomClick = (room: any) => {
        setSelectedRoom(room);
        setShowModal(true);
    };

    const handleReserve = (bookingDetails: any) => {
        // Store booking data in sessionStorage and redirect to checkout
        sessionStorage.setItem('pendingBooking', JSON.stringify(bookingDetails));
        router.push('/checkout');
    };

    return (
        <>
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
                <div className="space-y-4">
                    {rooms.length > 0 ? (
                        rooms.map((room: any) => (
                            <RoomCard
                                key={room._id}
                                room={room}
                                hotel={hotel}
                                onReserveClick={() => handleRoomClick(room)}
                            />
                        ))
                    ) : (
                        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                            <p className="text-gray-500">No rooms available at this time.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedRoom && (
                <RoomDetailsModal
                    room={selectedRoom}
                    hotel={hotel}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onReserve={handleReserve}
                />
            )}
        </>
    );
}

// Room Card Component
function RoomCard({ room, hotel, onReserveClick }: { room: any; hotel: any; onReserveClick: () => void }) {
    const roomImage = room.images?.[0]?.url || hotel.coverImage || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="grid md:grid-cols-3 gap-6 p-6">
                {/* Room Image */}
                <div className="relative h-48 md:h-full rounded-xl overflow-hidden cursor-pointer" onClick={onReserveClick}>
                    <img
                        src={roomImage}
                        alt={room.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Room Info */}
                <div className="md:col-span-2 flex flex-col">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>

                        {/* Room Features */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>{room.capacity?.adults || 2} Adults, {room.capacity?.children || 1} Child</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Bed className="h-4 w-4" />
                                <span>{room.bedType || 'King Bed'}</span>
                            </div>
                            {room.roomSize && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Maximize className="h-4 w-4" />
                                    <span>{room.roomSize} sq ft</span>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2">
                            {room.amenities?.slice(0, 4).map((amenity: string, idx: number) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                    {amenity}
                                </span>
                            ))}
                            {room.amenities?.length > 4 && (
                                <span className="text-xs text-blue-600 font-medium">
                                    +{room.amenities.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="flex items-end justify-between mt-6 pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Starting from</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">৳{room.basePrice?.toLocaleString()}</span>
                                <span className="text-gray-500">/night</span>
                            </div>
                        </div>
                        <button
                            onClick={onReserveClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
                        >
                            Reserve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
