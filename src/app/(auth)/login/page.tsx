"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertTriangle, Phone, Mail } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSuspendedModal, setShowSuspendedModal] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 403 && data.error === 'Account is deactivated') {
                    setShowSuspendedModal(true);
                    setLoading(false);
                    return;
                }
                throw new Error(data.error || "Login failed");
            }

            // Success - Show Animation
            setIsSuccess(true);
            setTimeout(() => {
                // Redirect based on role
                if (data.user.role.includes("vendor")) {
                    router.push("/vendor/dashboard");
                } else if (data.user.role === "super_admin") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/");
                }
                router.refresh();
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="space-y-6 text-center animate-in fade-in zoom-in duration-500">
                    <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
                        <p className="text-gray-500 text-lg">Login Successful.</p>
                        <p className="text-sm text-gray-400 animate-pulse">Taking you to your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 opacity-90 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}
                />

                <div className="relative z-20 flex flex-col justify-between p-12 w-full h-full text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative">
                            <img src="/logo.png" alt="Hotelify" className="w-full h-full object-contain brightness-0 invert" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Hotelify</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h1 className="text-5xl font-bold leading-tight">
                            Experience the future of hospitality.
                        </h1>
                        <p className="text-xl text-blue-100 font-light">
                            Join thousands of hoteliers and travelers managing their stays with elegance and ease.
                        </p>
                    </div>

                    <div className="text-sm text-blue-200/60">
                        © {new Date().getFullYear()} Hotelify Inc. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white animate-in slide-in-from-right-8 duration-700">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-center lg:text-left space-y-2">
                        <div className="lg:hidden mx-auto h-12 w-12 relative mb-6">
                            <img src="/logo.png" alt="Hotelify" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter text-gray-900">
                            Welcome back
                        </h2>
                        <p className="text-gray-500">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex gap-3 items-start">
                                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                <div className="text-sm text-red-700">
                                    <span className="font-semibold block mb-1">Login failed</span>
                                    {error}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={formData.rememberMe}
                                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember for 30 days</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in to Dashboard"}
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{" "}
                            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Suspended Modal */}
            {showSuspendedModal && (
                <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-in fade-in zoom-in duration-200">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">Account Suspended</h3>

                        <p className="text-sm text-gray-500 mb-6">
                            We have stopped your subscription. Please contact our support team to reactivate your account.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span className="font-medium">+880 1700-000000</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span className="font-medium">support@hotelify.com</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSuspendedModal(false)}
                            className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-gray-900 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
