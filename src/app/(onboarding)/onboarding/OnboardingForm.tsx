"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hotel, Globe, Loader2, Mail, Phone } from "lucide-react";

export default function OnboardingForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [plans, setPlans] = useState<any[]>([]);
    const [destinations, setDestinations] = useState<any[]>([]);
    const [selectedDestination, setSelectedDestination] = useState("");
    const [docFile, setDocFile] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        // Fetch Plans
        fetch("/api/plans")
            .then(res => res.json())
            .then(data => { if (data.plans) setPlans(data.plans); });

        // Fetch Destinations
        fetch("/api/public/destinations")
            .then(res => res.json())
            .then(data => { if (data.destinations) setDestinations(data.destinations); });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setDocFile(base64);
                setPreviewUrl(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const defaultPlan = plans.find(p => p.slug === 'basic') || plans[0];
        if (!defaultPlan) {
            setError("No subscription plans available. Please contact support.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/hotels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug || formData.name.toLowerCase().replace(/ /g, "-"),
                    planId: defaultPlan._id,
                    destinationId: selectedDestination,
                    documents: docFile ? [{
                        type: 'other',
                        url: docFile,
                        verified: false
                    }] : [],
                    contact: {
                        email: formData.email,
                        phone: formData.phone,
                        address: {
                            city: "Bangladesh",
                        }
                    }
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create hotel");

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Hotel className="h-7 w-7 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome to Hotelify 👋</h1>
                    <p className="text-gray-500 mt-2 text-sm">Let's set up your property profile to get started.</p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap justify-center gap-3 mb-6 text-xs">
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">✓ 14-day free trial</span>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">✓ No credit card</span>
                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">✓ Cancel anytime</span>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* --- STEP 1: Basic Info & Destination --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                            <input
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Grand Sultan"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                            <select
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={selectedDestination}
                                onChange={(e) => setSelectedDestination(e.target.value)}
                            >
                                <option value="">Select Location</option>
                                {destinations.map((d: any) => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" /> Subdomain *
                        </label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-gray-50 text-gray-500 text-sm">
                                hotelify.com/
                            </span>
                            <input
                                required
                                className="flex-1 p-3 border rounded-r-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="grand-sultan"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                            <input
                                type="tel"
                                required
                                className="w-full p-3 border rounded-lg"
                                placeholder="+8801..."
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                className="w-full p-3 border rounded-lg"
                                placeholder="owner@hotel.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* --- STEP 2: Document Verification --- */}
                    <div className="border-t pt-4 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Verification Documents *</label>
                        <p className="text-xs text-gray-500 mb-3">Please upload a Trade License, TIN, or Visiting Card as proof of ownership.</p>

                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                required
                                className="block w-full text-sm text-slate-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100"
                                onChange={handleFileChange}
                            />
                        </div>
                        {previewUrl && (
                            <div className="mt-2 p-2 border rounded bg-slate-50 inline-block">
                                <span className="text-xs text-green-600 font-bold">✓ Document Selected</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || plans.length === 0}
                        className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-6"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Hotel & Start Free Trial"}
                    </button>
                </form>
            </div>
        </div>
    );
}
