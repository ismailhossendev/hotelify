"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Loader2 } from "lucide-react";

export default function DestinationsPage() {
    const [destinations, setDestinations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/public/destinations')
            .then(res => res.json())
            .then(data => {
                if (data.destinations) setDestinations(data.destinations);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center">
                <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Destinations</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Find the perfect location for your next getaway. From beaches to mountains, we have it all.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {destinations.map((destination) => (
                        <Link
                            key={destination._id}
                            href={`/hotels?city=${encodeURIComponent(destination.name)}`}
                            className="group block"
                        >
                            <div className="relative h-80 rounded-3xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${destination.image || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19'})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <div className="flex items-center gap-2 text-white/90 mb-2">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm font-medium">Bangladesh</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">{destination.name}</h3>
                                    <p className="text-white/80 text-sm mb-4">
                                        {destination.hotelCount} properties • From ৳{(destination.startingPrice || 3500).toLocaleString()}/night
                                    </p>
                                    <div className="flex items-center gap-2 text-white font-bold group-hover:gap-4 transition-all">
                                        <span>Discover</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
