"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, User, Search, Loader2 } from "lucide-react";

interface CreateBookingModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateBookingModal({ onClose, onSuccess }: CreateBookingModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Step 1: Availability
    const [dates, setDates] = useState({
        checkIn: format(new Date(), "yyyy-MM-dd"), // Defaults to today
        checkOut: format(new Date(Date.now() + 86400000), "yyyy-MM-dd") // Defaults to tomorrow
    });
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [availableUnits, setAvailableUnits] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Step 2: Selected Room & Details
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [selectedUnit, setSelectedUnit] = useState<string>(""); // Unit ID
    const [guestDetails, setGuestDetails] = useState({
        name: "",
        phone: "",
        email: "",
        address: ""
    });
    const [guests, setGuests] = useState({ adults: 1, children: 0 });
    const [specialRequests, setSpecialRequests] = useState("");

    const checkAvailability = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSearching(true);
        setError("");

        try {
            // Fetch rooms available for these dates
            // IMPORTANT: Just getting all rooms for now then filtering is inefficient but works for MVP.
            // Ideally backend should have /api/rooms/available endpoint.
            // Let's use GET /api/rooms just to list rooms, we might need to add availability check logic client-side or assume all active rooms shown.
            // Better: Modify GET /api/rooms to accept availability dates, or iterate and check individual.
            // For MVP: Fetch all rooms, user selects one, backend validates on SUBMIT. 
            // Better UX: Show only available rooms. 
            // Let's assume we show all rooms and let backend reject if taken (simplistic) OR check filtered.
            // Actually, let's implement a simple "Check" that really just lists all rooms for now, 
            // but we'll mark them as "Available" visually (simulated) until we have complex search API.

            const res = await fetch(`/api/rooms`);
            const data = await res.json();

            if (data.success) {
                setAvailableRooms(data.rooms);
                setStep(2);
            } else {
                setError("Failed to load rooms");
            }
        } catch (err) {
            setError("Failed to check availability");
        } finally {
            setSearching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomId: selectedRoom._id,
                    roomUnitId: selectedUnit || undefined,
                    checkIn: new Date(dates.checkIn).toISOString(),
                    checkOut: new Date(dates.checkOut).toISOString(),
                    guestDetails,
                    guests,
                    specialRequests
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create booking");

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold">New Booking</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium block mb-1">Check In</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded-lg"
                                        value={dates.checkIn}
                                        onChange={e => setDates({ ...dates, checkIn: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-1">Check Out</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded-lg"
                                        value={dates.checkOut}
                                        onChange={e => setDates({ ...dates, checkOut: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={checkAvailability}
                                disabled={searching}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                {searching ? <Loader2 className="animate-spin h-5 w-5" /> : <><Search className="h-4 w-4" /> Check Availability</>}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Room Selection */}
                            {!selectedRoom ? (
                                <div>
                                    <h3 className="font-medium mb-3">Select Room</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {availableRooms.map(room => (
                                            <div
                                                key={room._id}
                                                onClick={() => setSelectedRoom(room)}
                                                className="border p-3 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                                            >
                                                <div className="font-bold">{room.name}</div>
                                                <div className="text-xs text-gray-500 capitalize">{room.roomType}</div>
                                                <div className="text-sm font-medium text-blue-600 mt-1">BDT {room.basePrice}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="mt-4 text-sm text-gray-500 underline"
                                    >Change Dates</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-blue-900">{selectedRoom.name}</div>
                                                <div className="text-xs text-blue-700">
                                                    {format(new Date(dates.checkIn), "MMM d")} - {format(new Date(dates.checkOut), "MMM d")}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedRoom(null); setSelectedUnit(""); }}
                                                className="text-xs text-blue-600 hover:underline"
                                            >Change</button>
                                        </div>

                                        {/* Unit Selector */}
                                        <div className="pt-2 border-t border-blue-200">
                                            <label className="text-xs font-bold text-blue-800 block mb-1">Assign Room Number (Optional)</label>
                                            <select
                                                className="w-full text-sm border-blue-200 rounded p-1"
                                                value={selectedUnit}
                                                onChange={e => setSelectedUnit(e.target.value)}
                                                onClick={() => {
                                                    if (availableUnits.length === 0) {
                                                        fetch('/api/room-units').then(r => r.json()).then(d => {
                                                            if (d.success) setAvailableUnits(d.units.filter((u: any) => u.roomTypeId === selectedRoom._id));
                                                        });
                                                    }
                                                }}
                                            >
                                                <option value="">Auto-Assign Later</option>
                                                {availableUnits.map(u => (
                                                    <option key={u._id} value={u._id} disabled={u.status !== 'clean'}>
                                                        {u.roomNo} ({u.status})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium block mb-1">Guest Name *</label>
                                            <input
                                                required
                                                className="w-full p-2 border rounded-lg"
                                                value={guestDetails.name}
                                                onChange={e => setGuestDetails({ ...guestDetails, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium block mb-1">Phone *</label>
                                            <input
                                                required
                                                type="tel"
                                                className="w-full p-2 border rounded-lg"
                                                value={guestDetails.phone}
                                                onChange={e => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium block mb-1">Adults</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full p-2 border rounded-lg"
                                                value={guests.adults}
                                                onChange={e => setGuests({ ...guests, adults: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium block mb-1">Children</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full p-2 border rounded-lg"
                                                value={guests.children}
                                                onChange={e => setGuests({ ...guests, children: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-70 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Confirm Booking"}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
