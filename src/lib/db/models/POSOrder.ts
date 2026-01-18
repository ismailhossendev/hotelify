import mongoose from 'mongoose';

const POSOrderSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },

    orderNumber: { type: String, unique: true },

    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    roomNumber: String,
    chargeToRoom: { type: Boolean, default: false },

    guestName: String,
    guestPhone: String,

    items: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopItem' },
        name: String,
        price: Number,
        quantity: Number,
        total: Number,
        notes: String
    }],

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['cash', 'bkash', 'nagad', 'card', 'room_charge'] },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'room_charged'], default: 'pending' },

    status: { type: String, enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },

    location: { type: String, enum: ['restaurant', 'room_service', 'gift_shop', 'bar'] },
    tableNumber: String,

    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

POSOrderSchema.index({ hotelId: 1, createdAt: -1 });
POSOrderSchema.index({ bookingId: 1 });

export const POSOrder = mongoose.models.POSOrder || mongoose.model('POSOrder', POSOrderSchema);
