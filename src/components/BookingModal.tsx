
"use client";

import { useState, useEffect } from "react";
import { Loader2, X, CheckCircle, Calendar, User, Phone, MapPin, FileText, Users, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });

import { RoomData } from "@/types/room";

const BookingModal = ({ room, hotelId, onClose }: { room: RoomData, hotelId: string, onClose: () => void }) => {
    const [step, setStep] = useState(1); // 1: Form, 2: Success
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState("");
    const [bookingRef, setBookingRef] = useState("");

    const [availability, setAvailability] = useState<{ available: boolean, totalPrice: number, breakdown: any[], error?: string } | null>(null);

    const [formData, setFormData] = useState({
        checkIn: "",
        checkOut: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        specialRequests: "",
        nid: "",
        nidImage: "" as string
    });

    const [additionalGuests, setAdditionalGuests] = useState<{ name: string; age: string; nid: string }[]>([]);

    const addGuest = () => setAdditionalGuests([...additionalGuests, { name: "", age: "", nid: "" }]);
    const removeGuest = (idx: number) => setAdditionalGuests(additionalGuests.filter((_, i) => i !== idx));
    const updateGuest = (idx: number, field: string, value: string) => {
        const newGuests = [...additionalGuests];
        (newGuests[idx] as any)[field] = value;
        setAdditionalGuests(newGuests);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, nidImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    // Check Availability when dates change
    useEffect(() => {
        const check = async () => {
            if (!formData.checkIn || !formData.checkOut) {
                setAvailability(null);
                return;
            }

            setChecking(true);
            setAvailability(null);

            try {
                const res = await fetch("/api/public/bookings/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        hotelId,
                        roomId: room.id,
                        checkIn: formData.checkIn,
                        checkOut: formData.checkOut
                    })
                });
                const data = await res.json();

                if (data.success) {
                    setAvailability({
                        available: data.available,
                        totalPrice: data.totalPrice,
                        breakdown: data.breakdown,
                        error: data.available ? undefined : `Room unavailable on ${data.unavailableDate}`
                    });
                } else {
                    setAvailability({ available: false, totalPrice: 0, breakdown: [], error: data.error });
                }
            } catch (err) {
                console.error(err);
                setAvailability({ available: false, totalPrice: 0, breakdown: [], error: "Failed to check availability" });
            } finally {
                setChecking(false);
            }
        };

        const timeout = setTimeout(check, 500); // Debounce
        return () => clearTimeout(timeout);
    }, [formData.checkIn, formData.checkOut, hotelId, room.id]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!availability?.available) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/public/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hotelId,
                    roomId: room.id,
                    dates: {
                        checkIn: formData.checkIn,
                        checkOut: formData.checkOut
                    },
                    guestDetails: {
                        name: formData.name,
                        phone: formData.phone,
                        email: formData.email,
                        address: formData.address,
                        nid: formData.nid,
                        documents: formData.nidImage ? [{ type: 'nid', url: formData.nidImage }] : [],
                        adults: 1 + additionalGuests.length // Basic logic
                    },
                    additionalGuests: additionalGuests,
                    specialRequests: formData.specialRequests
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to book");

            setBookingRef(data.bookingRef || data.bookingNumber);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl scrollbar-hide"
            >
                {/* Header */}
                <div className="bg-stone-900 text-white p-6 flex justify-between items-start sticky top-0 z-10 shadow-md">
                    <div>
                        <h3 className={`text-2xl ${playfair.className} mb-1`}>
                            {step === 1 ? "Complete Booking" : "Booking Confirmed"}
                        </h3>
                        <p className="text-stone-400 text-sm">{room.name}</p>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check In</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            required
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                                            value={formData.checkIn}
                                            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check Out</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            required
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                                            value={formData.checkOut}
                                            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Availability & Price Display */}
                            <div className="min-h-[60px] flex items-center justify-center p-3 bg-stone-50 rounded-lg">
                                {checking ? (
                                    <span className="text-stone-500 text-sm flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={14} /> Checking availability...
                                    </span>
                                ) : availability ? (
                                    availability.available ? (
                                        <div className="text-center w-full">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                                                    <CheckCircle size={14} /> Available
                                                </span>
                                                <span className="text-stone-500 text-xs text-right">
                                                    {availability.breakdown.length} Nights
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end border-t border-stone-200 pt-2 mt-2">
                                                <span className="text-xs font-bold text-stone-500 uppercase">Total Price</span>
                                                <span className="text-xl font-bold text-stone-900">৳ {availability.totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-red-500 text-sm font-medium">
                                            {availability.error}
                                        </div>
                                    )
                                ) : (
                                    <span className="text-stone-400 text-sm italic">Select dates to see price</span>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <User size={14} /> Primary Guest
                                </h4>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Full Name (Required)"
                                        required
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="tel"
                                            placeholder="Phone (Required)"
                                            required
                                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email (Optional)"
                                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Address (Optional)"
                                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="NID Number (Optional)"
                                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-stone-900 outline-none text-sm"
                                                value={formData.nid}
                                                onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="w-full text-xs file:mr-2 file:py-2 file:px-3 file:border-0 file:rounded-md file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 mt-1"
                                                onChange={handleFileChange}
                                            />
                                            {formData.nidImage && <span className="text-[10px] text-green-600 block mt-1 ml-1">✓ Integrated</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Guests */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Users size={14} /> Additional Guests
                                    </h4>
                                    {room.capacity.adults > 1 && additionalGuests.length < (room.capacity.adults - 1) && (
                                        <button
                                            type="button"
                                            onClick={addGuest}
                                            className="text-xs font-bold text-stone-600 hover:text-black flex items-center gap-1 bg-stone-100 px-2 py-1 rounded hover:bg-stone-200 transition-colors"
                                        >
                                            <Plus size={12} /> Add Guest
                                        </button>
                                    )}
                                </div>

                                {additionalGuests.length > 0 ? (
                                    <div className="space-y-2">
                                        {additionalGuests.map((guest, idx) => (
                                            <div key={idx} className="flex gap-2 items-start animate-fade-in bg-stone-50 p-2 rounded-lg border border-stone-100">
                                                <div className="grid grid-cols-7 gap-2 flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Name"
                                                        required
                                                        className="col-span-3 px-2 py-1.5 border rounded text-xs"
                                                        value={guest.name}
                                                        onChange={(e) => updateGuest(idx, 'name', e.target.value)}
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Age"
                                                        className="col-span-1 px-2 py-1.5 border rounded text-xs"
                                                        value={guest.age}
                                                        onChange={(e) => updateGuest(idx, 'age', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="NID"
                                                        className="col-span-3 px-2 py-1.5 border rounded text-xs"
                                                        value={guest.nid}
                                                        onChange={(e) => updateGuest(idx, 'nid', e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeGuest(idx)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No additional guests added.</p>
                                )}
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Special Requests</label>
                                <textarea
                                    placeholder="Any special requirements? (Optional)"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-stone-900 outline-none text-sm h-20 resize-none"
                                    value={formData.specialRequests}
                                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !availability?.available}
                                className={`w-full mt-6 py-4 rounded-xl font-bold uppercase tracking-wider transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${availability?.available
                                    ? "bg-stone-900 text-white hover:bg-stone-800"
                                    : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                                    }`}
                            >
                                {loading && <Loader2 className="animate-spin" size={18} />}
                                {loading ? "Processing..." : "Confirm Booking"}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"
                            >
                                <CheckCircle size={48} />
                            </motion.div>
                            <h4 className={`text-3xl text-gray-900 mb-2 ${playfair.className}`}>Thank You!</h4>
                            <p className="text-gray-500 mb-8 max-w-xs mx-auto">Your booking has been successfully placed. We look forward to hosting you.</p>

                            <div className="bg-stone-50 border border-stone-200 p-6 rounded-xl mb-8 max-w-sm mx-auto">
                                <span className="block text-xs uppercase text-gray-400 font-bold mb-2 tracking-widest">Booking Reference</span>
                                <span className="text-2xl font-mono text-stone-900 tracking-wider select-all font-bold">{bookingRef}</span>
                            </div>

                            <button
                                onClick={onClose}
                                className="text-stone-900 font-bold hover:text-stone-700 hover:underline transition-colors"
                            >
                                Close Window
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default BookingModal;
