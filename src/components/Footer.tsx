"use client";

import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { useState } from 'react';

export default function Footer({ config }: { config?: any }) {
    const [email, setEmail] = useState('');

    const footer = config?.footer || {};
    const social = footer.socialLinks || { facebook: "#", twitter: "#", instagram: "#", linkedin: "#" };
    const quickLinks = footer.quickLinks?.length > 0 ? footer.quickLinks : [
        { label: "Browse Hotels", href: "/hotels" },
        { label: "Popular Destinations", href: "/destinations" },
        { label: "Offers & Deals", href: "/offers" },
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" }
    ];
    const supportLinks = footer.supportLinks?.length > 0 ? footer.supportLinks : [
        { label: "Help Center", href: "/help" },
        { label: "FAQs", href: "/faq" },
        { label: "Cancellation Policy", href: "/cancellation-policy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" }
    ];
    const contact = config?.header?.contact || { phone: "+880 1700-000000", email: "info@hotelify.com" };

    const handleNewsletter = (e: React.FormEvent) => {
        e.preventDefault();
        // Newsletter signup logic here
        alert('Thanks for subscribing!');
        setEmail('');
    };

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center">
                                <MapPin className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Hotelify</h3>
                                <p className="text-xs text-gray-400">Your Perfect Stay Awaits</p>
                            </div>
                        </div>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            {footer.description || "Discover and book the best hotels across Bangladesh. Your comfort is our priority."}
                        </p>
                        {/* Social Media */}
                        <div className="flex gap-3">
                            <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            {quickLinks.map((link: any, idx: number) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Support</h4>
                        <ul className="space-y-3">
                            {supportLinks.map((link: any, idx: number) => (
                                <li key={idx}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Stay Updated</h4>
                        <p className="text-gray-400 mb-4">
                            Subscribe to our newsletter for exclusive deals and updates.
                        </p>
                        <form onSubmit={handleNewsletter} className="space-y-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                required
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                <Send className="h-4 w-4" />
                                Subscribe
                            </button>
                        </form>

                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                        <p>{footer.copyrightText || "© 2024 Hotelify. All rights reserved."}</p>
                        <div className="flex items-center gap-6">
                            <Link href="/terms" className="hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <span className="text-gray-600">|</span>
                            <Link href="/privacy" className="hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <span className="text-gray-600">|</span>
                            <Link href="/cookies" className="hover:text-white transition-colors">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
