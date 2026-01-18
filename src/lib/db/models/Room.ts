
import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },

    name: { type: String, required: true },
    roomType: { type: String, enum: ['single', 'double', 'twin', 'suite', 'family', 'dormitory', 'standard', 'deluxe'] },
    description: String,

    capacity: {
        adults: { type: Number, default: 2 },
        children: { type: Number, default: 0 },
        extraBedAllowed: { type: Boolean, default: false }
    },

    totalRooms: { type: Number, default: 1, min: 1 },

    basePrice: { type: Number, required: true },
    extraBedCharge: { type: Number, default: 0 },

    // Advanced Pricing
    seasonalPricing: [{
        name: String,
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        price: { type: Number, required: true },
        isActive: { type: Boolean, default: true }
    }],

    weekendPricing: {
        enabled: { type: Boolean, default: true }, // Default enabled for Bangladesh context
        price: Number,
        days: { type: [Number], default: [5, 6] } // 5=Friday, 6=Saturday
    },

    // New: Specific Date Overrides (e.g., Dec 31)
    specialRates: [{
        date: { type: Date, required: true },
        price: { type: Number, required: true },
        note: String
    }],

    images: [{ url: String, caption: String, isPrimary: Boolean }],
    amenities: [String],

    housekeepingStatus: {
        type: String,
        enum: ['clean', 'dirty', 'maintenance', 'inspecting'],
        default: 'clean'
    },

    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

RoomSchema.index({ hotelId: 1, isActive: 1 });

// Helper to get price for a specific date
RoomSchema.methods.getPriceForDate = function (date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // Normalize

    // 1. Check Specific Date Override (Highest Priority)
    const special = (this.specialRates || []).find((s: any) =>
        new Date(s.date).setHours(0, 0, 0, 0) === d.getTime()
    );
    if (special) return special.price;

    // 2. Check Seasonal Pricing
    const seasonal = (this.seasonalPricing || []).find((s: any) =>
        s.isActive && d >= new Date(s.startDate) && d <= new Date(s.endDate)
    );
    if (seasonal) return seasonal.price;

    // 3. Check Weekend Pricing
    const dayOfWeek = d.getDay();
    if (this.weekendPricing?.enabled && (this.weekendPricing.days || [5, 6]).includes(dayOfWeek)) {
        return this.weekendPricing.price || this.basePrice; // Fallback to base if price not set but enabled
    }

    // 4. Default Base Price
    return this.basePrice;
};

export const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);
