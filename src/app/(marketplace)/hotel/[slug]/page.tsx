import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Check, ArrowLeft, Wifi, Car, Coffee, Dumbbell, Waves, Users, Bed, Maximize, Ban } from 'lucide-react';
import dbConnect from '@/lib/db/connect';
import { Hotel } from '@/lib/db/models/Hotel';
import HotelRoomsSection from '@/components/HotelRoomsSection';
import HotelGallerySection from '@/components/HotelGallerySection';
import HotelMap from '@/components/HotelMap';
import ReviewsSection from '@/components/ReviewsSection';
import BookingWidget from '@/components/BookingWidget';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getHotel(slug: string) {
    await dbConnect();
    const hotel = await Hotel.findOne({ slug }).select('-__v');
    if (!hotel) return null;
    return JSON.parse(JSON.stringify(hotel));
}

async function getHotelRooms(hotelId: string) {
    try {
        const response = await fetch(`http://localhost:3000/api/hotels/${hotelId}/rooms`, {
            cache: 'no-store'
        });
        const data = await response.json();
        return data.success ? data.rooms : [];
    } catch (error) {
        console.error('Failed to fetch rooms:', error);
        return [];
    }
}

export default async function HotelDetailsPage({ params }: { params: { slug: string } }) {
    const hotel = await getHotel(params.slug);

    if (!hotel) {
        notFound();
    }

    if (!hotel.isActive) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <Ban className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Property Unavailable</h1>
                    <p className="text-gray-500">
                        This property is currently suspended or temporarily unavailable on our platform.
                    </p>
                    <Link href="/hotels" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Browse Other Hotels
                    </Link>
                </div>
            </div>
        );
    }

    const rooms = await getHotelRooms(hotel._id);

    // Gallery images fallback - Ensure high quality images
    const galleryImages = hotel.gallery?.length > 0
        ? hotel.gallery.map((img: any) => img.url)
        : [
            hotel.coverImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1590490360182-f33fb0d41022?auto=format&fit=crop&q=80"
        ];

    // Amenity icons mapping
    const amenityIcons: Record<string, any> = {
        'Free WiFi': Wifi,
        'Parking': Car,
        'Restaurant': Coffee,
        'Gym': Dumbbell,
        'Swimming Pool': Waves,
        'Spa': Waves,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header Area (Behind Navbar style) */}
            <div className="bg-white border-b sticky top-16 z-30 shadow-sm/50 backdrop-blur-md bg-white/90">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/hotels" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Hotels
                    </Link>
                    <div className="flex items-center gap-4">
                        {/* Breadcrumb or Share actions could go here */}
                        <button className="text-gray-500 hover:text-blue-600">Share</button>
                        <button className="text-gray-500 hover:text-blue-600">Save</button>
                    </div>
                </div>
            </div>

            {/* Photo Gallery - Grid Layout */}
            <div className="container mx-auto px-4 py-6">
                <HotelGallerySection images={galleryImages} hotelName={hotel.name} />
            </div>

            {/* Main Content */}
            <section className="container mx-auto px-4 pb-16">
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Title & Header */}
                        <div className="border-b border-gray-100 pb-8">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">{hotel.name}</h1>
                                    <div className="flex items-center gap-4 text-gray-600">
                                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            <span>{hotel.contact?.address?.city}, {hotel.contact?.address?.country}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                            <Star className="h-4 w-4 fill-current" />
                                            <span>{hotel.starRating || 5.0} Stars</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tags/Badges */}
                            <div className="flex gap-2 mt-4">
                                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg uppercase tracking-wide border border-green-100">Recommended</span>
                                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg uppercase tracking-wide border border-purple-100">Luxury</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Property</h2>
                            <p className="text-gray-600 leading-relaxed text-lg text-balance">
                                {hotel.description || "Escape to a world of luxury and tranquility. Nestled in a prime location, our hotel allows you to experience the best of hospitality, comfort, and culture. Whether you are here for business or leisure, we ensure a memorable stay with top-notch amenities and personalized service."}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">What this place offers</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {hotel.amenities?.map((amenity: string, idx: number) => {
                                    const Icon = amenityIcons[amenity] || Check;
                                    return (
                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all bg-white">
                                            <div className="bg-blue-50 p-3 rounded-full">
                                                <Icon className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="font-medium text-gray-900">{amenity}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Available Rooms */}
                        <div id="rooms-section" className="scroll-mt-24">
                            <HotelRoomsSection rooms={rooms} hotel={hotel} />
                        </div>

                        {/* Policies */}
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">House Rules</h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                        <span className="font-medium text-gray-600">Check-in</span>
                                        <span className="font-bold text-gray-900">{hotel.policies?.checkInTime || '02:00 PM'}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                        <span className="font-medium text-gray-600">Check-out</span>
                                        <span className="font-bold text-gray-900">{hotel.policies?.checkOutTime || '11:00 AM'}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900">Cancellation Policy</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Cancel up to {hotel.policies?.cancellationHours || 24} hours before check-in for a full refund.
                                        After that, the reservation is non-refundable.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Location / Map */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
                            <div className="h-[400px] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                                <HotelMap
                                    hotelName={hotel.name}
                                    address={hotel.contact?.address}
                                    coordinates={hotel.contact?.coordinates}
                                />
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-gray-600">
                                <MapPin className="h-5 w-5" />
                                <span>{hotel.contact?.address?.street}, {hotel.contact?.address?.city}, {hotel.contact?.address?.country}</span>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="pt-8 border-t border-gray-100">
                            <ReviewsSection hotelId={hotel._id} hotelName={hotel.name} />
                        </div>
                    </div>

                    {/* Right Column: Sticky Booking Widget */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <BookingWidget
                                hotel={hotel}
                                basePrice={rooms[0]?.basePrice || 5000}
                                rooms={rooms}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Room Card Component
function RoomCard({ room, hotel }: { room: any; hotel: any }) {
    const roomImage = room.images?.[0]?.url || hotel.coverImage || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80";

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="grid md:grid-cols-3 gap-6 p-6">
                {/* Room Image */}
                <div className="relative h-48 md:h-full rounded-xl overflow-hidden">
                    <img
                        src={roomImage}
                        alt={room.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Room Info */}
                <div className="md:col-span-2 flex flex-col">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>

                        {/* Room Features */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>{room.capacity?.adults || 2} Adults, {room.capacity?.children || 1} Child</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Bed className="h-4 w-4" />
                                <span>{room.bedType || 'King Bed'}</span>
                            </div>
                            {room.roomSize && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Maximize className="h-4 w-4" />
                                    <span>{room.roomSize} sq ft</span>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2">
                            {room.amenities?.slice(0, 4).map((amenity: string, idx: number) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                    {amenity}
                                </span>
                            ))}
                            {room.amenities?.length > 4 && (
                                <span className="text-xs text-blue-600 font-medium">
                                    +{room.amenities.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="flex items-end justify-between mt-6 pt-6 border-t border-gray-100">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Starting from</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">৳{room.basePrice?.toLocaleString()}</span>
                                <span className="text-gray-500">/night</span>
                            </div>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                            Reserve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
