import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Calendar, ArrowRight, Building } from 'lucide-react';
import { OfferCardSkeleton, SectionHeaderSkeleton } from '@/components/ui/Skeleton';

export default function OffersSection({ config, loading: parentLoading }: { config?: any; loading?: boolean }) {
    const [offers, setOffers] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        // Always fetch featured offers from API to ensure validity (checking dates etc)
        // Static config might contain expired offers

        // Otherwise fetch featured offers from API
        const fetchOffers = async () => {
            try {
                const res = await fetch('/api/public/offers?featured=true&limit=3');
                const data = await res.json();
                if (data.success) {
                    setOffers(data.offers);
                }
            } catch (err) {
                console.error("Failed to load featured offers");
            } finally {
                setFetching(false);
            }
        };

        fetchOffers();
    }, [config]);

    const isLoading = parentLoading || fetching;

    if (isLoading) {
        return (
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <SectionHeaderSkeleton />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <OfferCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (offers.length === 0) return null;

    const title = config?.title || "Exclusive Offers & Deals";
    const subtitle = config?.subtitle || "Grab amazing discounts and save on your next booking";

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer: any, idx: number) => (
                        <Link
                            key={idx}
                            href={offer.hotelId?.slug ? `/hotels/${offer.hotelId.slug}` : '/hotels'} // Link to hotel if hotel-specific
                            className="group block"
                        >
                            <div className="relative h-96 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${offer.image || offer.hotelId?.coverImage || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19'})` }}
                                >
                                    <div className="absolute inset-0 bg-black/40" />
                                </div>

                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 ${offer.bgColor || 'bg-gradient-to-br from-blue-500/80 to-purple-600/80'} opacity-60 group-hover:opacity-70 transition-opacity`} />

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-between text-white z-10">
                                    {/* Discount Badge */}
                                    <div className="flex justify-between items-start">
                                        <div className="bg-black/30 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-white/20 max-w-[65%]">
                                            <Building className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate" title={offer.hotelId ? offer.hotelId.name : offer.applicableHotels?.map((h: any) => h.name).join(', ')}>
                                                {offer.hotelId
                                                    ? offer.hotelId.name
                                                    : (offer.applicableHotels?.length > 0
                                                        ? offer.applicableHotels.map((h: any) => h.name).join(', ')
                                                        : "All Hotels & Resorts")}
                                            </span>
                                        </div>
                                        <div className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold text-xl shadow-lg ml-auto">
                                            {offer.discountValue ? (
                                                offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `৳${offer.discountValue} OFF`
                                            ) : (
                                                'Special Deal'
                                            )}
                                        </div>
                                    </div>

                                    {/* Offer Details */}
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-3xl font-bold mb-2 leading-tight">{offer.title}</h3>
                                        <p className="text-white/90 mb-6 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">{offer.description}</p>

                                        {/* Promo Code */}
                                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl mb-4 flex justify-between items-center group-hover:bg-white/20 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-yellow-300" />
                                                <span className="font-mono font-bold tracking-wider">{offer.code}</span>
                                            </div>
                                            <span className="text-xs text-white/70">
                                                Tap to Copy
                                            </span>
                                        </div>

                                        {/* Detailed Terms (Min Booking, Max Disc) */}
                                        <div className="flex flex-wrap gap-3 text-xs text-white/80 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto overflow-hidden">
                                            {offer.minBookingAmount > 0 && (
                                                <span className="bg-black/20 px-2 py-1 rounded">Min Spend: ৳{offer.minBookingAmount}</span>
                                            )}
                                            {offer.maxDiscountAmount > 0 && (
                                                <span className="bg-black/20 px-2 py-1 rounded">Max Disc: ৳{offer.maxDiscountAmount}</span>
                                            )}
                                        </div>

                                        {/* Validity */}
                                        <div className="flex items-center gap-2 text-sm text-white/80 mb-6">
                                            <Calendar className="h-4 w-4" />
                                            <span>Valid until {new Date(offer.validUntil).toLocaleDateString()}</span>
                                        </div>

                                        {/* CTA */}
                                        <div className="flex items-center gap-2 font-bold group-hover:gap-4 transition-all text-yellow-300">
                                            <span>Book Now</span>
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section >
    );
}

