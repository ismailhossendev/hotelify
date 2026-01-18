"use client";

import { Star, ThumbsUp, Calendar } from 'lucide-react';

interface ReviewsSectionProps {
    hotelId: string;
    hotelName: string;
}

// Mock reviews data for demonstration
const mockReviews = [
    {
        id: '1',
        guestName: 'John Doe',
        rating: 5,
        title: 'Excellent stay!',
        comment: 'Had a wonderful time at this hotel. The staff was friendly, rooms were clean, and the location was perfect. Highly recommend!',
        date: '2024-01-05',
        isVerified: true,
        hotelReply: 'Thank you for your wonderful review! We look forward to welcoming you back soon.'
    },
    {
        id: '2',
        guestName: 'Sarah Smith',
        rating: 4,
        title: 'Great experience',
        comment: 'Really enjoyed our stay. The breakfast was excellent and the pool area was beautiful. Only minor issue was check-in took a bit long.',
        date: '2024-01-02',
        isVerified: true
    },
    {
        id: '3',
        guestName: 'Mike Johnson',
        rating: 5,
        title: 'Perfect vacation spot',
        comment: 'Everything was perfect! The ocean view from our room was breathtaking. Will definitely come back.',
        date: '2023-12-28',
        isVerified: false
    }
];

export default function ReviewsSection({ hotelId, hotelName }: ReviewsSectionProps) {
    const averageRating = 4.7;
    const totalReviews = 234;

    const ratingDistribution = [
        { stars: 5, count: 180, percentage: 77 },
        { stars: 4, count: 40, percentage: 17 },
        { stars: 3, count: 10, percentage: 4 },
        { stars: 2, count: 3, percentage: 1 },
        { stars: 1, count: 1, percentage: 1 },
    ];

    return (
        <div className="space-y-6">
            {/* Overall Rating Summary */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Reviews</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Rating Score */}
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</div>
                            <div className="flex items-center gap-1 justify-center mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-5 w-5 ${star <= averageRating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-600">{totalReviews} reviews</p>
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                        {ratingDistribution.map(({ stars, count, percentage }) => (
                            <div key={stars} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700 w-12">{stars} star</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {mockReviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100">
                        {/* Reviewer Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900">{review.guestName}</h4>
                                    {review.isVerified && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            Verified Guest
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(review.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= review.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Review Content */}
                        <h5 className="font-bold text-gray-900 mb-2">{review.title}</h5>
                        <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                        {/* Hotel Reply */}
                        {review.hotelReply && (
                            <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-blue-600">
                                <p className="text-sm font-bold text-gray-900 mb-1">Response from {hotelName}</p>
                                <p className="text-sm text-gray-700">{review.hotelReply}</p>
                            </div>
                        )}

                        {/* Helpful Button */}
                        <button className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Helpful</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            <button className="w-full py-3 px-6 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-colors">
                Load More Reviews
            </button>
        </div>
    );
}
