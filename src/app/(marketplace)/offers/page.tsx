"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Calendar, ArrowRight, Copy, Check, Percent, Loader2 } from 'lucide-react';

interface Offer {
    _id: string;
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    validUntil: string;
    image?: string;
    bgColor?: string;
    hotelId?: { _id: string; name: string; slug: string; coverImage?: string };
}

export default function PublicOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await fetch('/api/public/offers?limit=20');
            const data = await res.json();
            setOffers(data.offers || []);
        } catch (error) {
            console.error('Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 py-20 px-4">
                <div className="container mx-auto text-center text-white">
                    <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium mb-6">
                        💰 Special Offers
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Exclusive Deals & Discounts
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Save on your next hotel booking with these limited-time offers. Copy the coupon code and apply at checkout.
                    </p>
                </div>
            </div>

            {/* Offers Grid */}
            <div className="container mx-auto px-4 py-16">
                {offers.length === 0 ? (
                    <div className="text-center py-20">
                        <Tag className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Offers</h2>
                        <p className="text-gray-500 mb-8">Check back later for exclusive deals and discounts.</p>
                        <Link
                            href="/hotels"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
                        >
                            Browse Hotels <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.map(offer => (
                            <div
                                key={offer._id}
                                className="relative rounded-3xl overflow-hidden group"
                            >
                                {/* Background */}
                                <div className={`absolute inset-0 ${offer.bgColor || 'bg-gradient-to-br from-purple-500 to-blue-500'}`} />
                                {offer.image && (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-30"
                                        style={{ backgroundImage: `url(${offer.image})` }}
                                    />
                                )}

                                {/* Content */}
                                <div className="relative z-10 p-8 text-white min-h-[360px] flex flex-col">
                                    {/* Discount Badge */}
                                    <div className="flex justify-between items-start mb-auto">
                                        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
                                            <Percent className="h-4 w-4" />
                                            <span className="font-bold text-lg">
                                                {offer.discountType === 'percentage'
                                                    ? `${offer.discountValue}% OFF`
                                                    : `৳${offer.discountValue} OFF`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <div className="mt-8">
                                        <h3 className="text-2xl font-bold mb-3">{offer.title}</h3>
                                        <p className="text-white/80 mb-6 line-clamp-2">
                                            {offer.description || 'Apply this coupon at checkout to save on your booking.'}
                                        </p>

                                        {/* Coupon Code */}
                                        <button
                                            onClick={() => copyCode(offer.code)}
                                            className="w-full bg-white/20 backdrop-blur hover:bg-white/30 px-6 py-4 rounded-xl font-mono font-bold text-xl flex items-center justify-center gap-3 transition-all group-hover:scale-[1.02]"
                                        >
                                            <Tag className="h-5 w-5" />
                                            {offer.code}
                                            {copiedCode === offer.code ? (
                                                <Check className="h-5 w-5 text-green-300" />
                                            ) : (
                                                <Copy className="h-5 w-5 opacity-70" />
                                            )}
                                        </button>

                                        {/* Validity */}
                                        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-white/70">
                                            <Calendar className="h-4 w-4" />
                                            <span>Valid until {new Date(offer.validUntil).toLocaleDateString()}</span>
                                        </div>

                                        {/* Hotel link if specific */}
                                        {offer.hotelId && (
                                            <Link
                                                href={`/hotel/${offer.hotelId.slug}`}
                                                className="mt-4 flex items-center justify-center gap-2 text-white font-medium hover:gap-4 transition-all"
                                            >
                                                Book at {offer.hotelId.name} <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <div className="bg-white py-16 px-4">
                <div className="container mx-auto text-center max-w-2xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Use Coupons</h2>
                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        <div>
                            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-blue-600">1</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Copy Code</h3>
                            <p className="text-gray-500 text-sm">Click on any coupon to copy the code to your clipboard</p>
                        </div>
                        <div>
                            <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-purple-600">2</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Book a Room</h3>
                            <p className="text-gray-500 text-sm">Choose your hotel and room, then proceed to checkout</p>
                        </div>
                        <div>
                            <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">3</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Apply & Save</h3>
                            <p className="text-gray-500 text-sm">Paste the coupon code at checkout to get your discount</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
