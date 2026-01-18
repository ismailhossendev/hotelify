"use client";

import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { CategoryCardSkeleton, SectionHeaderSkeleton } from '@/components/ui/Skeleton';

export default function CategoryBrowseSection({ config, loading = false }: { config?: any; loading?: boolean }) {
    // Show skeleton during loading
    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <SectionHeaderSkeleton />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <CategoryCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!config?.enabled) return null;

    const items = config.items || [];

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">{config.title || "Browse by Category"}</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {config.subtitle || "Find the perfect accommodation for your travel style"}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {items.map((category: any, idx: number) => {
                        // Dynamic Icon Resolution
                        const IconName = category.icon as keyof typeof LucideIcons;
                        const Icon = (LucideIcons[IconName] || LucideIcons.Home) as React.ElementType;

                        return (
                            <Link
                                key={idx}
                                href={`/hotels?propertyType=${category.name.toLowerCase()}`}
                                className="group"
                            >
                                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-600 hover:shadow-xl transition-all duration-300 text-center">
                                    <div className={`${category.color || 'bg-blue-500'} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
                                    <p className="text-sm text-gray-600 mb-2 truncate">{category.description}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

