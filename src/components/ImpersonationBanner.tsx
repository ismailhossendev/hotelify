"use client";

import { Shield, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ImpersonationBannerProps {
    isImpersonating: boolean;
}

export default function ImpersonationBanner({ isImpersonating }: ImpersonationBannerProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    if (!isImpersonating) return null;

    const handleReturn = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/end-impersonation', {
                method: 'POST'
            });
            const data = await res.json();

            if (data.success) {
                // Redirect to admin dashboard
                router.push('/admin/dashboard');
                router.refresh();
            } else {
                alert('Failed to return: ' + data.error);
            }
        } catch (err) {
            alert('Error ending session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 flex items-center justify-between shadow-lg mb-4 rounded-lg">
            <div className="flex items-center gap-3">
                <Shield className="h-5 w-5" />
                <span className="font-medium">
                    You are viewing this dashboard as a hotel owner (Impersonation Mode)
                </span>
            </div>
            <button
                onClick={handleReturn}
                disabled={loading}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
                <ArrowLeft className="h-4 w-4" />
                {loading ? 'Returning...' : 'Return to Admin Panel'}
            </button>
        </div>
    );
}
