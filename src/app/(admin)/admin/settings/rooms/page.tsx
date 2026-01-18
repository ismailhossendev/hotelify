
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

export default function RoomSettingsPage() {
    const [types, setTypes] = useState<string[]>([]);
    const [newType, setNewType] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/config/room-types')
            .then(res => res.json())
            .then(data => {
                if (data.success) setTypes(data.types);
                setLoading(false);
            });
    }, []);

    const handleAdd = () => {
        if (!newType.trim()) return;
        if (types.includes(newType.trim())) {
            alert("Type already exists");
            return;
        }
        setTypes([...types, newType.trim()]);
        setNewType("");
    };

    const handleRemove = (type: string) => {
        setTypes(types.filter(t => t !== type));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ types })
            });
            if (res.ok) {
                alert("Settings Saved Successfully!");
            } else {
                alert("Failed to save");
            }
        } catch (e) {
            alert("Error saving");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Room Classifications</h1>
                <p className="text-gray-500">Manage the standard room categories available to vendors.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex gap-4 mb-6">
                    <input
                        className="flex-1 border rounded-lg px-4 py-2"
                        placeholder="Add new classification (e.g. Presidential Suite)"
                        value={newType}
                        onChange={e => setNewType(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add
                    </button>
                </div>

                <div className="space-y-2">
                    {types.map((type) => (
                        <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                            <span className="font-medium text-gray-700">{type}</span>
                            <button
                                onClick={() => handleRemove(type)}
                                className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {types.length === 0 && <div className="text-center text-gray-400 py-4">No types defined.</div>}
                </div>

                <div className="mt-8 pt-4 border-t flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
