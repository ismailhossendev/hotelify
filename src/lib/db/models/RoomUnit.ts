
import mongoose from 'mongoose';

const RoomUnitSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },

    roomNo: { type: String, required: true }, // e.g. "101"
    floor: { type: String, default: '1st' },

    status: {
        type: String,
        enum: ['clean', 'dirty', 'maintenance', 'occupied'],
        default: 'clean'
    },

    notes: String,

    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Ensure unique room numbers per hotel
RoomUnitSchema.index({ hotelId: 1, roomNo: 1 }, { unique: true });

export const RoomUnit = mongoose.models.RoomUnit || mongoose.model('RoomUnit', RoomUnitSchema);
