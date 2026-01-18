"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, ArrowUpRight, ArrowDownLeft, FileText } from "lucide-react";

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/transactions')
            .then(res => res.json())
            .then(data => {
                if (data.success) setTransactions(data.transactions);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Financial Transactions</h1>
                    <p className="text-gray-400">Monitor all payments, commissions, and withdrawals</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        className="bg-transparent border-none outline-none text-white placeholder-gray-500 w-48"
                        placeholder="Search ID..."
                    />
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Hotel</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {transactions.map(tx => (
                            <tr key={tx._id} className="hover:bg-gray-750">
                                <td className="px-6 py-4 text-gray-300">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tx.type === 'credit' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                                            {tx.type === 'credit' ? <ArrowDownLeft className="h-4 w-4 text-green-400" /> : <ArrowUpRight className="h-4 w-4 text-red-400" />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white capitalize">{tx.purpose?.replace('_', ' ')}</div>
                                            <div className="text-xs text-gray-500">ID: {tx.trxId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {tx.hotelId?.name || 'System'}
                                </td>
                                <td className={`px-6 py-4 font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'credit' ? '+' : '-'} BDT {tx.amount}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-900 text-green-300 capitalize">
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transactions.length === 0 && (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                        <FileText className="h-12 w-12 opacity-20" />
                        No transactions recorded yet
                    </div>
                )}
            </div>
        </div>
    );
}
