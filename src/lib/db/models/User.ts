import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, select: false },

    otp: { type: String, select: false },
    otpExpires: Date,

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: Date,

    role: {
        type: String,
        enum: ['super_admin', 'vendor_admin', 'vendor_staff', 'guest'],
        default: 'guest'
    },

    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', index: true },

    permissions: [{
        type: String,
        enum: ['bookings', 'rooms', 'pos', 'reports', 'housekeeping', 'withdrawal', 'settings']
    }],
    staffRole: { type: String, enum: ['manager', 'receptionist', 'cleaner', 'pos_operator'] },

    profile: {
        name: { type: String, required: true },
        avatar: String,
        address: String,
        nid: String,
    },

    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],

    providers: [{
        name: { type: String, enum: ['google', 'facebook'] },
        providerId: String
    }],

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    lastLoginAt: Date,

    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },

    language: { type: String, enum: ['bn', 'en', 'hi'], default: 'en' },
}, { timestamps: true });

UserSchema.index({ hotelId: 1, role: 1 });

// Prevent Mongoose OverwriteModelError
// In development, we want to clear the model from the cache so that schema changes are applied
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.User;
}

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
