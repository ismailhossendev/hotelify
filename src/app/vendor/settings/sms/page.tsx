"use client";

import { useState } from "react";
import { MessageSquare, Plus, CreditCard, History, TrendingUp, AlertCircle } from "lucide-react";

export default function SMSWalletPage() {
    const [balance, setBalance] = useState(150);
    const [history, setHistory] = useState([
        { id: 1, type: 'credit', amount: 500, description: 'Top-up via bKash', date: '2024-01-08' },
        { id: 2, type: 'debit', amount: 10, description: 'Booking Confirmation SMS (BK-8392)', date: '2024-01-08' },
        { id: 3, type: 'debit', amount: 10, description: 'Welcome SMS', date: '2024-01-07' },
    ]);
    const [showTopup, setShowTopup] = useState(false);

    const handleTopUp = () => {
        // Mock Top-up
        setBalance(balance + 500);
        setHistory([{
            id: Date.now(),
            type: 'credit',
            amount: 500,
            description: 'Top-up via bKash',
            date: new Date().toISOString().split('T')[0]
        }, ...history]);
        setShowTopup(false);
        alert('Recharge Successful! 500 SMS added.');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">SMS Wallet</h1>
                    <p className="text-gray-500">Manage your messaging credits</p>
                </div>
            </div>

            {/* Balance Card */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">Active</span>
                    </div>
                    <div className="text-4xl font-bold mb-1">{balance} <span className="text-lg font-normal opacity-80">SMS</span></div>
                    <p className="text-indigo-100 text-sm mb-6">Available Balance</p>

                    <button
                        onClick={() => setShowTopup(true)}
                        className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="h-5 w-5" /> Buy Credits
                    </button>
                    <p className="text-center text-xs mt-3 opacity-70">1 SMS = ৳ 0.50 (Non-masking)</p>
                </div>

                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-gray-500" /> Usage Stats
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 rounded-xl">
                            <div className="text-2xl font-bold text-green-600">98%</div>
                            <div className="text-xs text-gray-500">Delivery Rate</div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <div className="text-2xl font-bold text-blue-600">1,240</div>
                            <div className="text-xs text-gray-500">Sent This Month</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl">
                            <div className="text-2xl font-bold text-purple-600">৳620</div>
                            <div className="text-xs text-gray-500">Cost This Month</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <History className="h-5 w-5 text-gray-400" />
                    <h3 className="font-bold text-gray-900">Transaction History</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-500">{item.date}</td>
                                <td className="px-6 py-3 font-medium text-gray-900">{item.description}</td>
                                <td className="px-6 py-3">
                                    <span className={`px-2 py-1 rounded text-xs capitalize ${item.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className={`px-6 py-3 text-right font-bold ${item.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                    {item.type === 'credit' ? '+' : '-'}{item.amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Top Up Modal */}
            {showTopup && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 relative animate-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4">Recharge SMS Balance</h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="border-2 border-indigo-600 bg-indigo-50 p-4 rounded-xl cursor-pointer text-center relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">Best Value</div>
                                <div className="text-lg font-bold text-indigo-700">500 SMS</div>
                                <div className="text-gray-500">৳250</div>
                            </div>
                            <div className="border border-gray-200 p-4 rounded-xl cursor-pointer hover:border-indigo-300 text-center opacity-60">
                                <div className="text-lg font-bold text-gray-900">1000 SMS</div>
                                <div className="text-gray-500">৳450</div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 p-3 border rounded-xl border-gray-200">
                                <div className="h-8 w-8 bg-pink-500 rounded flex items-center justify-center text-white font-bold text-xs">bK</div>
                                <span className="font-bold text-gray-700">bKash Payment</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTopup(false)}
                                className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTopUp}
                                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700"
                            >
                                Pay ৳250
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
