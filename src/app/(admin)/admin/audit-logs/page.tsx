"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Shield, Clock, FileText } from "lucide-react";

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState("");

    useEffect(() => {
        fetch('/api/admin/audit-logs')
            .then(res => res.json())
            .then(data => {
                if (data.success) setLogs(data.logs);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredLogs = logs.filter(log =>
        !actionFilter || log.action === actionFilter
    );

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Audit Logs</h1>
                    <p className="text-gray-400">Track system activities and security events</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-gray-600"
                        value={actionFilter}
                        onChange={e => setActionFilter(e.target.value)}
                    >
                        <option value="">All Actions</option>
                        <option value="login">Login</option>
                        <option value="failed_login">Failed Login</option>
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                        <option value="settings_change">Settings Change</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredLogs.map(log => (
                    <div key={log._id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-start gap-4">
                        <div className={`mt-1 p-2 rounded-lg ${getLogIconColor(log.action)}`}>
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white capitalize">{log.action.replace('_', ' ')}</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Performed by <span className="text-purple-400">{log.userId?.profile?.name || log.userId?.email || 'System'}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        {new Date(log.createdAt).toLocaleString()}
                                    </div>
                                    {log.ipAddress && (
                                        <div className="text-xs text-gray-600 mt-1 font-mono">
                                            IP: {log.ipAddress}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {log.description && (
                                <div className="mt-3 bg-gray-900/50 p-3 rounded-lg text-sm text-gray-300 flex gap-2">
                                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                                    {log.description}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No logs found matching your criteria
                    </div>
                )}
            </div>
        </div>
    );
}

function getLogIconColor(action: string) {
    if (action.includes('login')) return 'bg-blue-600';
    if (action.includes('fail')) return 'bg-red-600';
    if (action.includes('create')) return 'bg-green-600';
    if (action.includes('delete')) return 'bg-red-900';
    return 'bg-gray-600';
}
