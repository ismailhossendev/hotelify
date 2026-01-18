"use client";

import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { DestinationCardSkeleton, SectionHeaderSkeleton } from '@/components/ui/Skeleton';

export default function PopularDestinationsSection({ config, loading = false }: { config?: any; loading?: boolean }) {
    // Show skeleton during loading
    if (loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <SectionHeaderSkeleton />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <DestinationCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!config?.enabled) return null;

    const items = (config.items || []).filter((d: any) => d.isFeatured);

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{config.title || "Popular Destinations"}</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {config.subtitle || "Discover the most sought-after travel destinations in Bangladesh"}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((destination: any, idx: number) => (
                        <Link
                            key={idx}
                            href={`/hotels?city=${encodeURIComponent(destination.name)}`}
                            className="group block"
                        >
                            <div className="relative h-80 rounded-3xl overflow-hidden bg-gray-200">
                                {/* Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${destination.image || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19'})` }}
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <div className="flex items-center gap-2 text-white/90 mb-2">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm font-medium">Bangladesh</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">{destination.name}</h3>
                                    <p className="text-white/80 text-sm mb-4">
                                        {destination.hotelCount || 24} properties • From ৳{(destination.startingPrice || 3500).toLocaleString()}/night
                                    </p>
                                    <div className="flex items-center gap-2 text-white font-medium group-hover:gap-4 transition-all">
                                        <span>Explore</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Hover Border */}
                                <div className="absolute inset-0 border-4 border-transparent group-hover:border-blue-500 rounded-3xl transition-colors pointer-events-none" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

