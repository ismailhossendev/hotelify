"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, Loader2, ToggleLeft, ToggleRight, Calendar, Percent, DollarSign, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface Offer {
    _id: string;
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minBookingAmount: number;
    maxDiscountAmount?: number;
    validFrom: string;
    validUntil: string;
    usageLimit: number;
    usageCount: number;
    isActive: boolean;
    isPublic: boolean;
    hotelId: { _id: string; name: string };
}

interface Hotel {
    _id: string;
    name: string;
}

export default function VendorOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Offer | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const [form, setForm] = useState({
        hotelId: "",
        code: "",
        title: "",
        description: "",
        discountType: "percentage" as 'percentage' | 'fixed',
        discountValue: 10,
        minBookingAmount: 0,
        maxDiscountAmount: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: 0,
        isActive: true,
        isPublic: false
    });

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        if (hotels.length > 0) {
            fetchOffers();
            if (!form.hotelId) {
                setForm(f => ({ ...f, hotelId: hotels[0]._id }));
            }
        }
    }, [hotels]);

    const fetchHotels = async () => {
        try {
            // Fetch only vendor's own hotels
            const res = await fetch("/api/vendor/hotels");
            const data = await res.json();
            setHotels(data.hotels || []);
        } catch (error) {
            toast.error("Failed to load hotels");
        }
    };

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/vendor/offers');
            const data = await res.json();
            setOffers(data.offers || []);
        } catch (error) {
            toast.error("Failed to load offers");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.hotelId) {
            toast.error("Please select a hotel");
            return;
        }

        try {
            const res = await fetch('/api/vendor/offers', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Operation failed");

            toast.success("Offer created!");
            closeModal();
            fetchOffers();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this offer?")) return;
        try {
            toast.success("Offer deleted");
            fetchOffers();
        } catch (error) {
            toast.error("Failed to delete offer");
        }
    };

    const toggleActive = async (offer: Offer) => {
        toast.success(offer.isActive ? "Offer deactivated" : "Offer activated");
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({
            hotelId: hotels[0]?._id || "",
            code: "",
            title: "",
            description: "",
            discountType: "percentage",
            discountValue: 10,
            minBookingAmount: 0,
            maxDiscountAmount: 0,
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            usageLimit: 0,
            isActive: true,
            isPublic: false
        });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const isExpired = (date: string) => new Date(date) < new Date();

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
                    <p className="text-gray-500">Create special discounts for your guests</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
                >
                    <Plus size={20} /> Create Offer
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : offers.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No offers yet</h3>
                    <p className="text-gray-500 mb-6">Create your first coupon to attract more guests</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                    >
                        Create Offer
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {offers.map(offer => (
                        <div
                            key={offer._id}
                            className={`bg-white border rounded-xl p-6 flex items-center gap-6 ${!offer.isActive || isExpired(offer.validUntil) ? 'opacity-60' : ''}`}
                        >
                            <button
                                onClick={() => copyCode(offer.code)}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-lg font-mono font-bold flex items-center gap-2"
                            >
                                {offer.code}
                                {copiedCode === offer.code ? <Check size={16} /> : <Copy size={16} />}
                            </button>

                            <div className="flex-grow">
                                <h3 className="font-bold text-gray-900">{offer.title}</h3>
                                <p className="text-gray-500 text-sm">{offer.hotelId?.name}</p>
                                <div className="flex gap-4 mt-1 text-sm">
                                    <span className="flex items-center gap-1 text-purple-600">
                                        {offer.discountType === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                                        {offer.discountType === 'percentage' ? `${offer.discountValue}% off` : `৳${offer.discountValue} off`}
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-500">
                                        <Calendar size={14} />
                                        Until {new Date(offer.validUntil).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {isExpired(offer.validUntil) ? (
                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Expired</span>
                                ) : offer.isActive ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                                ) : (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">Inactive</span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleActive(offer)}
                                    className={`p-2 rounded-lg ${offer.isActive ? 'text-green-600' : 'text-gray-400'}`}
                                >
                                    {offer.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                </button>
                                <button
                                    onClick={() => handleDelete(offer._id)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">Create New Offer</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Hotel - Auto-select if single hotel, show dropdown if multiple */}
                            {hotels.length === 1 ? (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Hotel</label>
                                    <div className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white">
                                        {hotels[0].name}
                                    </div>
                                </div>
                            ) : hotels.length > 1 ? (
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Hotel *</label>
                                    <select
                                        required
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                        value={form.hotelId}
                                        onChange={e => setForm({ ...form, hotelId: e.target.value })}
                                    >
                                        {hotels.map(hotel => (
                                            <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : null}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Coupon Code *</label>
                                    <input
                                        required
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white uppercase font-mono"
                                        value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        placeholder="SUMMER25"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Title *</label>
                                    <input
                                        required
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="Summer Sale"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Discount Type</label>
                                    <select
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                        value={form.discountType}
                                        onChange={e => setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed (৳)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Value *</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                        value={form.discountValue}
                                        onChange={e => setForm({ ...form, discountValue: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Valid From</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                        value={form.validFrom}
                                        onChange={e => setForm({ ...form, validFrom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Valid Until *</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                        value={form.validUntil}
                                        onChange={e => setForm({ ...form, validUntil: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                                    Create Offer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
