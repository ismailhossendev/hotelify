import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    subscription: {
        status: { type: String, enum: ['active', 'trial', 'expired', 'cancelled'], default: 'trial' },
        expiresAt: Date,
        billingCycle: { type: String, enum: ['monthly', 'yearly'] },
        autoRenew: { type: Boolean, default: false }
    },

    name: { type: String, required: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    category: { type: String }, // Dynamic category from SiteConfig
    starRating: { type: Number, min: 1, max: 5 },

    domain: {
        subdomain: String,
        customDomain: String,
        customDomainVerified: { type: Boolean, default: false },
        sslEnabled: { type: Boolean, default: false }
    },

    contact: {
        email: String,
        phone: String,
        whatsapp: String,
        address: {
            line1: String,
            line2: String,
            city: String,
            district: String,
            postalCode: String,
            country: { type: String, default: 'Bangladesh' }
        },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },

    logo: String,
    coverImage: String,
    gallery: [{ url: String, caption: String }],

    amenities: [{ type: String }],

    policies: {
        checkInTime: { type: String, default: '14:00' },
        checkOutTime: { type: String, default: '12:00' },
        cancellationPolicy: String,
        childPolicy: String,
        petPolicy: String,
    },

    wallet: {
        smsCredits: { type: Number, default: 0 },
        pendingBalance: { type: Number, default: 0 },
        availableBalance: { type: Number, default: 0 }
    },

    bankDetails: {
        bankName: String,
        accountName: String,
        accountNumber: String,
        branchName: String,
        routingNumber: String
    },
    mfsDetails: {
        provider: { type: String, enum: ['bkash', 'nagad', 'rocket'] },
        accountNumber: String
    },

    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },

    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    },

    // --- Onboarding & Verification ---
    destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },

    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'rejected'],
        default: 'pending'
    },

    documents: [{
        type: { type: String, enum: ['trade_license', 'nid', 'tin', 'other'] },
        url: { type: String, required: true },
        verified: { type: Boolean, default: false },
        notes: String
    }],

    // Keep legacy isActive for backward compatibility if needed, else sync with status
    isActive: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    stats: {
        totalBookings: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 }
    }
}, { timestamps: true });

HotelSchema.index({ 'domain.subdomain': 1 });
HotelSchema.index({ 'domain.customDomain': 1 });
HotelSchema.index({ 'contact.address.city': 1, 'contact.address.district': 1 });
HotelSchema.index({ destinationId: 1 }); // Index for location filtering
HotelSchema.index({ status: 1 }); // Index for admin filtering

export const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);
