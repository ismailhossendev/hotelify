"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";
import TicketDetailModal from "@/components/TicketDetailModal";

export default function VendorSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/tickets');
            const data = await res.json();
            if (data.success) {
                setTickets(data.tickets);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Support & Help Desk</h1>
                    <p className="text-gray-500">Need help? Open a ticket to contact our support team.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-blue-200"
                >
                    <Plus className="h-5 w-5" />
                    Open New Ticket
                </button>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="font-bold text-gray-900">Your Tickets</h2>
                </div>

                {tickets.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-900">No tickets found</p>
                        <p className="text-sm">You haven't opened any support tickets yet.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {tickets.map(ticket => (
                            <div
                                key={ticket._id}
                                onClick={() => setSelectedTicket(ticket)}
                                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-lg ${ticket.status === 'open' ? 'bg-green-100 text-green-600' :
                                                ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {ticket.subject}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                <span className="capitalize font-medium text-gray-700">{ticket.category}</span>
                                                <span>•</span>
                                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>Last Reply: {new Date(ticket.lastReplyAt || ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge status={ticket.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <CreateTicketModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchTickets();
                    }}
                />
            )}

            {/* Detail Modal */}
            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onRefresh={() => {
                        fetchTickets();
                        setSelectedTicket(null);
                    }}
                />
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        open: 'bg-green-100 text-green-700',
        in_progress: 'bg-yellow-100 text-yellow-700',
        resolved: 'bg-blue-100 text-blue-700',
        closed: 'bg-gray-100 text-gray-500'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[status] || 'bg-gray-100'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

function CreateTicketModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        category: 'technical',
        priority: 'medium',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                onSuccess();
            } else {
                alert('Failed to create ticket');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Open New Support Ticket</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                        <input
                            required
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Briefly describe your issue..."
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="technical">Technical Issue</option>
                                <option value="billing">Billing & Subscription</option>
                                <option value="feature">Feature Request</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                            <select
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                        <textarea
                            required
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                            placeholder="Provide detailed information about your issue..."
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
