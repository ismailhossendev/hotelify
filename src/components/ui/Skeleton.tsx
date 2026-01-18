"use client";

import React from 'react';

// Base Skeleton with shimmer animation
export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`relative overflow-hidden bg-gray-200 rounded-lg ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
    );
}

// Card Skeleton for Hotel Cards
export function HotelCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-full flex flex-col">
            {/* Image placeholder */}
            <Skeleton className="h-64 rounded-none" />

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />

                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                    <div>
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-11 w-11 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

// Category Card Skeleton
export function CategoryCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 text-center">
            <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-4" />
            <Skeleton className="h-5 w-20 mx-auto mb-2" />
            <Skeleton className="h-4 w-28 mx-auto" />
        </div>
    );
}

// Destination Card Skeleton
export function DestinationCardSkeleton() {
    return (
        <div className="relative h-80 rounded-3xl overflow-hidden bg-gray-200">
            <Skeleton className="absolute inset-0 rounded-none" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-52 mb-4" />
                <Skeleton className="h-5 w-20" />
            </div>
        </div>
    );
}

// Offer Card Skeleton
export function OfferCardSkeleton() {
    return (
        <div className="relative h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24 rounded-full" />
                </div>
                <div>
                    <Skeleton className="h-7 w-48 mb-3" />
                    <Skeleton className="h-4 w-64 mb-4" />
                    <Skeleton className="h-12 w-36 rounded-xl mb-3" />
                    <Skeleton className="h-4 w-40 mb-4" />
                    <Skeleton className="h-5 w-28" />
                </div>
            </div>
        </div>
    );
}

// Testimonial Card Skeleton
export function TestimonialCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-lg">
            <Skeleton className="w-12 h-12 rounded-full mb-6" />
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-5 w-5 rounded" />
                ))}
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />

            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div>
                    <Skeleton className="h-5 w-28 mb-2" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    );
}

// Section Header Skeleton
export function SectionHeaderSkeleton() {
    return (
        <div className="text-center mb-12">
            <Skeleton className="h-10 w-80 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
        </div>
    );
}

// Featured Hotels Section Skeleton
export function FeaturedHotelsSkeleton() {
    return (
        <div>
            <div className="flex items-end justify-between mb-12">
                <div>
                    <Skeleton className="h-10 w-72 mb-4" />
                    <Skeleton className="h-6 w-96" />
                </div>
                <Skeleton className="h-6 w-24 hidden md:block" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <HotelCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
