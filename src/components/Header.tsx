"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, Heart, Bell, Search, MapPin, Phone, Mail, LogOut, LayoutDashboard, Calendar } from 'lucide-react';


export default function Header({ config, user }: { config?: any, user?: any }) {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const contact = config?.header?.contact || { phone: "+880 1700-000000", email: "info@hotelify.com" };
    const navItems = config?.header?.navigation?.length > 0 ? config.header.navigation : [
        { label: "Home", href: "/" },
        { label: "Browse Hotels", href: "/hotels" },
        { label: "Destinations", href: "/destinations" },
        { label: "Offers & Deals", href: "/offers" },
        { label: "About Us", href: "/about" },
    ];

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        if (user.role === 'super_admin') return '/admin/dashboard';
        if (user.role.includes('vendor')) return '/vendor/dashboard';
        return '/user/profile'; // Or user dashboard
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                <span>{contact.email}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-auto">
                            {(config?.header?.topBarLinks?.length > 0 ? config.header.topBarLinks : [
                                { label: "List Your Property", href: "/become-partner" },
                                { label: "Help & Support", href: "/help" }
                            ]).map((link: any, idx: number) => (
                                <div key={idx} className="flex items-center">
                                    <Link href={link.href} className="hover:underline">
                                        {link.label}
                                    </Link>
                                    {idx < (config?.header?.topBarLinks?.length || 2) - 1 && (
                                        <span className="text-white/40 mx-4">|</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-12 h-12 transform group-hover:scale-105 transition-transform">
                            <img src="/logo.png" alt="Hotelify Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Hotelify
                            </h1>
                            <p className="text-xs text-gray-500">Your Perfect Stay Awaits</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navItems.map((item: any, idx: number) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search Button (Mobile) */}
                        <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Search className="h-5 w-5 text-gray-600" />
                        </button>

                        {/* Notifications */}
                        <button className="hidden md:block relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="h-5 w-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Favorites */}
                        <button className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Heart className="h-5 w-5 text-gray-600" />
                        </button>

                        {/* Dynamic User Menu */}
                        <div className="hidden md:flex items-center gap-3">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl transition-all"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.name?.[0] || 'U'
                                            )}
                                        </div>
                                        <div className="text-left hidden xl:block">
                                            <p className="text-xs font-bold text-gray-900 leading-none">{user.name || 'User'}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">{user.role?.replace('_', ' ') || 'Guest'}</p>
                                        </div>
                                    </button>

                                    {/* Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 z-50">
                                            {/* Dashboard Link - Only for Admins/Vendors */}
                                            {user.role !== 'guest' && (
                                                <Link
                                                    href={getDashboardLink()}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    <span className="font-medium">Dashboard</span>
                                                </Link>
                                            )}
                                            <Link
                                                href="/my-bookings"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Calendar className="h-4 w-4" />
                                                <span className="font-medium">My Bookings</span>
                                            </Link>
                                            <Link
                                                href="/user/profile"
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">My Profile</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors border-t border-gray-50 mt-1"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span className="font-medium">Sign Out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6 text-gray-600" />
                            ) : (
                                <Menu className="h-6 w-6 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-100 bg-white">
                        <nav className="container mx-auto px-4 py-6 space-y-4">
                            {/* User Info Mobile */}
                            {user && (
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        {user.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500 uppercase">{user.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            )}

                            {navItems.map((item: any, idx: number) => (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                {user ? (
                                    <>
                                        {/* Dashboard Link - Only for Admins/Vendors */}
                                        {user.role !== 'guest' && (
                                            <Link
                                                href={getDashboardLink()}
                                                className="flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-xl font-bold"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                Dashboard
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-center"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )
            }
        </header >
    );
}
