"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Tag, Loader2, ToggleLeft, ToggleRight, Eye, EyeOff, Calendar, Percent, DollarSign, Copy, Check, Star, Building } from "lucide-react";
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
    showOnHome: boolean;
    scope: 'platform' | 'hotel';
    applicableHotels: { _id: string; name: string }[];
    hotelId?: { _id: string; name: string };
    createdBy: { _id: string; name: string };
}

interface Hotel {
    _id: string;
    name: string;
}

export default function AdminOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Offer | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const [form, setForm] = useState({
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
        isPublic: false,
        showOnHome: false,
        applicableHotels: [] as string[]
    });

    useEffect(() => {
        fetchOffers();
        fetchHotels();
    }, [filter]);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/offers?scope=all&status=${filter === 'all' ? '' : filter}`);
            const data = await res.json();
            setOffers(data.offers || []);
        } catch (error) {
            toast.error("Failed to load offers");
        } finally {
            setLoading(false);
        }
    };

    const fetchHotels = async () => {
        try {
            const res = await fetch("/api/admin/hotels?limit=100");
            const data = await res.json();
            setHotels(data.hotels || []);
        } catch (error) {
            console.error("Failed to load hotels");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editing ? `/api/admin/offers/${editing._id}` : "/api/admin/offers";
        const method = editing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Operation failed");

            toast.success(editing ? "Offer updated!" : "Offer created!");
            closeModal();
            fetchOffers();
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this offer?")) return;
        try {
            await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
            toast.success("Offer deleted");
            fetchOffers();
        } catch (error) {
            toast.error("Failed to delete offer");
        }
    };

    const toggleActive = async (offer: Offer) => {
        try {
            await fetch(`/api/admin/offers/${offer._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !offer.isActive })
            });
            toast.success(offer.isActive ? "Offer deactivated" : "Offer activated");
            fetchOffers();
        } catch (error) {
            toast.error("Failed to update offer");
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({
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

            isPublic: false,
            showOnHome: false,
            applicableHotels: []
        });
    };

    const openEdit = (offer: Offer) => {
        setEditing(offer);
        setForm({
            code: offer.code,
            title: offer.title,
            description: offer.description || "",
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            minBookingAmount: offer.minBookingAmount || 0,
            maxDiscountAmount: offer.maxDiscountAmount || 0,
            validFrom: new Date(offer.validFrom).toISOString().split('T')[0],
            validUntil: new Date(offer.validUntil).toISOString().split('T')[0],
            usageLimit: offer.usageLimit || 0,
            isActive: offer.isActive,

            isPublic: offer.isPublic || false,
            showOnHome: offer.showOnHome || false,
            applicableHotels: offer.applicableHotels?.map(h => h._id) || []
        });
        setShowModal(true);
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const isExpired = (date: string) => new Date(date) < new Date();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Offers & Coupons</h1>
                    <p className="text-gray-500">Manage platform-wide discount offers</p>
                </div>
                <button
                    onClick={() => { setEditing(null); closeModal(); setShowModal(true); }}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
                >
                    <Plus size={20} /> Create Offer
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {(['all', 'active', 'expired', 'inactive'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : offers.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No offers yet</h3>
                    <p className="text-gray-500 mb-6">Create your first coupon to get started</p>
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
                            className={`bg-white border rounded-xl p-6 flex items-center gap-6 ${!offer.isActive || isExpired(offer.validUntil) ? 'opacity-60' : ''
                                }`}
                        >
                            {/* Code Badge */}
                            <div className="flex-shrink-0">
                                <button
                                    onClick={() => copyCode(offer.code)}
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-lg font-mono font-bold text-lg flex items-center gap-2 hover:opacity-90 transition"
                                >
                                    {offer.code}
                                    {copiedCode === offer.code ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>

                            {/* Info */}
                            <div className="flex-grow">
                                <h3 className="font-bold text-gray-900 text-lg">{offer.title}</h3>
                                <p className="text-gray-500 text-sm">{offer.description || 'No description'}</p>
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className="flex items-center gap-1 text-purple-600">
                                        {offer.discountType === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                                        {offer.discountType === 'percentage' ? `${offer.discountValue}% off` : `৳${offer.discountValue} off`}
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-500">
                                        <Calendar size={14} />
                                        Until {new Date(offer.validUntil).toLocaleDateString()}
                                    </span>
                                    <span className="text-gray-500">
                                        Used: {offer.usageCount}/{offer.usageLimit || '∞'}
                                    </span>
                                    {offer.scope === 'hotel' && offer.hotelId && (
                                        <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 rounded-md">
                                            <Building size={12} /> {offer.hotelId.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-4">
                                {isExpired(offer.validUntil) ? (
                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Expired</span>
                                ) : offer.isActive ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                                ) : (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">Inactive</span>
                                )}
                                {offer.isPublic && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Eye size={12} /> Public
                                    </span>
                                )}
                                {offer.showOnHome && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Star size={12} /> Featured
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleActive(offer)}
                                    className={`p-2 rounded-lg transition ${offer.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                                    title={offer.isActive ? 'Deactivate' : 'Activate'}
                                >
                                    {offer.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                </button>
                                <button
                                    onClick={() => openEdit(offer)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                                >
                                    <Edit2 size={18} />
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-xl w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{editing ? "Edit Offer" : "Create New Offer"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                                <textarea
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                    rows={2}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Get discount on your booking..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Discount Type *</label>
                                    <select
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                        value={form.discountType}
                                        onChange={e => setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (৳)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">
                                        Discount Value * {form.discountType === 'percentage' ? '(%)' : '(৳)'}
                                    </label>
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
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Min Booking (৳)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                        value={form.minBookingAmount}
                                        onChange={e => setForm({ ...form, minBookingAmount: parseInt(e.target.value) || 0 })}
                                        placeholder="0 = No minimum"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Max Discount (৳)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                        value={form.maxDiscountAmount}
                                        onChange={e => setForm({ ...form, maxDiscountAmount: parseInt(e.target.value) || 0 })}
                                        placeholder="0 = No cap"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Valid From *</label>
                                    <input
                                        required
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

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Usage Limit</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                                    value={form.usageLimit}
                                    onChange={e => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })}
                                    placeholder="0 = Unlimited"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave 0 for unlimited uses</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Applicable Hotels (optional)</label>
                                <div className="max-h-32 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg p-2">
                                    {hotels.length === 0 ? (
                                        <p className="text-gray-500 text-sm">Loading hotels...</p>
                                    ) : (
                                        <>
                                            <label className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={form.applicableHotels.length === 0}
                                                    onChange={() => setForm({ ...form, applicableHotels: [] })}
                                                    className="rounded"
                                                />
                                                <span className="text-gray-300 font-medium">All Hotels</span>
                                            </label>
                                            {hotels.map(hotel => (
                                                <label key={hotel._id} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.applicableHotels.includes(hotel._id)}
                                                        onChange={e => {
                                                            if (e.target.checked) {
                                                                setForm({ ...form, applicableHotels: [...form.applicableHotels, hotel._id] });
                                                            } else {
                                                                setForm({ ...form, applicableHotels: form.applicableHotels.filter(id => id !== hotel._id) });
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-gray-300">{hotel.name}</span>
                                                </label>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-gray-300">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublic}
                                        onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-gray-300">Show on Offers Page</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.showOnHome}
                                        onChange={e => setForm({ ...form, showOnHome: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-gray-300">Feature on Home</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                                    {editing ? 'Update' : 'Create'} Offer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
