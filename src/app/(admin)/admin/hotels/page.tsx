"use client";

import { useEffect, useState } from "react";
import { Building, Users, Eye, LogIn, Loader2, Search, MoreVertical, Coins, Power, Ban, X, ArrowUpCircle, Globe, Layout } from "lucide-react";

export default function AdminHotelsPage() {
    const [hotels, setHotels] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]); // Store plans for dropdown
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Top Up Modal State
    const [showTopUpModal, setShowTopUpModal] = useState(false);

    // Template Modal State
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [newTemplateId, setNewTemplateId] = useState("");

    // Plan Change Modal State
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [newPlanId, setNewPlanId] = useState("");

    // Domain Modal State
    const [showDomainModal, setShowDomainModal] = useState(false);

    // Verification Modal State
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    // Shared Selected Hotel
    const [selectedHotel, setSelectedHotel] = useState<any>(null);
    const [topUpData, setTopUpData] = useState({ amount: 0, type: 'credit', purpose: 'manual_topup' });

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchHotels(), fetchPlans(), fetchTemplates()]);
            setLoading(false);
        };
        fetchData();
    }, []);

    const fetchTemplates = async () => {
        const res = await fetch('/api/admin/templates');
        const data = await res.json();
        if (data.success) setTemplates(data.templates);
    };

    const fetchHotels = async () => {
        const res = await fetch('/api/admin/hotels');
        const data = await res.json();
        if (data.success) setHotels(data.hotels);
    };

    const fetchPlans = async () => {
        const res = await fetch('/api/plans');
        const data = await res.json();
        if (data.success) setPlans(data.plans);
    };

    const handleImpersonate = async (hotelId: string, ownerId: string) => {
        if (!confirm("Login as this hotel's owner? You will be redirected to their dashboard.")) return;
        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: ownerId, hotelId })
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = '/dashboard';
            } else {
                alert('Failed to impersonate: ' + data.error);
            }
        } catch (err) {
            alert('Error during impersonation');
        }
    };

    const handleStatusChange = async (hotelId: string, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this hotel?`)) return;
        try {
            const res = await fetch(`/api/admin/hotels/${hotelId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                fetchHotels();
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            alert('Error updating status');
        }
    };

    const openTopUpModal = (hotel: any) => {
        setSelectedHotel(hotel);
        setTopUpData({ amount: 0, type: 'credit', purpose: 'manual_topup' });
        setShowTopUpModal(true);
    };

    const handleTopUpSubmit = async () => {
        try {
            const res = await fetch(`/api/admin/hotels/${selectedHotel._id}/wallet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(topUpData)
            });
            const data = await res.json();
            if (data.success) {
                alert('Wallet updated successfully');
                setShowTopUpModal(false);
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (err) {
            alert('Error updating wallet');
        }
    };

    const openPlanModal = (hotel: any) => {
        setSelectedHotel(hotel);
        setNewPlanId(hotel.planId?._id || "");
        setShowPlanModal(true);
    };

    const handlePlanChange = async () => {
        if (!newPlanId) return alert('Select a plan');
        if (!confirm(`Change plan for ${selectedHotel.name}? This will affect their features immediately.`)) return;
        try {
            const res = await fetch(`/api/admin/hotels/${selectedHotel._id}/plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: newPlanId })
            });
            const data = await res.json();
            if (data.success) {
                alert('Plan updated successfully');
                setShowPlanModal(false);
                fetchHotels();
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (err) {
            alert('Error updating plan');
        }
    };

    const openDomainModal = (hotel: any) => {
        setSelectedHotel(hotel);
        setShowDomainModal(true);
    };

    const handleDomainUpdate = async (verified: boolean, ssl: boolean) => {
        try {
            const res = await fetch(`/api/admin/hotels/${selectedHotel._id}/domain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verified, ssl })
            });
            const data = await res.json();
            if (data.success) {
                alert('Domain status updated');
                fetchHotels();
                setShowDomainModal(false);
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (err) {
            alert('Error updating domain');
        }
    };

    const openVerifyModal = (hotel: any) => {
        setSelectedHotel(hotel);
        setShowVerifyModal(true);
    };

    const handleVerificationAction = async (action: 'verify_documents' | 'reject') => {
        if (!confirm(action === 'reject' ? 'Reject this hotel registration?' : 'Approve documents and activate hotel?')) return;
        try {
            const res = await fetch(`/api/admin/hotels/${selectedHotel._id}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.message) {
                alert('Success: ' + data.message);
                fetchHotels();
                setShowVerifyModal(false);
            } else {
                alert('Failed');
            }
        } catch (err) {
            alert('Error during verification');
        }
    };

    const openTemplateModal = (hotel: any) => {
        setSelectedHotel(hotel);
        setNewTemplateId(hotel.templateId?._id || "");
        setShowTemplateModal(true);
    };

    const handleTemplateChange = async () => {
        if (!newTemplateId) return alert('Select a template');
        if (!confirm(`Assign this template to ${selectedHotel.name}?`)) return;

        try {
            const res = await fetch(`/api/admin/hotels/${selectedHotel._id}/template`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: newTemplateId })
            });
            const data = await res.json();
            if (data.success) {
                alert('Template assigned successfully');
                setShowTemplateModal(false);
                fetchHotels();
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (err) {
            alert('Error assigning template');
        }
    };

    // ... existing functions ...

    // Filter logic
    const filteredHotels = hotels.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        (h.contact?.address?.city || "").toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Hotels Management</h1>
                    <p className="text-gray-400">Manage all registered hotels on the platform</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        className="bg-transparent border-none outline-none text-white placeholder-gray-500 w-48"
                        placeholder="Search hotels..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Hotel</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Domain</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Plan</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Template</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredHotels.map(hotel => (
                            <tr key={hotel._id} className="hover:bg-gray-750">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-700 flex items-center justify-center">
                                            <Building className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{hotel.name}</div>
                                            <div className="text-sm text-gray-400">{hotel.contact?.address?.city || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-gray-300 text-sm">
                                            {hotel.domain?.subdomain ? `${hotel.domain.subdomain}.hotelify.com` : '-'}
                                        </span>
                                        {hotel.domain?.customDomain && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <Globe className="h-3 w-3 text-purple-400" />
                                                <span className={`text-xs ${hotel.domain.customDomainVerified ? 'text-green-400' : 'text-yellow-500'}`}>
                                                    {hotel.domain.customDomain}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-900 text-purple-300">
                                        {hotel.planId?.name || 'Free'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${hotel.templateId ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'}`}>
                                        {hotel.templateId?.name || 'Default'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${hotel.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                                        hotel.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                        }`}>
                                        {hotel.status === 'pending' ? 'Pending Approval' : (hotel.isActive ? 'Active' : 'Inactive')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                                            title="View Public Page"
                                            onClick={() => window.open(`/hotel/${hotel.slug}`, '_blank')}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleImpersonate(hotel._id, hotel.ownerId)}
                                            className="p-2 hover:bg-purple-900 rounded-lg text-purple-400 hover:text-purple-300"
                                            title="Login as Owner"
                                        >
                                            <LogIn className="h-4 w-4" />
                                        </button>
                                        {hotel.status === 'pending' && (
                                            <button
                                                onClick={() => openVerifyModal(hotel)}
                                                className="p-2 hover:bg-orange-900 rounded-lg text-orange-400 hover:text-orange-300 animate-pulse"
                                                title="Verify Documents"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openTemplateModal(hotel)}
                                            className="p-2 hover:bg-cyan-900 rounded-lg text-cyan-400 hover:text-cyan-300"
                                            title="Assign Template"
                                        >
                                            <Layout className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => openDomainModal(hotel)}
                                            className="p-2 hover:bg-indigo-900 rounded-lg text-indigo-400 hover:text-indigo-300"
                                            title="Domain Settings"
                                        >
                                            <Globe className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => openTopUpModal(hotel)}
                                            className="p-2 hover:bg-blue-900 rounded-lg text-blue-400 hover:text-blue-300"
                                            title="Manual Wallet Top-up"
                                        >
                                            <Coins className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => openPlanModal(hotel)}
                                            className="p-2 hover:bg-yellow-900 rounded-lg text-yellow-400 hover:text-yellow-300"
                                            title="Change Plan"
                                        >
                                            <ArrowUpCircle className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(hotel._id, hotel.isActive)}
                                            className={`p-2 rounded-lg ${hotel.isActive ? 'hover:bg-red-900 text-red-400 hover:text-red-300' : 'hover:bg-green-900 text-green-400 hover:text-green-300'}`}
                                            title={hotel.isActive ? "Suspend Hotel" : "Activate Hotel"}
                                        >
                                            {hotel.isActive ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Template Assignment Modal */}
            {showTemplateModal && selectedHotel && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Layout className="h-6 w-6 text-cyan-500" /> Assign Template
                            </h2>
                            <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-300">
                                Selecting a template for <strong>{selectedHotel.name}</strong>.
                            </p>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Available Templates</label>
                                <select
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
                                    value={newTemplateId}
                                    onChange={e => setNewTemplateId(e.target.value)}
                                >
                                    <option value="">Select Template...</option>
                                    {templates.map(t => (
                                        <option key={t._id} value={t._id}>
                                            {t.name} ({t.category})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleTemplateChange}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition-colors mt-2"
                            >
                                Assign Template
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ... other modals (TopUp, Plan, Domain) ... */}

            {/* Top Up Modal */}
            {showTopUpModal && selectedHotel && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Manual Wallet Adjustment</h2>
                            <button onClick={() => setShowTopUpModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Hotel</label>
                                <input disabled value={selectedHotel.name} className="w-full bg-gray-700 rounded-lg px-4 py-2 text-gray-300" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setTopUpData({ ...topUpData, type: 'credit' })}
                                    className={`p-3 rounded-lg border text-center ${topUpData.type === 'credit' ? 'bg-green-900/30 border-green-500 text-white' : 'border-gray-600 text-gray-400'}`}
                                >
                                    Credit (+)
                                </button>
                                <button
                                    onClick={() => setTopUpData({ ...topUpData, type: 'debit' })}
                                    className={`p-3 rounded-lg border text-center ${topUpData.type === 'debit' ? 'bg-red-900/30 border-red-500 text-white' : 'border-gray-600 text-gray-400'}`}
                                >
                                    Debit (-)
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Amount (BDT)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                                    value={topUpData.amount}
                                    onChange={e => setTopUpData({ ...topUpData, amount: Number(e.target.value) })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Reason / Note</label>
                                <input
                                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                                    value={topUpData.purpose}
                                    onChange={e => setTopUpData({ ...topUpData, purpose: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={handleTopUpSubmit}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors mt-2"
                            >
                                Confirm Transaction
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Plan Modal */}
            {showPlanModal && selectedHotel && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ArrowUpCircle className="h-6 w-6 text-yellow-500" /> Change Plan
                            </h2>
                            <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-300">
                                Updating plan for <strong>{selectedHotel.name}</strong>.
                            </p>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">New Subscription Plan</label>
                                <select
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
                                    value={newPlanId}
                                    onChange={e => setNewPlanId(e.target.value)}
                                >
                                    <option value="">Select Plan...</option>
                                    {plans.map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.name} - BDT {p.pricing.monthly}/mo
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handlePlanChange}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl transition-colors mt-2"
                            >
                                Update Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Domain Modal */}
            {showDomainModal && selectedHotel && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Globe className="h-6 w-6 text-indigo-500" /> Domain Manager
                            </h2>
                            <button onClick={() => setShowDomainModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        {/* Wrapper end for domain modal */}
                    </div>
                </div>
            )}
            {/* Verify Modal */}
            {showVerifyModal && selectedHotel && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Eye className="h-6 w-6 text-orange-500" /> Verify Registration
                            </h2>
                            <button onClick={() => setShowVerifyModal(false)} className="text-gray-400 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-gray-400 text-sm font-bold mb-3 uppercase">Details</h3>
                                <div className="space-y-2 text-sm text-gray-300 bg-gray-900 p-4 rounded-lg">
                                    <p><span className="text-gray-500">Name:</span> {selectedHotel.name}</p>
                                    <p><span className="text-gray-500">Email:</span> {selectedHotel.contact?.email}</p>
                                    <p><span className="text-gray-500">Phone:</span> {selectedHotel.contact?.phone}</p>
                                    <p><span className="text-gray-500">Location:</span> {selectedHotel.destinationId?.name || "N/A"}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-gray-400 text-sm font-bold mb-3 uppercase">Documents</h3>
                                <div className="space-y-2">
                                    {selectedHotel.documents?.length > 0 ? selectedHotel.documents.map((doc: any, i: number) => (
                                        <div key={i} className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                                            <span className="text-sm font-mono truncate max-w-[150px]">{doc.type}</span>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 text-xs hover:underline flex items-center gap-1"
                                            >
                                                View <Eye className="w-3 h-3" />
                                            </a>
                                        </div>
                                    )) : (
                                        <div className="text-gray-500 text-sm italic">No documents uploaded.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-700">
                            <button
                                onClick={() => handleVerificationAction('reject')}
                                className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-200 font-bold py-3 rounded-xl transition-colors border border-red-800"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleVerificationAction('verify_documents')}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-900/20"
                            >
                                Approve & Activate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
