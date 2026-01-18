"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Calendar, Users as UsersIcon, Star, ArrowRight, Filter, Grid, List, SlidersHorizontal, X, Tag } from "lucide-react";
import Link from "next/link";

export default function HotelsPage() {
    const searchParams = useSearchParams();
    const [cities, setCities] = useState<string[]>([]);
    const [hotels, setHotels] = useState<any[]>([]);
    const [allHotels, setAllHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [availableCategories, setAvailableCategories] = useState<any[]>([]);

    // All filter states
    const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || "");
    const [selectedPropertyType, setSelectedPropertyType] = useState(searchParams.get('propertyType') || "");
    const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || "");
    const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || "");
    const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || "2"));

    // Advanced filters
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || "");
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || "price_asc");

    // Available amenities for filter
    const availableAmenities = ['Free WiFi', 'Swimming Pool', 'Gym', 'Spa', 'Restaurant', 'Parking', 'Airport Shuttle'];

    // Fetch cities, hotels, and categories
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [locationsRes, hotelsRes, configRes] = await Promise.all([
                    fetch('/api/public/locations'),
                    fetch('/api/search?' + buildQueryParams()),
                    fetch('/api/config/public')
                ]);

                const locationsData = await locationsRes.json();
                const hotelsData = await hotelsRes.json();
                const configData = await configRes.json();

                if (locationsData.success) setCities(locationsData.cities);
                if (hotelsData.success) {
                    // Client-side filter by property type if selected
                    let filteredHotels = hotelsData.hotels;
                    if (selectedPropertyType) {
                        filteredHotels = hotelsData.hotels.filter((h: any) =>
                            h.category?.toLowerCase() === selectedPropertyType.toLowerCase()
                        );
                    }
                    setHotels(filteredHotels);
                    setAllHotels(hotelsData.hotels);
                }
                if (configData.success && configData.config?.categories?.items) {
                    setAvailableCategories(configData.config.categories.items);
                }
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedCity, selectedPropertyType, checkIn, checkOut, guests, minPrice, maxPrice, selectedRatings, selectedAmenities, sortBy]);

    const buildQueryParams = () => {
        const params = new URLSearchParams();
        if (selectedCity) params.append('city', selectedCity);
        if (checkIn) params.append('checkIn', checkIn);
        if (checkOut) params.append('checkOut', checkOut);
        if (guests) params.append('guests', guests.toString());
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (selectedRatings.length > 0) params.append('starRating', selectedRatings.join(','));
        if (selectedAmenities.length > 0) params.append('amenities', selectedAmenities.join(','));
        if (sortBy) params.append('sortBy', sortBy);
        return params.toString();
    };

    const clearFilters = () => {
        setSelectedCity("");
        setSelectedPropertyType("");
        setCheckIn("");
        setCheckOut("");
        setGuests(2);
        setMinPrice("");
        setMaxPrice("");
        setSelectedRatings([]);
        setSelectedAmenities([]);
        setSortBy("price_asc");
    };

    const toggleRating = (rating: number) => {
        setSelectedRatings(prev =>
            prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
        );
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        );
    };

    const activeFiltersCount = [
        selectedCity, selectedPropertyType, checkIn, checkOut, minPrice, maxPrice,
        selectedRatings.length > 0, selectedAmenities.length > 0
    ].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Filters Header Bar */}
            <div className="bg-white border-b sticky top-16 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-900">Browse Hotels</h1>
                            <span className="text-gray-500">
                                {loading ? 'Loading...' : `${hotels.length} ${hotels.length === 1 ? 'property' : 'properties'}`}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Sorting */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border rounded-lg bg-white text-sm"
                            >
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="rating_desc">Top Rated</option>
                            </select>

                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <aside className={`md:col-span-1 ${showFilters ? 'block' : 'hidden md:block'} space-y-6`}>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 sticky top-32 max-h-[calc(100vh-150px)] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                                {activeFiltersCount > 0 && (
                                    <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* City Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Property Type Filter */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Property Type</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={selectedPropertyType}
                                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    {availableCategories.map(cat => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Price Range (per night)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="px-3 py-2 border rounded-lg text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">৳500 - ৳50,000</p>
                            </div>

                            {/* Star Rating */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Star Rating</label>
                                <div className="space-y-2">
                                    {[5, 4, 3].map(rating => (
                                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedRatings.includes(rating)}
                                                onChange={() => toggleRating(rating)}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: rating }).map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Amenities</label>
                                <div className="space-y-2">
                                    {availableAmenities.map(amenity => (
                                        <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedAmenities.includes(amenity)}
                                                onChange={() => toggleAmenity(amenity)}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Date Filters */}
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Check-in</label>
                                <input
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
                                />
                                <label className="block text-sm font-bold text-gray-700 mb-2">Check-out</label>
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>

                            {/* Guests */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Guests</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                        className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                                    >−</button>
                                    <span className="font-bold w-8 text-center">{guests}</span>
                                    <button
                                        onClick={() => setGuests(Math.min(10, guests + 1))}
                                        className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                                    >+</button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Hotels Grid */}
                    <div className="md:col-span-3">
                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-96 bg-gray-200 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : hotels.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hotels.map(hotel => (
                                    <HotelCard key={hotel._id} hotel={hotel} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* No Results Message */}
                                <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {selectedPropertyType
                                            ? `No "${selectedPropertyType}" properties found`
                                            : "No hotels found"
                                        }
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        {selectedPropertyType
                                            ? "We don't have this type of property yet, but explore our other options!"
                                            : "Try adjusting your filters"
                                        }
                                    </p>
                                    <button onClick={clearFilters} className="text-blue-600 hover:underline font-medium">
                                        Clear all filters
                                    </button>
                                </div>

                                {/* Explore Others Section */}
                                {selectedPropertyType && allHotels.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                                            Explore Other Properties
                                        </h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {allHotels.slice(0, 6).map(hotel => (
                                                <HotelCard key={hotel._id} hotel={hotel} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hotel Card Component
function HotelCard({ hotel }: { hotel: any }) {
    const bgImage = hotel.coverImage || hotel.gallery?.[0]?.url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80";

    return (
        <Link href={`/hotel/${hotel.slug}`} className="group block h-full">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-100 group-hover:border-blue-100">
                <div className="h-56 relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${bgImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                    <div className="absolute top-4 left-4">
                        <span className="bg-white/95 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                            Hotel
                        </span>
                    </div>

                    <div className="absolute top-4 right-4">
                        <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-gray-900">{hotel.starRating || 5}</span>
                        </div>
                    </div>

                    {/* Best Coupon Badge */}
                    {hotel.bestOffer && (
                        <div className="absolute top-14 left-4">
                            <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 animate-pulse">
                                <Tag className="h-3 w-3" />
                                {hotel.bestOffer.type === 'percentage'
                                    ? `${hotel.bestOffer.value}% OFF`
                                    : `৳${hotel.bestOffer.value} OFF`
                                }
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-1.5 text-sm font-medium opacity-90">
                            <MapPin className="h-4 w-4" />
                            {hotel.contact?.address?.city}, Bangladesh
                        </div>
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {hotel.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                        {hotel.description || "Experience luxury and comfort at its finest."}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Starting from</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-gray-900">৳{hotel.startPrice?.toLocaleString()}</span>
                                <span className="text-gray-400 text-sm">/night</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 group-hover:bg-blue-600 group-hover:text-white p-3 rounded-xl transition-colors duration-300">
                            <ArrowRight className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div >
        </Link >
    );
}
