import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },

    pricing: {
        monthly: { type: Number, default: 0 },
        yearly: { type: Number, default: 0 },
        currency: { type: String, default: 'BDT' },
        smsCostPerUnit: { type: Number, default: 0.50 } // Default 50 paisa per SMS
    },

    features: {
        maxRooms: { type: Number, default: 10 },
        maxStaff: { type: Number, default: 3 },
        maxBookingsPerMonth: { type: Number, default: 100 },

        customDomainEnabled: { type: Boolean, default: false },
        posEnabled: { type: Boolean, default: false },
        housekeepingEnabled: { type: Boolean, default: false },
        reportsEnabled: { type: Boolean, default: true },

        smsCreditsIncluded: { type: Number, default: 0 },

        templateAccess: { type: String, enum: ['free', 'premium', 'all'], default: 'free' },

        prioritySupport: { type: Boolean, default: false },
        liveChat: { type: Boolean, default: false },
        apiAccess: { type: Boolean, default: false },
    },

    commissionRate: { type: Number, default: 5, min: 0, max: 100 },
    isCommissionBased: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true }, // Can be used/assigned
    isVisible: { type: Boolean, default: true }, // Publicly listed (Hidden Plan feature)
    isDefault: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
