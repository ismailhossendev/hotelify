"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<'guest' | 'vendor_admin'>('guest');
    const [step, setStep] = useState<'register' | 'otp'>('register');
    const [userId, setUserId] = useState<string | null>(null);
    const [canSkip, setCanSkip] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: ""
    });

    // OTP State
    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, role }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Registration failed");

            if (data.requiresVerification) {
                setUserId(data.userId);
                setCanSkip(data.canSkipVerification);
                setStep('otp');
            } else {
                // Success - Show Animation then Redirect
                setIsSuccess(true);
                setTimeout(() => {
                    router.push(role === 'vendor_admin' ? "/vendor/dashboard" : "/");
                }, 2000);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, code: otp }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");

            // Success
            setIsSuccess(true);
            setTimeout(() => {
                router.push(role === 'vendor_admin' ? "/vendor/dashboard" : "/");
                router.refresh();
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/skip-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Skip failed");

            router.push("/");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Common Success UI Component
    const SuccessUI = ({ message }: { message: string }) => (
        <div className="space-y-6 text-center py-12 animate-in fade-in zoom-in duration-500">
            <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">Success!</h2>
                <p className="text-gray-500 text-lg">{message}</p>
                <p className="text-sm text-gray-400 animate-pulse">Redirecting you to dashboard...</p>
            </div>
        </div>
    );

    if (isSuccess) {
        return <SuccessUI message={step === 'otp' ? "Your account has been verified." : "Your account has been created."} />;
    }

    if (step === 'otp') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Verify Account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter the security code sent to your email
                        </p>
                    </div>

                    <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 border border-gray-100 sm:rounded-2xl sm:px-10">
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            {error && (
                                <div className="rounded-lg bg-red-50 p-4 border border-red-100 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="otp" className="sr-only">
                                    OTP Code
                                </label>
                                <div className="flex justify-center">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        className="block w-full text-center text-3xl tracking-[0.5em] py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-300"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Identity"}
                                </button>

                                {canSkip && (
                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        disabled={loading}
                                        className="w-full flex justify-center py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                    >
                                        Skip for now
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 relative mb-4">
                        <img src="/logo.png" alt="Hotelify" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join millions of users using our platform
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 border border-gray-100 sm:rounded-2xl sm:px-10">
                    <div className="flex justify-center mb-8">
                        <nav className="flex space-x-2 bg-gray-100 p-1 rounded-xl" aria-label="Tabs">
                            <button
                                onClick={() => setRole('guest')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${role === 'guest'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Customer
                            </button>
                            <button
                                onClick={() => setRole('vendor_admin')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${role === 'vendor_admin'
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Business
                            </button>
                        </nav>
                    </div>

                    <form className="space-y-6" onSubmit={handleRegister}>
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4 border border-red-100 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 pb-1">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 pb-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 pb-1">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                                    placeholder="+88017..."
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 pb-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${role === 'vendor_admin'
                                    ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                    }`}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
                            </button>
                            {role === 'vendor_admin' && (
                                <p className="text-xs text-center text-gray-500 mt-4">
                                    * Business verification required for vendor accounts
                                </p>
                            )}
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                href="/login"
                                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
