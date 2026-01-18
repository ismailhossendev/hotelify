"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, Calendar, Users as UsersIcon, Star, ArrowRight, ShieldCheck, Clock, Heart } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import CategoryBrowseSection from "@/components/CategoryBrowseSection";
import PopularDestinationsSection from "@/components/PopularDestinationsSection";
import OffersSection from "@/components/OffersSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import { HotelCardSkeleton } from "@/components/ui/Skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";

export default function MarketplaceHome() {
    const [config, setConfig] = useState<any>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [destinations, setDestinations] = useState<any[]>([]); // Added state
    const [hotels, setHotels] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(true);

    // Search filters
    const [selectedCity, setSelectedCity] = useState("");
    const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
    const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
    const [guests, setGuests] = useState(2);

    // Fetch CMS Publice Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, locationsRes, destinationsRes] = await Promise.all([
                    fetch('/api/public/site-config'),
                    fetch('/api/public/locations'),
                    fetch('/api/public/destinations')
                ]);

                const configData = await configRes.json();
                const locationsData = await locationsRes.json();
                const destinationsData = await destinationsRes.json();

                if (configData.success) {
                    setConfig(configData.config);
                }
                if (locationsData.success) {
                    setCities(locationsData.cities);
                }
                if (destinationsData.destinations) {
                    setDestinations(destinationsData.destinations);
                }
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();

        // Save to Session Storage for booking flow persistence
        if (checkInDate || checkOutDate || guests) {
            const searchParams = {
                checkIn: checkInDate?.toISOString(),
                checkOut: checkOutDate?.toISOString(),
                guests: guests
            };
            sessionStorage.setItem('bookingParams', JSON.stringify(searchParams));
        }

        // Build query params
        const params = new URLSearchParams();
        if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
        if (checkInDate) params.append('checkIn', format(checkInDate, 'yyyy-MM-dd'));
        if (checkOutDate) params.append('checkOut', format(checkOutDate, 'yyyy-MM-dd'));
        if (guests) params.append('guests', guests.toString());

        // Redirect to hotels page
        window.location.href = `/hotels?${params.toString()}`;
    };

    // Default hero image if none set in CMS
    const heroBg = config?.hero?.backgroundImage || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80";

    // Re-use loading skeleton or null while initial fetch happens? 
    // Better to show a skeleton or just render with defaults to avoid flash.
    // For now we render with defaults if config is null but loading is false.

    return (
        <>
            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center">
                {/* Background Container - Clipped */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Background Image with Parallax-like effect */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                        style={{ backgroundImage: `url(${heroBg})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                        {/* Futuristic Grid Overlay */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-400/30 text-blue-300 text-sm font-semibold mb-8 animate-fade-in-up tracking-wider uppercase">
                        ✨ Experience the Future of Travel
                    </span>

                    <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-tight animate-fade-in-up delay-100 drop-shadow-2xl">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200">
                            {config?.hero?.title || "Find your"}
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 filter drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                            {/* Extracting last word or generic fallback */}
                            {"Perfect Sanctuary"}
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light animate-fade-in-up delay-200 leading-relaxed">
                        {config?.hero?.subtitle || "Discover curated luxury hotels, resorts, and vacation rentals tailored for the modern traveler."}
                    </p>

                    {/* Modern 'Floating Pill' Glass Search Bar */}
                    <div className="bg-white/10 backdrop-blur-3xl p-2 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 max-w-5xl mx-auto flex flex-col md:flex-row items-center animate-fade-in-up delay-300 relative group transition-all duration-300 hover:bg-white/15">

                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur-md transition duration-500" />

                        {/* Destination */}
                        <div className="flex-1 w-full md:w-auto relative px-6 py-3 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition rounded-3xl md:rounded-l-full md:rounded-r-none group/item">
                            <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1 group-hover/item:text-blue-100 transition-colors">Where</label>
                            <div className="flex items-center -ml-3">
                                <Select value={selectedCity} onValueChange={setSelectedCity}>
                                    <SelectTrigger className="border-0 bg-transparent text-white text-lg font-medium focus:ring-0 shadow-none h-auto py-0 pl-3 pr-2 [&>span]:line-clamp-1 w-full">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="text-white/60 w-4 h-4" />
                                            <SelectValue placeholder="Search destinations" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Cities</SelectItem>
                                        {cities.map(city => (
                                            <SelectItem key={city} value={city}>{city}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Check-in */}
                        <div className="w-full md:w-[20%] relative px-6 py-3 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition group/item">
                            <label className="block text-[10px] font-bold text-purple-200 uppercase tracking-widest mb-1 group-hover/item:text-purple-100 transition-colors">Check-in</label>
                            <div className="flex items-center">
                                <Calendar className="text-white/60 w-4 h-4 mr-2" />
                                <DatePicker
                                    date={checkInDate}
                                    setDate={setCheckInDate}
                                    placeholder="Add dates"
                                    className="text-white text-lg font-medium p-0"
                                />
                            </div>
                        </div>

                        {/* Check-out */}
                        <div className="w-full md:w-[20%] relative px-6 py-3 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 transition group/item">
                            <label className="block text-[10px] font-bold text-purple-200 uppercase tracking-widest mb-1 group-hover/item:text-purple-100 transition-colors">Check-out</label>
                            <div className="flex items-center">
                                <Calendar className="text-white/60 w-4 h-4 mr-2" />
                                <DatePicker
                                    date={checkOutDate}
                                    setDate={setCheckOutDate}
                                    placeholder="Add dates"
                                    className="text-white text-lg font-medium p-0"
                                />
                            </div>
                        </div>

                        {/* Guests */}
                        <div className="w-full md:w-[20%] relative px-6 py-3 hover:bg-white/5 transition rounded-3xl md:rounded-none group/item">
                            <label className="block text-[10px] font-bold text-pink-200 uppercase tracking-widest mb-1 group-hover/item:text-pink-100 transition-colors">Who</label>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <UsersIcon className="text-white/60 w-4 h-4 mr-2" />
                                    <span className="font-medium text-white text-lg">{guests} Guest{guests > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex gap-1 ml-2">
                                    <button
                                        type="button"
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center text-white text-xs transition border border-white/10"
                                    >
                                        -
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGuests(Math.min(10, guests + 1))}
                                        className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center text-white text-xs transition border border-white/10"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="p-2 w-full md:w-auto">
                            <button
                                onClick={() => handleSearch()}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.6)] text-white p-4 rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center justify-center aspect-square md:w-14 md:h-14 group/btn"
                            >
                                <Search className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-24 container mx-auto px-4">
                {searched ? (
                    // Search Results
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-gray-900">
                                {loading ? 'Finding availability...' : `${hotels.length} properties found`}
                            </h2>
                            <button
                                onClick={() => {
                                    setSearched(false);
                                    setSelectedCity('');
                                    setCheckInDate(undefined);
                                    setCheckOutDate(undefined);
                                    setGuests(2);
                                }}
                                className="text-blue-600 hover:underline"
                            >
                                Clear Search
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-8">
                                {hotels.map(hotel => (
                                    <HotelCard key={hotel._id} hotel={hotel} />
                                ))}
                                {hotels.length === 0 && (
                                    <div className="col-span-3 text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Search className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No active listings found</h3>
                                        <p className="text-gray-500">Try adjusting your search query.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // Featured Section (CMS Driven)
                    <div className="space-y-20">
                        {/* Featured Hotels */}
                        <div>
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{config?.featured?.title || "Trending Destinations"}</h2>
                                    <p className="text-xl text-gray-600">{config?.featured?.subtitle || "Most popular choices for travelers from Bangladesh"}</p>
                                </div>
                                <Link href="/search" className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:translate-x-1 transition-transform">
                                    View All <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {loading ? (
                                    // Show skeleton placeholders
                                    <>
                                        {[1, 2, 3].map(i => (
                                            <HotelCardSkeleton key={i} />
                                        ))}
                                    </>
                                ) : config?.featured?.hotels?.length > 0 ? (
                                    config.featured.hotels.map((hotel: any) => (
                                        <HotelCard key={hotel._id} hotel={hotel} />
                                    ))
                                ) : (
                                    // Fallback if no featured hotels selected in Admin
                                    <div className="col-span-3 py-12 text-center text-gray-500 bg-gray-100 rounded-xl">
                                        No featured hotels configured. Visit Admin Panel {'>'} Settings {'>'} Homepage.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Value Props - Dynamic */}
                        <div className="grid md:grid-cols-3 gap-8 py-12 border-t border-gray-200">
                            {(config?.features?.length > 0 ? config.features : [
                                { icon: 'ShieldCheck', title: "Secure Booking", desc: "Your payments are protected with bank-level security." },
                                { icon: 'Clock', title: "24/7 Support", desc: "Our team is here to help you anytime, day or night." },
                                { icon: 'Heart', title: "Best Price Guarantee", desc: "Find a lower price? We'll match it." }
                            ]).map((feature: any, idx: number) => {
                                // Dynamic Icon Resolution
                                // Check if icon is string name (from DB) or component (from hardcoded fallback)
                                let Icon = ShieldCheck;
                                if (typeof feature.icon === 'string') {
                                    // @ts-ignore - Dynamic lookup
                                    Icon = (require('lucide-react')[feature.icon] || ShieldCheck);
                                } else if (feature.icon) {
                                    Icon = feature.icon;
                                }

                                return (
                                    <div key={idx} className="flex gap-6 items-start p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
                                        <div className="bg-blue-100 p-4 rounded-xl text-blue-600 shrink-0">
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                            <p className="text-gray-500 leading-relaxed">{feature.description || feature.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>

            {/* Browse by Category */}
            <CategoryBrowseSection config={config?.categories} loading={loading} />

            {/* Popular Destinations */}
            <PopularDestinationsSection config={{ ...config?.destinations, items: destinations }} loading={loading} />

            {/* Exclusive Offers */}
            <OffersSection config={config?.offers} loading={loading} />

            {/* Customer Testimonials */}
            <TestimonialsSection config={config?.testimonials} loading={loading} />
        </>
    );
}

// Reusable Hotel Card Component matching Premium Design
function HotelCard({ hotel }: { hotel: any }) {
    // Determine image (fallback to placeholder if empty)
    const bgImage = hotel.coverImage || hotel.gallery?.[0]?.url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80";

    return (
        <Link href={`/hotel/${hotel.slug}`} className="group block h-full">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100 group-hover:border-blue-100">
                {/* Image Area */}
                <div className="h-64 relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${bgImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                    <div className="absolute top-4 left-4">
                        <span className="bg-white/95 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                            {hotel.type || "Resort"}
                        </span>
                    </div>

                    <div className="absolute top-4 right-4">
                        <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-gray-900">{hotel.starRating || 5.0}</span>
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-1.5 text-sm font-medium mb-1 opacity-90">
                            <MapPin className="h-4 w-4" />
                            {hotel.contact?.address?.city || hotel.city}, Bangladesh
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {hotel.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                        {hotel.description || "Experience luxury and comfort at its finest."}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Starting from</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-gray-900">৳{hotel.startPrice || "5,500"}</span>
                                <span className="text-gray-400 text-sm">/night</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 group-hover:bg-blue-600 group-hover:text-white p-3 rounded-xl transition-colors duration-300">
                            <ArrowRight className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
