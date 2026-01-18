import mongoose from 'mongoose';

const SiteConfigSchema = new mongoose.Schema({
    hero: {
        title: { type: String, default: "Find your perfect stay" },
        subtitle: { type: String, default: "Search hundreds of hotels, resorts, and vacation rentals for your next trip." },
        backgroundImage: { type: String, default: "" },
    },
    featured: {
        title: { type: String, default: "Trending Destinations" },
        subtitle: { type: String, default: "Most popular choices for travelers" },
        hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
        hotelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }]
    },
    categories: {
        enabled: { type: Boolean, default: true },
        title: { type: String, default: "Browse by Category" },
        subtitle: { type: String, default: "Find the perfect accommodation for your travel style" },
        items: [{
            id: String,
            name: String,
            description: String,
            icon: String,
            color: String
        }]
    },
    destinations: {
        enabled: { type: Boolean, default: true },
        title: { type: String, default: "Popular Destinations" },
        subtitle: { type: String, default: "Discover the most sought-after travel destinations" },
        items: [{
            name: String,
            image: String,
            hotelCount: Number,
            startingPrice: Number
        }]
    },
    offers: {
        enabled: { type: Boolean, default: true },
        title: { type: String, default: "Exclusive Offers & Deals" },
        subtitle: { type: String, default: "Grab amazing discounts and save on your next booking" },
        items: [{
            title: String,
            discount: String,
            description: String,
            promoCode: String,
            validUntil: String,
            bgColor: String,
            image: String
        }]
    },
    testimonials: {
        enabled: { type: Boolean, default: true },
        title: { type: String, default: "What Our Guests Say" },
        subtitle: { type: String, default: "Hear from travelers who made unforgettable memories" },
        items: [{
            name: String,
            location: String,
            avatar: String,
            rating: Number,
            hotel: String,
            review: String
        }]
    },
    features: [{
        title: String,
        description: String,
        icon: String
    }],
    header: {
        contact: {
            phone: { type: String, default: "+880 1700-000000" },
            email: { type: String, default: "info@hotelify.com" }
        },
        navigation: [{
            label: String,
            href: String
        }],
        topBarLinks: [{
            label: String,
            href: String
        }]
    },
    footer: {
        description: { type: String, default: "Discover and book the best hotels across Bangladesh. Your comfort is our priority." },
        socialLinks: {
            facebook: { type: String, default: "https://facebook.com" },
            twitter: { type: String, default: "https://twitter.com" },
            instagram: { type: String, default: "https://instagram.com" },
            linkedin: { type: String, default: "https://linkedin.com" }
        },
        quickLinks: [{
            label: String,
            href: String
        }],
        supportLinks: [{
            label: String,
            href: String
        }],
        copyrightText: { type: String, default: "© 2024 Hotelify. All rights reserved." }
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Singleton model - we will only have one active config usually
// Force schema refresh in dev
if (mongoose.models.SiteConfig) {
    delete mongoose.models.SiteConfig;
}
export const SiteConfig = mongoose.model('SiteConfig', SiteConfigSchema);
