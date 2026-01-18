"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, X, Search, FileText } from "lucide-react";

export default function AdminWithdrawalsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = () => {
        fetch('/api/admin/withdrawals')
            .then(res => res.json())
            .then(data => {
                if (data.success) setRequests(data.requests);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            const res = await fetch(`/api/admin/withdrawals/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' })
            });
            const data = await res.json();
            if (data.success) {
                fetchRequests();
            } else {
                alert('Action failed');
            }
        } catch (err) {
            alert('Error processing request');
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
                    <p className="text-gray-400">Manage payout requests from hotels</p>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Hotel</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Method</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {requests.map(req => (
                            <tr key={req._id} className="hover:bg-gray-750">
                                <td className="px-6 py-4 font-medium text-white">{req.hotelId?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 font-bold text-white">BDT {req.amount}</td>
                                <td className="px-6 py-4 text-gray-300 capitalize">
                                    {req.bankDetails?.method || 'Bank'}
                                    <div className="text-xs text-gray-500">{req.bankDetails?.accountNumber}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${req.status === 'approved' ? 'bg-green-900 text-green-300' :
                                            req.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                                        }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400 text-sm">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    {req.status === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleAction(req._id, 'approve')}
                                                className="p-2 hover:bg-green-900 rounded-lg text-green-400 hover:text-green-300"
                                                title="Approve Payout"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleAction(req._id, 'reject')}
                                                className="p-2 hover:bg-red-900 rounded-lg text-red-400 hover:text-red-300"
                                                title="Reject Request"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                        <FileText className="h-12 w-12 opacity-20" />
                        No withdrawal requests found
                    </div>
                )}
            </div>
        </div>
    );
}
