"use client";

import { useState } from 'react';
import PhotoGalleryLightbox from '@/components/PhotoGalleryLightbox';

export default function HotelGallerySection({ images, hotelName }: { images: string[]; hotelName: string }) {
    const [showLightbox, setShowLightbox] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const openLightbox = (index: number) => {
        setSelectedIndex(index);
        setShowLightbox(true);
    };

    return (
        <>
            <section className="bg-white">
                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-4 gap-4 h-[500px]">
                        {/* Main Image */}
                        <div
                            onClick={() => openLightbox(0)}
                            className="col-span-4 md:col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer"
                        >
                            <img
                                src={images[0]}
                                alt={hotelName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Thumbnail Grid */}
                        {images.slice(1, 5).map((img: string, idx: number) => (
                            <div
                                key={idx}
                                onClick={() => openLightbox(idx + 1)}
                                className="relative rounded-2xl overflow-hidden group hidden md:block cursor-pointer"
                            >
                                <img
                                    src={img}
                                    alt={`${hotelName} ${idx + 2}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}

                        {images.length > 5 && (
                            <button
                                onClick={() => openLightbox(0)}
                                className="absolute bottom-6 right-6 bg-white px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                View all {images.length} photos
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <PhotoGalleryLightbox
                images={images}
                initialIndex={selectedIndex}
                isOpen={showLightbox}
                onClose={() => setShowLightbox(false)}
                hotelName={hotelName}
            />
        </>
    );
}
