"use client";

import { MapPin } from 'lucide-react';

interface HotelMapProps {
    hotelName: string;
    address: {
        street?: string;
        city: string;
        district?: string;
        country: string;
    };
    coordinates?: {
        lat?: number;
        lng?: number;
    };
}

export default function HotelMap({ hotelName, address, coordinates }: HotelMapProps) {
    const { city, district, country, street } = address;
    const fullAddress = [street, city, district, country].filter(Boolean).join(', ');

    // For now, we'll use a static map image from OpenStreetMap
    // In production, you'd use Google Maps API or Leaflet with real coordinates
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=90.3,22.3,90.5,22.5&layer=mapnik&marker=${coordinates?.lat || 22.4},${coordinates?.lng || 90.4}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>

            <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">{hotelName}</p>
                        <p className="text-sm text-gray-600">{fullAddress}</p>
                    </div>
                </div>

                {/* Map Embed */}
                <div className="relative h-64 rounded-xl overflow-hidden bg-gray-100">
                    <iframe
                        src={mapUrl}
                        className="w-full h-full"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                {/* Get Directions Button */}
                <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    <MapPin className="h-4 w-4" />
                    Get Directions
                </a>
            </div>
        </div>
    );
}
