
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

interface RoomTypeFormProps {
    initialData?: any;
    mode: 'create' | 'edit';
}

export default function RoomTypeForm({ initialData, mode }: RoomTypeFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        roomType: initialData?.roomType || "double",
        description: initialData?.description || "",
        basePrice: initialData?.basePrice || 0,
        capacity: {
            adults: initialData?.capacity?.adults || 2,
            children: initialData?.capacity?.children || 0
        },
        amenities: initialData?.amenities?.join(', ') || "Wifi, TV, AC",
        images: initialData?.images?.map((i: any) => i.url) || []
    });

    useEffect(() => {
        fetch('/api/config/room-types')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAvailableTypes(data.types);
                    // If creating new and we have types, select first one by default
                    if (mode === 'create' && data.types.length > 0) {
                        setFormData(prev => ({ ...prev, roomType: data.types[0].toLowerCase() }));
                    }
                }
            });
    }, [mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            hotelId: initialData?.hotelId || '677f50a0058e519c2a66e4a3',
            amenities: formData.amenities.split(',').map((s: string) => s.trim()).filter(Boolean),
            images: formData.images.map((url: string) => ({ url, caption: 'Room Image' }))
        };

        const url = mode === 'create' ? '/api/rooms' : `/api/rooms/${initialData._id}`;
        const method = mode === 'create' ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/rooms');
                router.refresh();
            } else {
                alert('Error saving room: ' + (await res.text()));
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?._id) return;
        if (!confirm("Are you sure you want to delete this Room Type? This action cannot be undone.")) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/rooms/${initialData._id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/rooms');
                router.refresh();
            } else {
                alert('Failed to delete room');
            }
        } catch (error) {
            alert('Error deleting room');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-xl font-bold">{mode === 'create' ? 'Add New Room Category' : 'Edit Room Category'}</h2>
                {mode === 'edit' && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg flex items-center gap-2 text-sm font-bold"
                    >
                        {deleting ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        Delete Room Type
                    </button>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category Name</label>
                    <input
                        required
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="e.g. Deluxe Sea View"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Room Type</label>
                    <select
                        className="w-full border rounded-lg px-4 py-2 capitalize"
                        value={formData.roomType}
                        onChange={e => setFormData({ ...formData, roomType: e.target.value })}
                    >
                        {availableTypes.length > 0 ? (
                            availableTypes.map(type => (
                                <option key={type} value={type.toLowerCase()}>{type}</option>
                            ))
                        ) : (
                            <>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                            </>
                        )}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Base Price (Per Night)</label>
                    <input
                        type="number" required min="0"
                        className="w-full border rounded-lg px-4 py-2 font-mono"
                        value={formData.basePrice}
                        onChange={e => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea
                        className="w-full border rounded-lg px-4 py-2 h-24"
                        placeholder="Describe the room view, decor, etc."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Adult Capacity</label>
                    <input
                        type="number" min="1"
                        className="w-full border rounded-lg px-4 py-2"
                        value={formData.capacity.adults}
                        onChange={e => setFormData({ ...formData, capacity: { ...formData.capacity, adults: parseInt(e.target.value) } })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Children Capacity</label>
                    <input
                        type="number" min="0"
                        className="w-full border rounded-lg px-4 py-2"
                        value={formData.capacity.children}
                        onChange={e => setFormData({ ...formData, capacity: { ...formData.capacity, children: parseInt(e.target.value) } })}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Amenities (Comma Separated)</label>
                    <input
                        className="w-full border rounded-lg px-4 py-2"
                        placeholder="Wifi, AC, Geyser, Balcony"
                        value={formData.amenities}
                        onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Images</label>
                    <ImageUploader
                        images={formData.images}
                        onChange={(newImages) => setFormData({ ...formData, images: newImages })}
                        maxImages={5}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mode === 'create' ? 'Create Room Type' : 'Update Room Type'}
                </button>
            </div>
        </form>
    );
}
