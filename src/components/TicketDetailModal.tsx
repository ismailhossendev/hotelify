"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Paperclip, Clock, CheckCircle, AlertCircle, User, Shield } from "lucide-react";

export default function TicketDetailModal({
    ticket,
    onClose,
    onRefresh
}: {
    ticket: any;
    onClose: () => void;
    onRefresh: () => void;
}) {
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [ticket.messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/tickets/${ticket._id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: reply })
            });
            const data = await res.json();
            if (data.success) {
                setReply("");
                onRefresh();
            } else {
                alert('Failed to send reply');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/tickets/${ticket._id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Status changed to ${newStatus}`, status: newStatus })
            });
            if (res.ok) onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-700';
            case 'in_progress': return 'bg-yellow-100 text-yellow-700';
            case 'resolved': return 'bg-blue-100 text-blue-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-start bg-gray-50">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(ticket.status)}`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                            <span className="text-gray-500 text-sm">#{ticket._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{ticket.subject}</h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(ticket.createdAt).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {ticket.priority.toUpperCase()} priority
                            </span>
                            <span className="flex items-center gap-1 capitalize">
                                <CheckCircle className="h-4 w-4" />
                                {ticket.category}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            className="bg-white border text-sm rounded-lg px-3 py-2 outline-none"
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-100">
                    {ticket.messages.map((msg: any, idx: number) => {
                        const isStaff = msg.senderName === 'Support Agent' || msg.senderName === 'Super Admin';
                        const isMe = false; // Logic depends on who calls, simplify visual: Staff = Right, User = Left? 
                        // Actually easier: Current User logic is hard without passing prop.
                        // Let's rely on senderName check or senderId vs ticket.userId.

                        const isUserMessage = msg.senderId === ticket.userId._id || msg.senderId === ticket.userId;

                        return (
                            <div key={idx} className={`flex ${isUserMessage ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isUserMessage
                                        ? 'bg-white text-gray-900 rounded-tl-none'
                                        : 'bg-blue-600 text-white rounded-tr-none'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2 opacity-80 text-xs">
                                        {isUserMessage ? <User className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                                        <span className="font-bold">{msg.senderName}</span>
                                        <span>•</span>
                                        <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                <div className="p-4 bg-white border-t">
                    <form onSubmit={handleSend} className="flex gap-4">
                        <div className="flex-1 relative">
                            <textarea
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-[60px]"
                                placeholder="Type your reply..."
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                            />
                            <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                                <Paperclip className="h-5 w-5" />
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !reply.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center aspect-square h-[60px]"
                        >
                            {loading ? <Clock className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
