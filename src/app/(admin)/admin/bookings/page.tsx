"use client";

import { useState, useEffect } from 'react';
import { Search, Calendar, Filter, Download, Eye, FileText, CheckCircle, XCircle, Clock, Upload } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hotels, setHotels] = useState<any[]>([]);

    // Filters
    const [activeTab, setActiveTab] = useState<'all' | 'online'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHotel, setSelectedHotel] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');

    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Form State for Editing
    const [editStatus, setEditStatus] = useState('');
    const [editPaymentStatus, setEditPaymentStatus] = useState('');

    // Guest Edit State
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editNid, setEditNid] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editDocuments, setEditDocuments] = useState<any[]>([]);
    const [editAdditionalGuests, setEditAdditionalGuests] = useState<any[]>([]);
    const [editDiscount, setEditDiscount] = useState<number>(0);

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [activeTab, selectedHotel, selectedDate, selectedStatus]);

    const fetchHotels = async () => {
        try {
            const res = await fetch('/api/search?limit=100');
            const hData = await res.json();
            if (hData.success) setHotels(hData.hotels);
        } catch (e) {
            console.error("Failed to load hotels", e);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeTab === 'online') params.append('type', 'online');
            if (selectedHotel !== 'all') params.append('hotelId', selectedHotel);
            if (selectedDate) params.append('date', selectedDate);
            if (searchTerm) params.append('search', searchTerm);
            if (selectedStatus !== 'all') params.append('status', selectedStatus);

            const res = await fetch(`/api/admin/bookings?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
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

        // Calculate new total
        const currentSubtotal = selectedBooking.pricing?.subtotal || 0;
        const currentTaxes = selectedBooking.pricing?.taxes || 0;
        const newTotal = currentSubtotal + currentTaxes - editDiscount;

        try {
            const res = await fetch(`/api/admin/bookings/${selectedBooking._id}`, {
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
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                handleDocumentChange(index, 'url', data.url);
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Upload error');
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchBookings();
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'confirmed': 'bg-green-100 text-green-700 border-green-200',
            'checked_in': 'bg-blue-100 text-blue-700 border-blue-200',
            'checked_out': 'bg-gray-100 text-gray-700 border-gray-200',
            'cancelled': 'bg-red-100 text-red-700 border-red-200',
            'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const getSourceIcon = (type: string) => {
        if (type === 'online') return <span className="text-blue-500 font-bold text-xs flex items-center gap-1">🌐 Web</span>;
        if (type === 'offline') return <span className="text-gray-500 font-bold text-xs flex items-center gap-1">🏢 Desk</span>;
        return type;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Booking Management</h1>
                    <p className="text-gray-400">View and manage all reservations</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 border border-gray-700 transition">
                        <Download className="h-4 w-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Submenu Tabs */}
            <div className="border-b border-gray-700">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'all' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        All Bookings
                        {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('online')}
                        className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'online' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Book from Our Web
                        {activeTab === 'online' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search ID, Name, Phone, NID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    />
                </form>

                {/* Hotel Filter */}
                <select
                    value={selectedHotel}
                    onChange={(e) => setSelectedHotel(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Hotels</option>
                    {hotels.map((h: any) => (
                        <option key={h._id} value={h._id}>{h.name}</option>
                    ))}
                </select>

                {/* Date Filter */}
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
                />

                {/* Status Filter */}
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {/* Clear button if filters active */}
                {(selectedDate || searchTerm || selectedHotel !== 'all' || selectedStatus !== 'all') && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedHotel('all');
                            setSelectedDate('');
                            setSelectedStatus('all');
                            fetchBookings();
                        }}
                        className="text-gray-400 hover:text-white text-sm"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Bookings Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-sm">
                                <th className="p-4 font-medium">Booking Info</th>
                                <th className="p-4 font-medium">Guest</th>
                                <th className="p-4 font-medium">Hotel & Room</th>
                                <th className="p-4 font-medium">Dates</th>
                                <th className="p-4 font-medium">Payment</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 text-sm divide-y divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">Loading bookings...</td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">No bookings found matching filters.</td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-mono text-white font-bold text-xs bg-gray-900 px-2 py-1 rounded inline-block mb-1">
                                                #{booking.bookingNumber || booking._id.slice(-6).toUpperCase()}
                                            </div>
                                            <div className="mt-1">{getSourceIcon(booking.bookingType)}</div>
                                            <div className="text-xs text-gray-500 mt-1">{format(new Date(booking.createdAt), 'MMM dd, HH:mm')}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">{booking.guestDetails?.name}</div>
                                            <div className="text-xs text-gray-400">{booking.guestDetails?.phone}</div>
                                            {booking.guestDetails?.nid && (
                                                <div className="text-xs text-blue-400 mt-0.5">NID: {booking.guestDetails.nid}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-purple-300">{booking.hotelId?.name || "Unknown Hotel"}</div>
                                            <div className="text-xs text-gray-400">{booking.roomId?.name || "Standard Room"}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">{format(new Date(booking.checkIn), 'MMM dd')} - {format(new Date(booking.checkOut), 'MMM dd, yyyy')}</div>
                                            <div className="text-xs text-gray-500">{booking.nights} Night{booking.nights > 1 ? 's' : ''}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">৳{booking.pricing?.totalAmount?.toLocaleString()}</div>
                                            <div className="text-xs text-gray-400 capitalize">{booking.paymentStatus}</div>
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleViewBooking(booking)}
                                                className="p-2 hover:bg-gray-600 rounded-lg text-gray-400 hover:text-white transition"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Booking Details Modal / Side Drawer */}
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-2xl h-full bg-gray-900 border-l border-gray-700 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Booking Details</h2>
                                    <p className="text-sm text-gray-400">ID: {selectedBooking.bookingNumber || selectedBooking._id}</p>
                                </div>
                                <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Status Management */}
                            <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
                                <h3 className="text-lg font-bold text-white mb-4">Management</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Booking Status</label>
                                        <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="checked_in">Checked In</option>
                                            <option value="checked_out">Checked Out</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Payment Status</label>
                                        <select
                                            value={editPaymentStatus}
                                            onChange={(e) => setEditPaymentStatus(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white"
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
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Guest Information (Editable)</h3>
                                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Name</label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                                            <input
                                                type="text"
                                                value={editPhone}
                                                onChange={(e) => setEditPhone(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Email</label>
                                            <input
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">NID</label>
                                            <input
                                                type="text"
                                                value={editNid}
                                                onChange={(e) => setEditNid(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Address</label>
                                            <input
                                                type="text"
                                                value={editAddress}
                                                onChange={(e) => setEditAddress(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Guest Documents */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Documents</h3>
                                        <button
                                            onClick={handleAddDocument}
                                            className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-900 rounded px-2 py-1 transition-colors"
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
                                                    className="w-1/3 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none"
                                                    placeholder="Type"
                                                />
                                                <div className="flex-1 flex gap-1">
                                                    <input
                                                        type="text"
                                                        value={doc.url}
                                                        onChange={(e) => handleDocumentChange(idx, 'url', e.target.value)}
                                                        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 outline-none"
                                                        placeholder="URL or Upload"
                                                    />
                                                    <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white rounded px-2 flex items-center justify-center transition-colors" title="Upload File">
                                                        <Upload className="h-4 w-4" />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => handleUploadForIndex(idx, e)}
                                                        />
                                                    </label>
                                                    {doc.url && (
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-blue-400 rounded px-2 flex items-center justify-center transition-colors" title="View">
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveDocument(idx)}
                                                    className="text-gray-500 hover:text-red-400"
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
                                            className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-900 rounded px-2 py-1 transition-colors"
                                        >
                                            + Add Guest
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {editAdditionalGuests.map((guest, idx) => (
                                            <div key={idx} className="bg-gray-800 rounded-xl p-3 border border-gray-700 relative group">
                                                <button
                                                    onClick={() => handleRemoveGuest(idx)}
                                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                            className="w-full bg-gray-900/50 border-b border-gray-600 text-white text-sm py-1 focus:border-blue-500 outline-none"
                                                            placeholder="Guest Name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase">NID / ID</label>
                                                        <input
                                                            type="text"
                                                            value={guest.nid || ''}
                                                            onChange={(e) => handleGuestChange(idx, 'nid', e.target.value)}
                                                            className="w-full bg-gray-900/50 border-b border-gray-600 text-white text-sm py-1 focus:border-blue-500 outline-none"
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {editAdditionalGuests.length === 0 && (
                                            <div className="text-center py-4 bg-gray-800/50 rounded-lg border border-dashed border-gray-700 text-gray-500 text-xs">
                                                No additional guests added.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stay Details */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Stay Details</h3>
                                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Hotel</span>
                                            <span className="text-white font-medium">{selectedBooking.hotelId?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Room Type</span>
                                            <span className="text-white font-medium">{selectedBooking.roomId?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Check-in</span>
                                            <span className="text-white font-medium">{format(new Date(selectedBooking.checkIn), 'PP')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Check-out</span>
                                            <span className="text-white font-medium">{format(new Date(selectedBooking.checkOut), 'PP')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Nights</span>
                                            <span className="text-white font-medium">{selectedBooking.nights}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Payment Info</h3>
                                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Subtotal</span>
                                            <span className="text-white">৳{selectedBooking.pricing?.subtotal?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Discount</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-500 text-xs">৳</span>
                                                <input
                                                    type="number"
                                                    value={editDiscount}
                                                    onChange={(e) => setEditDiscount(Number(e.target.value))}
                                                    className="w-20 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white text-sm text-right focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-600 pt-2 flex justify-between font-bold text-lg">
                                            <span className="text-white">Total</span>
                                            <span className="text-blue-400">
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
        </div>
    );
}
