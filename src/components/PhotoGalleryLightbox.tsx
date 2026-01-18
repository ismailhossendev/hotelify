"use client";

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PhotoGalleryLightboxProps {
    images: string[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
    hotelName?: string;
}

export default function PhotoGalleryLightbox({
    images,
    initialIndex = 0,
    isOpen,
    onClose,
    hotelName = "Hotel"
}: PhotoGalleryLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        setCurrentIndex(initialIndex);
        setZoom(1);
    }, [initialIndex, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setZoom(1);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setZoom(1);
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.5, 3));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.5, 1));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between">
                    <div className="text-white">
                        <h3 className="text-lg font-bold">{hotelName}</h3>
                        <p className="text-sm text-gray-300">
                            {currentIndex + 1} / {images.length}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Main Image */}
            <div className="absolute inset-0 flex items-center justify-center px-20">
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                        src={images[currentIndex]}
                        alt={`${hotelName} - Photo ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                        style={{ transform: `scale(${zoom})` }}
                    />
                </div>
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                </>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex gap-2">
                <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 1}
                    className="p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ZoomOut className="h-5 w-5" />
                </button>
                <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur text-white text-sm font-medium">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="p-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ZoomIn className="h-5 w-5" />
                </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex gap-2 bg-black/60 backdrop-blur p-3 rounded-xl max-w-2xl overflow-x-auto">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setZoom(1);
                                }}
                                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex
                                        ? 'border-white scale-110'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
