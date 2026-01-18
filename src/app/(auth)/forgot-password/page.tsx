"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, CheckCircle, ArrowLeft, KeyRound, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";

function ForgotPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState<"EMAIL" | "OTP" | "PASSWORD">("EMAIL");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Auto-fill and Auto-verify logic
    useEffect(() => {
        const emailParam = searchParams.get("email");
        const otpParam = searchParams.get("otp");
        const autoVerify = searchParams.get("autoverify");

        if (emailParam) {
            setEmail(emailParam);
            // If we have an email, effectively we are past the first step, 
            // unless we are already at the password step.
            setStep((current) => current === "EMAIL" ? "OTP" : current);
        }

        if (otpParam) {
            setOtp(otpParam);
        }

        // Only auto-verify if we have both params AND we are explicitly asked to autoverify
        // AND we haven't already moved to the password step (deduplication)
        if (emailParam && otpParam && autoVerify === "true") {
            const verifyOtp = async () => {
                setLoading(true);
                try {
                    const res = await fetch("/api/auth/forgot-password/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: emailParam, otp: otpParam }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.error || "Invalid OTP");
                    }

                    // Success! Move to password reset
                    setStep("PASSWORD");
                } catch (err: any) {
                    setError(err.message || "Auto-verification failed: Invalid Link");
                } finally {
                    setLoading(false);
                }
            };

            // Execute verification
            verifyOtp();
        }
    }, [searchParams]);

    // Step 1: Request OTP
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 404) {
                    setError(data.error || "Account not found. Please create a new account.");
                } else {
                    throw new Error(data.error || "Something went wrong");
                }
                return;
            }

            setStep("OTP");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/forgot-password/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Invalid OTP");
            }

            setStep("PASSWORD");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // We send email + otp again to verify server-side before reset
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Reset failed");
            }

            // Success - Redirect
            router.push("/login?reset=success");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 relative mb-4">
                        <img src="/logo.png" alt="Hotelify" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        {step === "EMAIL" && "Forgot password?"}
                        {step === "OTP" && "Check your email"}
                        {step === "PASSWORD" && "Set new password"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === "EMAIL" && "Enter your email to receive a verification code."}
                        {step === "OTP" && `We sent a 6-digit code to ${email}.`}
                        {step === "PASSWORD" && "Secure your account with a new password."}
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 border border-gray-100 sm:rounded-2xl sm:px-10">

                    {error && (
                        <div className="rounded-lg bg-red-50 p-4 mb-6 border border-red-100 flex gap-3 text-red-700 text-sm">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                            <div>{error} {error.includes("not found") && <Link href="/register" className="underline font-bold ml-1">Create account</Link>}</div>
                        </div>
                    )}

                    {step === "EMAIL" && (
                        <form className="space-y-6" onSubmit={handleEmailSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 pb-1">
                                    Email address
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Code"}
                            </button>
                        </form>
                    )}

                    {step === "OTP" && (
                        <form className="space-y-6" onSubmit={handleOtpSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 pb-1">
                                    Verification Code
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm tracking-widest font-mono text-lg"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Code"}
                            </button>
                            <div className="text-center">
                                <button type="button" onClick={() => setStep("EMAIL")} className="text-sm text-blue-600 hover:underline">
                                    Wrong email? Go back
                                </button>
                            </div>
                        </form>
                    )}

                    {step === "PASSWORD" && (
                        <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 pb-1">
                                    New Password
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={6}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 pb-1">
                                    Confirm Password
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={6}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {step === "EMAIL" && (
                        <div className="text-center mt-6">
                            <Link href="/login" className="flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                <ArrowLeft className="h-4 w-4 mr-1" /> Back to log in
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
            <ForgotPasswordContent />
        </Suspense>
    );
}
