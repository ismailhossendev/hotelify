"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Filter, MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";
import TicketDetailModal from "@/components/TicketDetailModal";

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedTicket, setSelectedTicket] = useState<any>(null);

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
        // Poll for updates every 30s
        const interval = setInterval(fetchTickets, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredTickets = tickets.filter(t => {
        const matchesSearch =
            t.subject.toLowerCase().includes(search.toLowerCase()) ||
            t.hotelId?.name?.toLowerCase().includes(search.toLowerCase()) ||
            t._id.includes(search);
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Support Desk</h1>
                    <p className="text-gray-400">Manage vendor support tickets</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            className="bg-transparent border-none outline-none text-white placeholder-gray-500 w-48"
                            placeholder="Search tickets..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Kanban-like Status Filters */}
            <div className="grid grid-cols-4 gap-4">
                {['all', 'open', 'in_progress', 'resolved'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`p-4 rounded-xl border transition-all ${filterStatus === status
                                ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500'
                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="capitalize font-bold text-gray-300">
                                {status === 'all' ? 'All Tickets' : status.replace('_', ' ')}
                            </span>
                            {status === 'open' && <AlertCircle className="h-5 w-5 text-red-500" />}
                            {status === 'in_progress' && <Clock className="h-5 w-5 text-yellow-500" />}
                            {status === 'resolved' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {status === 'all'
                                ? tickets.length
                                : tickets.filter(t => t.status === status).length}
                        </div>
                    </button>
                ))}
            </div>

            {/* Ticket List */}
            <div className="space-y-4">
                {filteredTickets.map(ticket => (
                    <div
                        key={ticket._id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-500 cursor-pointer transition-colors group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-lg ${ticket.priority === 'urgent' ? 'bg-red-900/50 text-red-400' :
                                        ticket.priority === 'high' ? 'bg-orange-900/50 text-orange-400' :
                                            'bg-gray-700 text-gray-400'
                                    }`}>
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                                        {ticket.subject}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                                            {ticket.hotelId?.name || 'Unknown Hotel'}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(ticket.lastReplyAt || ticket.createdAt).toLocaleString()}</span>
                                        <span>•</span>
                                        <span className="capitalize">{ticket.category}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-2 line-clamp-1">
                                        {ticket.messages[ticket.messages.length - 1]?.message}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <StatusBadge status={ticket.status} />
                                {ticket.assignedTo && (
                                    <span className="text-xs text-gray-500" title="Assigned Agent">
                                        {ticket.assignedTo.profile?.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredTickets.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No tickets found matching your filters.
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onRefresh={() => {
                        fetchTickets();
                        setSelectedTicket(null); // Close to refresh state properly or re-fetch detail
                    }}
                />
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        open: 'bg-green-900 text-green-300',
        in_progress: 'bg-yellow-900 text-yellow-300',
        resolved: 'bg-blue-900 text-blue-300',
        closed: 'bg-gray-700 text-gray-300'
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wide ${colors[status] || 'bg-gray-700'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
