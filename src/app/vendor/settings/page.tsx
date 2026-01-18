"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Building, Clock, MapPin, ImageIcon, ListChecks, Globe } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

const AMENITY_OPTIONS = [
    "Free WiFi", "Swimming Pool", "Gym", "Spa", "Restaurant",
    "Bar", "Room Service", "Parking", "Airport Shuttle",
    "Beach Access", "Conference Hall", "Pet Friendly"
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [domainData, setDomainData] = useState({ subdomain: '', customDomain: '', verified: false, ssl: false });
    const [loadingDomain, setLoadingDomain] = useState(false);

    const [hotel, setHotel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [availableCategories, setAvailableCategories] = useState<any[]>([]);

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        email: "",
        phone: "",
        address: "",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        coverImage: "",
        amenities: [] as string[]
    });

    useEffect(() => {
        // Fetch Hotel Data
        fetch('/api/hotels')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.hotels.length > 0) {
                    const h = data.hotels[0];
                    setHotel(h);
                    setFormData({
                        name: h.name,
                        description: h.description || "",
                        category: h.category || "",
                        email: h.contact?.email || "",
                        phone: h.contact?.phone || "",
                        address: h.contact?.address?.line1 || "",
                        checkInTime: h.policies?.checkInTime || "14:00",
                        checkOutTime: h.policies?.checkOutTime || "12:00",
                        coverImage: h.coverImage || "",
                        amenities: h.amenities || []
                    });
                }
                setLoading(false);
            })
            .catch(console.error);

        // Fetch Domain Data
        fetch('/api/vendor/domain')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.domain) {
                    setDomainData({
                        subdomain: data.domain.subdomain || "",
                        customDomain: data.domain.customDomain || "",
                        verified: data.domain.customDomainVerified || false,
                        ssl: data.domain.sslEnabled || false
                    });
                }
            })
            .catch(console.error);

        // Fetch Available Categories
        fetch('/api/config/public')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.config?.categories?.items) {
                    setAvailableCategories(data.config.categories.items);
                }
            })
            .catch(console.error);
    }, []);

    const handleSave = async () => {
        if (!hotel) return;
        setSaving(true);

        try {
            const res = await fetch(`/api/hotels/${hotel._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    contact: {
                        email: formData.email,
                        phone: formData.phone,
                        address: { line1: formData.address }
                    },
                    policies: {
                        checkInTime: formData.checkInTime,
                        checkOutTime: formData.checkOutTime
                    },
                    coverImage: formData.coverImage,
                    amenities: formData.amenities
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Settings saved successfully!");
                setHotel(data.hotel);
            } else {
                alert("Failed: " + data.error);
            }
        } catch (err) {
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDomain = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/vendor/domain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subdomain: domainData.subdomain,
                    customDomain: domainData.customDomain
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Domain settings updated! Custom domains require admin approval.");
                setDomainData({
                    subdomain: data.domain.subdomain || "",
                    customDomain: data.domain.customDomain || "",
                    verified: data.domain.customDomainVerified || false,
                    ssl: data.domain.sslEnabled || false
                });
            } else {
                alert("Failed: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error saving domain settings");
        } finally {
            setSaving(false);
        }
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
    if (!hotel) return <div className="p-8">No hotel found. Please contact support.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Hotel Settings</h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('domain')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'domain' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Domain Configuration
                    </button>
                </div>
            </div>

            {activeTab === 'general' ? (
                <div className="space-y-8">
                    {/* Cover Image */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <ImageIcon className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold">Cover Image</h2>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-2">This image will appear at the top of your hotel page.</p>
                            <ImageUploader
                                images={formData.coverImage ? [formData.coverImage] : []}
                                onChange={(urls) => setFormData({ ...formData, coverImage: urls[0] || "" })}
                                maxImages={1}
                            />
                        </div>
                    </div>

                    {/* General Info */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <Building className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold">General Information</h2>
                        </div>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                                <input
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Property Category</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">Select a Category...</option>
                                    {availableCategories.map((cat: any) => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">This determines how your property is displayed on the marketplace.</p>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <ListChecks className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold">Amenities</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {AMENITY_OPTIONS.map(amenity => (
                                <label key={amenity} className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.amenities.includes(amenity)}
                                        onChange={() => toggleAmenity(amenity)}
                                        className="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold">Contact Details</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <Clock className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold">Policies</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time</label>
                                <input
                                    type="time"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.checkInTime}
                                    onChange={e => setFormData({ ...formData, checkInTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time</label>
                                <input
                                    type="time"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.checkOutTime}
                                    onChange={e => setFormData({ ...formData, checkOutTime: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end sticky bottom-6 z-10">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg disabled:opacity-70 transition-all border-2 border-white/20"
                        >
                            {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <Globe className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold">Domain Setup</h2>
                        </div>

                        {/* Subdomain */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                            <div className="flex items-center">
                                <input
                                    className="flex-1 p-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={domainData.subdomain}
                                    onChange={e => setDomainData({ ...domainData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                    placeholder="my-hotel"
                                />
                                <span className="bg-gray-100 border border-l-0 px-4 py-2 rounded-r-lg text-gray-500">
                                    .hotelify.com
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Your public URL: <strong className="text-blue-600">{domainData.subdomain || '...'}.hotelify.com</strong>
                            </p>
                        </div>

                        {/* Custom Domain */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain (Optional)</label>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={domainData.customDomain}
                                    onChange={e => setDomainData({ ...domainData, customDomain: e.target.value })}
                                    placeholder="www.myhotel.com"
                                />
                                {domainData.customDomain && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${domainData.verified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {domainData.verified ? 'Verified' : 'Pending'}
                                    </span>
                                )}
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                                <p className="font-bold mb-1">DNS Configuration:</p>
                                <p>To connect your custom domain, create a <strong>CNAME</strong> record pointing to <strong>cname.hotelify.com</strong></p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSaveDomain}
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg disabled:opacity-70 transition-all"
                            >
                                {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                                Update Domain Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
