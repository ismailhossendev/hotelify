"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { Printer, CheckCircle, XCircle, ArrowLeft, Loader2, Save } from "lucide-react";

export default function BookingDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [units, setUnits] = useState<any[]>([]);
    const [assigningUnit, setAssigningUnit] = useState(false);

    // Edit Form State
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        nid: "",
        address: "",
        nationality: "Bangladeshi",
        notes: "", // specialRequests
        additionalGuests: [] as any[]
    });

    useEffect(() => {
        fetch(`/api/bookings/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBooking(data.booking);
                    setFormData({
                        name: data.booking.guestDetails?.name || "",
                        phone: data.booking.guestDetails?.phone || "",
                        email: data.booking.guestDetails?.email || "",
                        nid: data.booking.guestDetails?.nid || "",
                        address: data.booking.guestDetails?.address || "",
                        nationality: data.booking.guestDetails?.nationality || "Bangladeshi",
                        notes: data.booking.specialRequests || "",
                        additionalGuests: data.booking.additionalGuests || []
                    });

                    // Fetch units if booking loaded
                    fetch('/api/room-units').then(r => r.json()).then(u => {
                        if (u.success) {
                            if (data.booking.roomId) {
                                setUnits(u.units.filter((unit: any) => unit.roomTypeId === data.booking.roomId._id));
                            }
                        }
                    });
                }
                setLoading(false);
            })
            .catch(console.error);
    }, [params.id]);

    const handleAction = async (action: string) => {
        if (action !== 'update' && !confirm(`Are you sure you want to ${action.replace('_', ' ')}?`)) return;

        try {
            const body: any = { action };

            // If checking in or updating, include all details
            if (action === 'check_in' || action === 'update') {
                body.guestDetails = {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    nid: formData.nid,
                    address: formData.address,
                    nationality: formData.nationality
                };
                body.specialRequests = formData.notes;
                body.additionalGuests = formData.additionalGuests;
            }

            const res = await fetch(`/api/bookings/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setBooking(data.booking);
                setFormData({
                    name: data.booking.guestDetails?.name || "",
                    phone: data.booking.guestDetails?.phone || "",
                    email: data.booking.guestDetails?.email || "",
                    nid: data.booking.guestDetails?.nid || "",
                    address: data.booking.guestDetails?.address || "",
                    nationality: data.booking.guestDetails?.nationality || "Bangladeshi",
                    notes: data.booking.specialRequests || "",
                    additionalGuests: data.booking.additionalGuests || []
                });
                setEditMode(false);
                if (action === 'update') alert("Booking details updated successfully");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update booking");
        }
    };

    const handleUnitAssign = async (unitId: string) => {
        if (!confirm('Assign/Change room to this unit?')) return;
        try {
            const res = await fetch(`/api/bookings/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomUnitId: unitId })
            });
            const data = await res.json();
            if (data.success) {
                setBooking((prev: any) => ({ ...prev, roomUnitId: data.booking.roomUnitId }));
                setAssigningUnit(false);
                alert('Room assigned successfully');
            } else {
                alert(data.error || 'Failed to assign room');
            }
        } catch (e) { alert('Error assigning room'); }
    };

    const addGuest = () => {
        setFormData({ ...formData, additionalGuests: [...formData.additionalGuests, { name: "", age: "", nid: "" }] });
    };

    const removeGuest = (idx: number) => {
        setFormData({ ...formData, additionalGuests: formData.additionalGuests.filter((_, i) => i !== idx) });
    };

    const updateGuest = (idx: number, field: string, value: string) => {
        const newGuests = [...formData.additionalGuests];
        newGuests[idx] = { ...newGuests[idx], [field]: value };
        setFormData({ ...formData, additionalGuests: newGuests });
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;
    if (!booking) return <div>Booking not found</div>;

    const documents = booking.guestDetails?.documents || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4 print:hidden">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold">Booking Details</h1>
                <div className="ml-auto flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        <Printer className="h-4 w-4" /> Print
                    </button>

                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${editMode ? 'bg-gray-100 border-gray-300' : 'hover:bg-gray-50'}`}
                    >
                        {editMode ? "Cancel Edit" : "Edit Details"}
                    </button>

                    {booking.status === 'pending' || booking.status === 'confirmed' ? (
                        <button
                            onClick={() => editMode ? handleAction('check_in') : setEditMode(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <CheckCircle className="h-4 w-4" /> {editMode ? 'Confirm Check In' : 'Check In'}
                        </button>
                    ) : null}

                    {booking.status === 'checked_in' && (
                        <button
                            onClick={() => handleAction('check_out')}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                        >
                            <XCircle className="h-4 w-4" /> Check Out
                        </button>
                    )}
                </div>
            </div>

            {/* Print Area / Main Card */}
            <div className="bg-white rounded-xl shadow-sm border p-8 print:shadow-none print:border-0 print:p-0">

                {/* Header for Print */}
                <div className="border-b pb-6 mb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Hotelify Resort</h2>
                        <p className="text-gray-500 mt-1">123 Beach Road, Cox's Bazar</p>
                        <p className="text-gray-500">Phone: +880 1234 567890</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 uppercase tracking-wide">Booking No</div>
                        <div className="text-2xl font-mono font-bold">{booking.bookingNumber}</div>
                        <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase
                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'checked_in' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                            {booking.status.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Guest Information</h3>

                        {editMode ? (
                            <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200 print:hidden">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                        <input
                                            className="w-full p-2 border rounded text-sm mt-1"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                        <input
                                            className="w-full p-2 border rounded text-sm mt-1"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                        <input
                                            className="w-full p-2 border rounded text-sm mt-1"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">NID / Passport</label>
                                        <input
                                            className="w-full p-2 border rounded text-sm mt-1"
                                            value={formData.nid}
                                            onChange={e => setFormData({ ...formData, nid: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Nationality</label>
                                        <input
                                            className="w-full p-2 border rounded text-sm mt-1"
                                            value={formData.nationality}
                                            onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                                        <input
                                            className="w-full p-2 border rounded text-sm mt-1"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Additional Guests Edit */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Additional Guests</label>
                                    {formData.additionalGuests.map((guest, idx) => (
                                        <div key={idx} className="flex gap-2 mb-2">
                                            <input placeholder="Name" className="w-[40%] p-2 border rounded text-sm" value={guest.name} onChange={e => updateGuest(idx, 'name', e.target.value)} />
                                            <input placeholder="Age" className="w-[20%] p-2 border rounded text-sm" value={guest.age} onChange={e => updateGuest(idx, 'age', e.target.value)} />
                                            <input placeholder="NID" className="w-[30%] p-2 border rounded text-sm" value={guest.nid} onChange={e => updateGuest(idx, 'nid', e.target.value)} />
                                            <button onClick={() => removeGuest(idx)} className="text-red-500"><XCircle size={16} /></button>
                                        </div>
                                    ))}
                                    <button onClick={addGuest} className="text-xs text-blue-600 font-bold hover:underline">+ Add Guest</button>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Special Requests / Notes</label>
                                    <textarea
                                        className="w-full p-2 border rounded text-sm mt-1 h-20"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={() => handleAction('update')}
                                    className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold hover:bg-stone-800 flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="font-bold text-xl text-gray-900">{booking.guestDetails.name}</p>
                                    <p className="text-gray-600">{booking.guestDetails.phone}</p>
                                    <p className="text-gray-600">{booking.guestDetails.email}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <div className="text-gray-500">Address:</div>
                                    <div>{booking.guestDetails.address || "-"}</div>
                                    <div className="text-gray-500">NID / Passport:</div>
                                    <div>{booking.guestDetails.nid || "-"}</div>
                                    <div className="text-gray-500">Nationality:</div>
                                    <div>{booking.guestDetails.nationality || "-"}</div>
                                </div>

                                {/* Documents / NID Image */}
                                {documents.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Attached Documents</p>
                                        <div className="flex gap-2">
                                            {documents.map((doc: any, i: number) => (
                                                <div key={i} className="relative group w-24 h-16 bg-gray-100 rounded border overflow-hidden cursor-pointer" onClick={() => window.open(doc.url, '_blank')}>
                                                    <img src={doc.url} alt="Doc" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Guests Display */}
                                {booking.additionalGuests && booking.additionalGuests.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Additional Guests ({booking.additionalGuests.length})</p>
                                        <ul className="text-sm space-y-1">
                                            {booking.additionalGuests.map((g: any, i: number) => (
                                                <li key={i} className="flex justify-between">
                                                    <span>{g.name} <span className="text-gray-400 text-xs">({g.age} yrs)</span></span>
                                                    <span className="text-gray-500 text-xs">{g.nid}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Special Requests Display */}
                                {booking.specialRequests && (
                                    <div className="mt-4 pt-4 border-t">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Special Requests</p>
                                        <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-100">
                                            {booking.specialRequests}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Print Only Fields for filling manually */}
                        <div className="hidden print:block mt-8 space-y-6 text-gray-400 text-sm">
                            {!booking.guestDetails.address && <div className="border-b border-gray-300 py-2">Address: __________________________________________________</div>}
                            {!booking.guestDetails.nid && <div className="border-b border-gray-300 py-2">ID No: ___________________________________________________</div>}
                            <div className="border-b border-gray-300 py-2 pt-8">Guest Signature: ________________________________________________</div>
                            <div className="border-b border-gray-300 py-2">Authorized Signature: ____________________________________________</div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Stay Information</h3>
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4 print:bg-transparent print:p-0 border print:border-0 border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Room Type</span>
                                <div className="text-right">
                                    <div className="font-bold">{booking.roomId?.name}</div>
                                    <div className="text-xs text-gray-500">{booking.roomId?.roomType}</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t pt-3">
                                <span className="text-gray-600">Check In</span>
                                <span className="font-bold">{format(new Date(booking.checkIn), 'dd MMM yyyy')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Check Out</span>
                                <span className="font-bold">{format(new Date(booking.checkOut), 'dd MMM yyyy')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Duration</span>
                                <span className="font-bold">{booking.nights} Nights</span>
                            </div>

                            <div className="flex justify-between items-center border-t border-dashed border-gray-300 pt-4 mt-2">
                                <span className="font-bold text-xl">Total Due</span>
                                <span className="font-bold text-xl text-blue-600 print:text-black">BDT {booking.pricing.totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Paid Amount</span>
                                <span className="font-bold text-green-600">BDT {booking.amountPaid?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Balance Due</span>
                                <span className="font-bold text-red-500">BDT {((booking.pricing.totalAmount || 0) - (booking.amountPaid || 0)).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-8 print:hidden">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Room Assignment</h3>
                            {booking.roomUnitId ? (
                                <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-green-600 font-bold uppercase">Assigned Unit</p>
                                        <p className="font-bold text-green-800">Room {booking.roomUnitId?.name || booking.roomUnitId}</p>
                                    </div>
                                    <button onClick={() => setAssigningUnit(true)} className="text-xs bg-white border border-green-200 px-3 py-1 rounded hover:bg-green-100">Change</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAssigningUnit(true)}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors bg-gray-50"
                                >
                                    + Assign Room Number
                                </button>
                            )}

                            {/* Unit Assignment Modal (Simplified inline) */}
                            {assigningUnit && (
                                <div className="mt-4 bg-white border rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-sm font-bold mb-3">Select a clean unit to assign:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {units.length > 0 ? units.map(u => (
                                            <button
                                                key={u._id}
                                                onClick={() => handleUnitAssign(u._id)}
                                                disabled={u.status !== 'clean'}
                                                className={`p-2 rounded text-xs border font-bold ${u.status === 'clean' ? 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                            >
                                                {u.name} ({u.status})
                                            </button>
                                        )) : <p className="col-span-3 text-xs text-gray-400">No units found for this room type.</p>}
                                    </div>
                                    <button onClick={() => setAssigningUnit(false)} className="mt-3 text-xs text-gray-500 hover:text-black">Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Print Footer */}
                <div className="hidden print:block fixed bottom-8 left-0 right-0 text-center text-gray-400 text-xs text-stone-900/50">
                    <p>Thank you for choosing Hotelify Resort.</p>
                    <p className="mt-1">Generated on {format(new Date(), "PPpp")}</p>
                </div>
            </div>
        </div>
    );
}
