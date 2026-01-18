"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, MapPin, Loader2, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import ImageUploader from "@/components/ImageUploader";

interface Destination {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;
    isFeatured: boolean;
    order: number;
}

export default function AdminDestinationsPage() {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Destination | null>(null);

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        image: "",
        order: 0,
        isActive: true,
        isFeatured: false
    });

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            const res = await fetch("/api/admin/destinations");
            const data = await res.json();
            setDestinations(data.destinations || []);
        } catch (error) {
            toast.error("Failed to load destinations");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editing
            ? `/api/admin/destinations/${editing._id}`
            : "/api/admin/destinations";

        const method = editing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error("Operation failed");

            toast.success(editing ? "Updated!" : "Created!");
            setShowModal(false);
            setEditing(null);
            setForm({ name: "", slug: "", description: "", image: "", order: 0, isActive: true, isFeatured: false });
            fetchDestinations();
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/admin/destinations/${id}`, { method: "DELETE" });
            toast.success("Deleted");
            fetchDestinations();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
                    <p className="text-gray-500">Manage locations for hotels (e.g. Cox's Bazar, Sylhet)</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm({ name: "", slug: "", description: "", image: "", order: 0, isActive: true, isFeatured: false }); setShowModal(true); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={20} /> Add Destination
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {destinations.map(dest => (
                        <div key={dest._id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg relative">
                                    <MapPin size={24} />
                                    {dest.isFeatured && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full p-0.5">
                                            <Star size={10} fill="currentColor" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditing(dest);
                                            setForm({
                                                name: dest.name,
                                                slug: dest.slug,
                                                description: dest.description,
                                                image: dest.image || "",
                                                order: dest.order,
                                                isActive: dest.isActive,
                                                isFeatured: dest.isFeatured || false
                                            });
                                            setShowModal(true);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dest._id)}
                                        className="p-2 hover:bg-red-50 rounded-full text-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{dest.name}</h3>
                            <p className="text-xs text-mono text-gray-400 mb-3">/{dest.slug}</p>
                            <p className="text-gray-500 text-sm line-clamp-2">{dest.description || "No description provided."}</p>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <div className="flex gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${dest.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {dest.isActive ? "Active" : "Hidden"}
                                    </span>
                                    {dest.isFeatured && (
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                            <Star size={10} fill="currentColor" /> Featured
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400">Order: {dest.order}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{editing ? "Edit Destination" : "New Destination"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
                                <input
                                    required
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Slug (Optional)</label>
                                <input
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={form.slug}
                                    onChange={e => setForm({ ...form, slug: e.target.value })}
                                    placeholder="Leave empty to auto-generate"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Destination Image</label>
                                <div className="bg-gray-800 p-2 rounded-lg border border-gray-600">
                                    <ImageUploader
                                        images={form.image ? [form.image] : []}
                                        onChange={(imgs) => setForm({ ...form, image: imgs[0] || "" })}
                                        maxImages={1}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                                <textarea
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Sort Order</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={form.order}
                                        onChange={e => setForm({ ...form, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                                        checked={form.isActive}
                                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="active" className="text-sm text-gray-300">Active</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
                                        checked={form.isFeatured}
                                        onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                                    />
                                    <label htmlFor="featured" className="text-sm text-gray-300 flex items-center gap-1">
                                        Featured <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />
                                    </label>
                                </div>
                            </div>


                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-gray-300">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
