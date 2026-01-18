"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import CreateBookingModal from "./CreateBookingModal";
import BookingCalendar from "@/components/BookingCalendar";
import { List, Calendar as CalendarIcon, Loader2, XCircle, Eye, Upload, Download } from "lucide-react";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Editing State
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Form State for Editing
    const [editStatus, setEditStatus] = useState('');
    const [editPaymentStatus, setEditPaymentStatus] = useState('');
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editNid, setEditNid] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editDocuments, setEditDocuments] = useState<any[]>([]);
    const [editAdditionalGuests, setEditAdditionalGuests] = useState<any[]>([]);
    const [editDiscount, setEditDiscount] = useState<number>(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        Promise.all([
            fetch('/api/bookings').then(res => res.json()),
            fetch('/api/rooms').then(res => res.json()),
            fetch('/api/room-units').then(res => res.json())
        ]).then(([bookingsData, roomsData, unitsData]) => {
            if (bookingsData.success) setBookings(bookingsData.bookings);
            if (roomsData.success) setRooms(roomsData.rooms);
            if (unitsData.success) setUnits(unitsData.units);
            setLoading(false);
        });
    };

    const handleViewBooking = (booking: any) => {
        setSelectedBooking(booking);
        setEditStatus(booking.status);
        setEditPaymentStatus(booking.paymentStatus);
        setEditName(booking.guestDetails?.name || '');
        setEditPhone(booking.guestDetails?.phone || '');
        setEditEmail(booking.guestDetails?.email || '');
        setEditNid(booking.guestDetails?.nid || '');
        setEditAddress(booking.guestDetails?.address || '');
        setEditDocuments(booking.guestDetails?.documents || []);
        setEditAdditionalGuests(booking.additionalGuests || []);
        setEditDiscount(booking.pricing?.discount || 0);
    };

    const handleUpdateBooking = async () => {
        if (!selectedBooking) return;
        setUpdateLoading(true);

        const currentSubtotal = selectedBooking.pricing?.subtotal || 0;
        const currentTaxes = selectedBooking.pricing?.taxes || 0;
        const newTotal = currentSubtotal + currentTaxes - editDiscount;

        try {
            const res = await fetch(`/api/bookings/${selectedBooking._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: editStatus,
                    paymentStatus: editPaymentStatus,
                    guestDetails: {
                        name: editName,
                        phone: editPhone,
                        email: editEmail,
                        nid: editNid,
                        address: editAddress,
                        documents: editDocuments
                    },
                    additionalGuests: editAdditionalGuests,
                    pricing: {
                        discount: editDiscount,
                        totalAmount: newTotal
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                // Update local list
                setBookings(bookings.map(b => b._id === selectedBooking._id ? data.booking : b));
                setSelectedBooking(data.booking);
                alert('Booking updated successfully');
            } else {
                alert(data.error || 'Failed to update');
            }
        } catch (e) {
            alert('Error updating booking');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleAddGuest = () => {
        setEditAdditionalGuests([...editAdditionalGuests, { name: '', age: '', nid: '' }]);
    };

    const handleRemoveGuest = (index: number) => {
        const newGuests = [...editAdditionalGuests];
        newGuests.splice(index, 1);
        setEditAdditionalGuests(newGuests);
    };

    const handleGuestChange = (index: number, field: string, value: string) => {
        const newGuests = [...editAdditionalGuests];
        newGuests[index] = { ...newGuests[index], [field]: value };
        setEditAdditionalGuests(newGuests);
    };

    const handleAddDocument = () => {
        setEditDocuments([...editDocuments, { type: 'ID/Passport', url: '' }]);
    };

    const handleRemoveDocument = (index: number) => {
        const newDocs = [...editDocuments];
        newDocs.splice(index, 1);
        setEditDocuments(newDocs);
    };

    const handleDocumentChange = (index: number, field: string, value: string) => {
        const newDocs = [...editDocuments];
        newDocs[index] = { ...newDocs[index], [field]: value };
        setEditDocuments(newDocs);
    };

    const handleUploadForIndex = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                handleDocumentChange(index, 'url', data.url);
            } else {
                alert('Upload failed');
            }
        } catch {
            alert('Upload error');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Bookings</h1>
                    <p className="text-gray-500 text-sm">Manage guest reservations and occupancy</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-1 rounded-lg flex border border-gray-200">
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                            title="List View"
                        >
                            <List className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={`p-2 rounded-md transition-all ${view === 'calendar' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                            title="Calendar View"
                        >
                            <CalendarIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                    >
                        + New Booking
                    </button>
                </div>
            </div>

            {showCreateModal && (
                <CreateBookingModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => { setShowCreateModal(false); fetchData(); }}
                />
            )}

            {view === 'calendar' ? (
                <div className="animate-in fade-in duration-300">
                    <BookingCalendar bookings={bookings} rooms={rooms} units={units} />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-in fade-in duration-300">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="px-6 py-4">Booking ID</th>
                                <th className="px-6 py-4">Guest</th>
                                <th className="px-6 py-4">Room</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {bookings.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No bookings found</td></tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900">{booking.bookingNumber || booking._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{booking.guestDetails?.name || booking.guestId?.profile?.name}</div>
                                            <div className="text-xs text-gray-500">{booking.guestDetails?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="font-medium">{booking.roomId?.name}</div>
                                            {booking.roomUnitId ? (
                                                <div className="text-xs text-blue-600 font-bold mt-1">Room {booking.roomUnitId.roomNo}</div>
                                            ) : (
                                                <div className="text-xs text-orange-500 font-medium mt-1">Unassigned</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {format(new Date(booking.checkIn), 'MMM d')} - {format(new Date(booking.checkOut), 'MMM d')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            ৳{booking.pricing?.totalAmount || booking.totalAmount || 0}
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button
                                                onClick={() => handleViewBooking(booking)}
                                                className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                                            >
                                                <Eye className="h-4 w-4" /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Booking Details Drawer (Replicated from Admin) */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-2xl h-full bg-white shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                                <p className="text-sm text-gray-500">ID: {selectedBooking.bookingNumber || selectedBooking._id}</p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Status Management */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Management</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Booking Status</label>
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="checked_in">Checked In</option>
                                        <option value="checked_out">Checked Out</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Payment Status</label>
                                    <select
                                        value={editPaymentStatus}
                                        onChange={(e) => setEditPaymentStatus(e.target.value)}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleUpdateBooking}
                                    disabled={updateLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {updateLoading ? 'Saving...' : 'Update Booking'}
                                </button>
                            </div>
                        </div>

                        {/* Guest Details */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Guest Information</h3>
                                <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3 shadow-sm">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Name</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                                        <input
                                            type="text"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Email</label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">NID</label>
                                        <input
                                            type="text"
                                            value={editNid}
                                            onChange={(e) => setEditNid(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Address</label>
                                        <input
                                            type="text"
                                            value={editAddress}
                                            onChange={(e) => setEditAddress(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Documents</h3>
                                    <button
                                        onClick={handleAddDocument}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-blue-600 border border-gray-300 rounded px-2 py-1 transition-colors"
                                    >
                                        + Add Doc
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {editDocuments.map((doc, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={doc.type}
                                                onChange={(e) => handleDocumentChange(idx, 'type', e.target.value)}
                                                className="w-1/3 bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:border-blue-500 outline-none"
                                                placeholder="Type"
                                            />
                                            <div className="flex-1 flex gap-1">
                                                <input
                                                    type="text"
                                                    value={doc.url}
                                                    onChange={(e) => handleDocumentChange(idx, 'url', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm focus:border-blue-500 outline-none"
                                                    placeholder="URL or Upload"
                                                />
                                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded px-2 flex items-center justify-center transition-colors" title="Upload File">
                                                    <Upload className="h-4 w-4" />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => handleUploadForIndex(idx, e)}
                                                    />
                                                </label>
                                                {doc.url && (
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-blue-600 rounded px-2 flex items-center justify-center transition-colors" title="View">
                                                        <Eye className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveDocument(idx)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <XCircle className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                    {editDocuments.length === 0 && (
                                        <div className="text-xs text-gray-500 italic">No documents attached.</div>
                                    )}
                                </div>
                            </div>

                            {/* Additional Guests */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Additional Guests</h3>
                                    <button
                                        onClick={handleAddGuest}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 text-blue-600 border border-gray-300 rounded px-2 py-1 transition-colors"
                                    >
                                        + Add Guest
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {editAdditionalGuests.map((guest, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-200 relative group">
                                            <button
                                                onClick={() => handleRemoveGuest(idx)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove Guest"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-gray-500 uppercase">Name</label>
                                                    <input
                                                        type="text"
                                                        value={guest.name}
                                                        onChange={(e) => handleGuestChange(idx, 'name', e.target.value)}
                                                        className="w-full bg-white border-b border-gray-300 text-gray-900 text-sm py-1 focus:border-blue-500 outline-none"
                                                        placeholder="Guest Name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 uppercase">NID / ID</label>
                                                    <input
                                                        type="text"
                                                        value={guest.nid || ''}
                                                        onChange={(e) => handleGuestChange(idx, 'nid', e.target.value)}
                                                        className="w-full bg-white border-b border-gray-300 text-gray-900 text-sm py-1 focus:border-blue-500 outline-none"
                                                        placeholder="Optional"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {editAdditionalGuests.length === 0 && (
                                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-xs">
                                            No additional guests added.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Payment Info</h3>
                                <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2 shadow-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-900">৳{selectedBooking.pricing?.subtotal?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Discount</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500 text-xs">৳</span>
                                            <input
                                                type="number"
                                                value={editDiscount}
                                                onChange={(e) => setEditDiscount(Number(e.target.value))}
                                                className="w-20 bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-900 text-sm text-right focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-blue-600">
                                            ৳{((selectedBooking.pricing?.subtotal || 0) + (selectedBooking.pricing?.taxes || 0) - editDiscount).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        confirmed: 'bg-green-100 text-green-700 border border-green-200',
        pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        cancelled: 'bg-red-50 text-red-700 border border-red-200',
        checked_in: 'bg-blue-100 text-blue-700 border border-blue-200',
        checked_out: 'bg-gray-100 text-gray-700 border border-gray-200'
    };

    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100'}`}>
            {status?.replace('_', ' ')}
        </span>
    );
}
