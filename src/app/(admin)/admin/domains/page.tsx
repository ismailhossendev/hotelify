"use client";

import { useEffect, useState } from "react";
import { Loader2, Globe, Check, X, Search } from "lucide-react";

export default function AdminDomainsPage() {
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/admin/domains')
            .then(res => res.json())
            .then(data => {
                if (data.success) setRequests(data.requests);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Domain Management</h1>
                    <p className="text-gray-400">Manage custom domain requests and DNS verification</p>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Hotel</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Requested Domain</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">DNS Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Platform Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {requests.map(req => (
                            <tr key={req._id} className="hover:bg-gray-750">
                                <td className="px-6 py-4 font-medium text-white">{req.hotelName}</td>
                                <td className="px-6 py-4 text-gray-300">{req.domain}</td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${req.ipStatus === 'valid' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                        {req.ipStatus === 'valid' ? 'Points to Server' : 'Points Elsewhere'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded capitalized ${req.status === 'approved' ? 'bg-green-900 text-green-300' :
                                        req.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                                        }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {req.status === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 hover:bg-green-900 rounded-lg text-green-400 hover:text-green-300" title="Approve">
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 hover:bg-red-900 rounded-lg text-red-400 hover:text-red-300" title="Reject">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4">DNS Configuration Instructions</h3>
                <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-gray-300">
                    <div className="flex justify-between mb-2">
                        <span>Record Type</span>
                        <span>A Record</span>
                    </div>
                    <div className="flex justify-between mb-2">
                        <span>Host</span>
                        <span>@</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Value</span>
                        <span className="text-purple-400">123.45.67.89</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
