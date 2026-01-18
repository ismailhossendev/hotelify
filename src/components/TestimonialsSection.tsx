"use client";

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare } from 'lucide-react';
import { TestimonialCardSkeleton, SectionHeaderSkeleton } from '@/components/ui/Skeleton';

export default function TestimonialsSection({ config, loading = false }: { config?: any; loading?: boolean }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const testimonials = config?.items || [];

    // Auto-rotate testimonials
    useEffect(() => {
        if (!isAutoPlaying || !config?.enabled || testimonials.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, testimonials.length, config?.enabled]);

    // Show skeleton during loading
    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="container mx-auto px-4">
                    <SectionHeaderSkeleton />
                    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <TestimonialCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!config?.enabled) return null;
    if (testimonials.length === 0) return null;

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const getVisibleTestimonials = () => {
        if (testimonials.length <= 3) return testimonials;
        return [
            testimonials[currentIndex],
            testimonials[(currentIndex + 1) % testimonials.length],
            testimonials[(currentIndex + 2) % testimonials.length]
        ];
    };

    const visibleTestimonials = getVisibleTestimonials();

    return (
        <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{config.title || "What Our Guests Say"}</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {config.subtitle || "Hear from travelers who made unforgettable memories"}
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Testimonials Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {visibleTestimonials.map((testimonial: any, idx: number) => (
                            <div
                                key={idx}
                                className={`bg-white rounded-3xl p-8 shadow-lg transition-all duration-500 ${idx === 0 && testimonials.length > 2 ? 'md:scale-105 md:border-2 md:border-blue-500' : ''
                                    }`}
                            >
                                {/* Quote Icon */}
                                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                                    <Quote className="h-6 w-6 text-blue-600" />
                                </div>

                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                {/* Review Text */}
                                <p className="text-gray-700 leading-relaxed mb-6">
                                    "{testimonial.review}"
                                </p>

                                {/* Reviewer Info */}
                                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                                    {testimonial.avatar ? (
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                                            <MessageSquare className="h-6 w-6 text-gray-500" />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-600">{testimonial.location}</p>
                                        <p className="text-xs text-blue-600 font-medium mt-1">
                                            Stayed at {testimonial.hotel || 'Hotel'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    {testimonials.length > 3 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg p-3 rounded-full hover:bg-gray-50 transition-colors hidden md:block"
                            >
                                <ChevronLeft className="h-6 w-6 text-gray-600" />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg p-3 rounded-full hover:bg-gray-50 transition-colors hidden md:block"
                            >
                                <ChevronRight className="h-6 w-6 text-gray-600" />
                            </button>
                        </>
                    )}

                    {/* Dots Indicator */}
                    {testimonials.length > 3 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {testimonials.map((_: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setCurrentIndex(idx);
                                        setIsAutoPlaying(false);
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex
                                        ? 'bg-blue-600 w-8'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

