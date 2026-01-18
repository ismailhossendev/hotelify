import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
    // Basic Info
    code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        index: true
    },
    title: { type: String, required: true },
    description: String,

    // Ownership & Scope
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scope: {
        type: String,
        enum: ['platform', 'hotel'],
        required: true,
        default: 'hotel'
    },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }, // Required if scope = 'hotel'

    // Discount Configuration
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
        default: 'percentage'
    },
    discountValue: { type: Number, required: true }, // 25 for 25% or 500 for ৳500 off
    minBookingAmount: { type: Number, default: 0 },  // Minimum cart value to apply
    maxDiscountAmount: Number,  // Cap for percentage discounts

    // Applicability (for platform-wide offers)
    applicableHotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
    applicableRoomTypes: [String], // Optional room type filter

    // Validity Period
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },

    // Usage Limits
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usageCount: { type: Number, default: 0 },
    usageLimitPerUser: { type: Number, default: 0 }, // 0 = unlimited per user

    // Status Flags
    isActive: { type: Boolean, default: true },
    isAutoApply: { type: Boolean, default: false }, // Apply automatically at checkout
    isFirstBookingOnly: { type: Boolean, default: false }, // Only for first-time guests

    // Display Settings (for public offers page)
    isPublic: { type: Boolean, default: false },
    image: String,
    bgColor: { type: String, default: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
    priority: { type: Number, default: 0 }, // Higher = shown first
    showOnHome: { type: Boolean, default: false }, // Featured on homepage

    // Redemption History
    redemptions: [{
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
        discountAmount: Number,
        redeemedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Indexes
OfferSchema.index({ code: 1, hotelId: 1 }, { unique: true }); // Code unique per hotel
OfferSchema.index({ scope: 1, isActive: 1 });
OfferSchema.index({ validFrom: 1, validUntil: 1 });
OfferSchema.index({ isPublic: 1, isActive: 1 });

// Virtual to check if offer is currently valid
OfferSchema.virtual('isValid').get(function () {
    const now = new Date();
    return this.isActive &&
        now >= this.validFrom &&
        now <= this.validUntil &&
        (this.usageLimit === 0 || this.usageCount < this.usageLimit);
});

// Method to validate offer for a booking
OfferSchema.methods.validateForBooking = function (hotelId: string, bookingAmount: number) {
    const errors: string[] = [];
    const now = new Date();

    if (!this.isActive) {
        errors.push('This offer is no longer active');
    }

    if (now < this.validFrom) {
        errors.push('This offer is not yet valid');
    }

    if (now > this.validUntil) {
        errors.push('This offer has expired');
    }

    if (this.usageLimit > 0 && this.usageCount >= this.usageLimit) {
        errors.push('This offer has reached its usage limit');
    }

    if (bookingAmount < this.minBookingAmount) {
        errors.push(`Minimum booking amount is ৳${this.minBookingAmount}`);
    }

    // Check hotel applicability for platform offers
    if (this.scope === 'platform' && this.applicableHotels?.length > 0) {
        if (!this.applicableHotels.some((h: mongoose.Types.ObjectId) => h.toString() === hotelId)) {
            errors.push('This offer is not applicable for this hotel');
        }
    }

    // Check hotel match for hotel-specific offers
    if (this.scope === 'hotel' && this.hotelId?.toString() !== hotelId) {
        errors.push('This offer is not applicable for this hotel');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// Method to calculate discount
OfferSchema.methods.calculateDiscount = function (bookingAmount: number): number {
    let discount = 0;

    if (this.discountType === 'percentage') {
        discount = (bookingAmount * this.discountValue) / 100;
        // Apply max cap if set
        if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
            discount = this.maxDiscountAmount;
        }
    } else {
        discount = this.discountValue;
    }

    // Discount cannot exceed booking amount
    return Math.min(discount, bookingAmount);
};

export const Offer = mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
