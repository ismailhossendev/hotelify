"use client";

import { useState, useEffect } from "react";
import { Plus, Settings, BedDouble, Trash2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function RoomManagementPage() {
    const [units, setUnits] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]); // Room Types
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'types' | 'units'>('types');
    const [showAddUnit, setShowAddUnit] = useState(false);
    const [preselectedTypeForAdd, setPreselectedTypeForAdd] = useState("");

    // Add Unit Form
    const [newUnitNos, setNewUnitNos] = useState(""); // "101, 102"
    const [selectedType, setSelectedType] = useState("");

    useEffect(() => {
        Promise.all([
            fetch('/api/room-units').then(res => res.json()),
            fetch('/api/rooms').then(res => res.json())
        ]).then(([unitsData, typesData]) => {
            if (unitsData.success) setUnits(unitsData.units);
            if (typesData.success) {
                setTypes(typesData.rooms);
                if (typesData.rooms.length > 0) setSelectedType(typesData.rooms[0]._id);
            }
            setLoading(false);
        });
    }, []);

    const handleAddUnits = async () => {
        if (!newUnitNos || !selectedType) return;

        await fetch('/api/room-units', {
            method: 'POST',
            body: JSON.stringify({
                hotelId: '677f50a0058e519c2a66e4a3', // Fallback ID
                roomNos: newUnitNos,
                roomTypeId: selectedType
            })
        });

        window.location.reload();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Room Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('units')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'units' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
                    >
                        Room Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('types')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'types' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
                    >
                        Room Types
                    </button>
                </div>
            </div>

            {activeTab === 'units' && (
                <div className="space-y-4">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => { setPreselectedTypeForAdd(""); setShowAddUnit(true); }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 shadow-sm"
                        >
                            <Plus className="h-4 w-4" /> Add Room Numbers
                        </button>
                    </div>

                    {showAddUnit && (
                        <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm animate-in slide-in-from-top-2">
                            <h3 className="font-bold mb-4">Add Physical Rooms</h3>
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Room Type</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={selectedType || preselectedTypeForAdd}
                                        onChange={e => setSelectedType(e.target.value)}
                                    >
                                        <option value="" disabled>Select Type</option>
                                        {types.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Room Numbers (Comma Separated)</label>
                                    <input
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="e.g. 101, 102, 105"
                                        value={newUnitNos}
                                        onChange={e => setNewUnitNos(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowAddUnit(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleAddUnits} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Save Rooms</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-8">
                        {types.map(type => {
                            const typeUnits = units.filter(u => u.roomTypeId?._id === type._id || u.roomTypeId === type._id);

                            return (
                                <div key={type._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800">{type.name} <span className="text-gray-500 font-normal text-sm">({typeUnits.length} units)</span></h3>
                                    </div>
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 border-b text-xs uppercase">
                                            <tr>
                                                <th className="px-6 py-3 font-bold text-gray-500">Room No</th>
                                                <th className="px-6 py-3 font-bold text-gray-500">Floor</th>
                                                <th className="px-6 py-3 font-bold text-gray-500">Status</th>
                                                <th className="px-6 py-3 font-bold text-gray-500 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {typeUnits.length > 0 ? (
                                                typeUnits.map((unit) => (
                                                    <tr key={unit._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-3">
                                                            <span className="font-bold text-gray-800">{unit.roomNo}</span>
                                                        </td>
                                                        <td className="px-6 py-3 text-gray-600">{unit.floor || '1st'}</td>
                                                        <td className="px-6 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${unit.status === 'clean' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                {unit.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            <button className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">No inventory added for this category.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'types' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <div>
                            <h3 className="text-xl font-bold text-blue-900">Room Strategy</h3>
                            <p className="text-blue-700 mt-1">Define your room categories, set prices, and manage inventory.</p>
                        </div>
                        <Link href="/rooms/new" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-transform hover:scale-105">
                            <Plus className="h-5 w-5" /> New Room Category
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {types.map(type => {
                            const unitCount = units.filter(u => u.roomTypeId?._id === type._id || u.roomTypeId === type._id).length;
                            const mainImage = type.images?.[0]?.url || "https://placehold.co/600x400?text=No+Image"; // Fallback

                            return (
                                <div key={type._id} className="bg-white group hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                                        <img src={mainImage} alt={type.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                            {unitCount} Units
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="font-bold text-xl mb-1 text-gray-900">{type.name}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2">{type.description || "No description provided."}</p>
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            <div className="flex justify-between items-end border-b pb-4 border-dashed">
                                                <div>
                                                    <div className="text-xs text-gray-400 uppercase font-bold">Base Price</div>
                                                    <div className="text-2xl font-bold text-blue-600">৳{type.basePrice}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-400 uppercase font-bold">Capacity</div>
                                                    <div className="text-sm font-medium">{type.capacity?.adults || 2} Adults</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Link
                                                    href={`/rooms/${type._id}/pricing`}
                                                    className="flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-bold text-sm transition-colors"
                                                >
                                                    <Settings className="h-4 w-4" /> Pricing
                                                </Link>
                                                <Link
                                                    href={`/rooms/${type._id}/edit`}
                                                    className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-bold text-sm transition-colors"
                                                >
                                                    Edit Details
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setPreselectedTypeForAdd(type._id);
                                                        setSelectedType(type._id);
                                                        setActiveTab('units');
                                                        setShowAddUnit(true);
                                                    }}
                                                    className="col-span-2 flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-green-500 hover:text-green-600 font-medium text-sm transition-colors"
                                                >
                                                    <Plus className="h-4 w-4" /> Add Inventory
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
