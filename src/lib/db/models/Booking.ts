import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }, // The Room Type
    roomUnitId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomUnit' }, // The specific Room Number (Optional initially)
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    bookingNumber: { type: String, unique: true },
    bookingType: { type: String, enum: ['online', 'offline', 'walk_in'], required: true },

    parentBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    isMerged: { type: Boolean, default: false },

    guestDetails: {
        name: { type: String, required: true },
        email: String,
        phone: { type: String, required: true },
        nid: String,
        address: String,
        nationality: { type: String, default: 'Bangladeshi' },
        documents: [{ type: String, url: String }] // e.g., 'nid_front', 'passport'
    },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true },

    guests: {
        adults: { type: Number, default: 1 },
        children: { type: Number, default: 0 }
    },

    additionalGuests: [{
        name: { type: String, required: true },
        age: Number,
        nid: String
    }],

    pricing: {
        roomCharges: [{ date: Date, price: Number }],
        subtotal: { type: Number, required: true },
        taxes: { type: Number, default: 0 },
        extraBedCharges: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountReason: String,
        // Coupon/Offer tracking
        coupon: {
            offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
            code: String,
            discountAmount: { type: Number, default: 0 }
        },
        totalAmount: { type: Number, required: true }
    },

    posCharges: [{
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'POSOrder' },
        amount: Number,
        description: String,
        createdAt: { type: Date, default: Date.now }
    }],
    grandTotal: { type: Number },

    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded'],
        default: 'pending'
    },
    payments: [{
        method: { type: String, enum: ['cash', 'bkash', 'nagad', 'card', 'bank'] },
        amount: Number,
        transactionId: String,
        paidAt: Date,
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
        default: 'pending'
    },

    confirmedAt: Date,
    checkedInAt: Date,
    checkedOutAt: Date,
    cancelledAt: Date,

    requiresApproval: { type: Boolean, default: false },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'] },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,

    specialRequests: String,
    internalNotes: String,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    commission: {
        rate: Number,
        amount: Number,
        collected: { type: Boolean, default: false }
    }
}, { timestamps: true });

BookingSchema.index({ hotelId: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ hotelId: 1, status: 1 });
BookingSchema.index({ guestId: 1 });
// bookingNumber index is already created by unique:true

export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
