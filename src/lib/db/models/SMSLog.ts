import mongoose from 'mongoose';

const SMSLogSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }, // Optional, might be system notification
    recipient: { type: String, required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['sent', 'failed', 'delivered'],
        default: 'sent'
    },
    cost: { type: Number, default: 0 },
    gateway: { type: String, default: 'unknown' },
    meta: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

SMSLogSchema.index({ createdAt: -1 });
SMSLogSchema.index({ hotelId: 1 });

export const SMSLog = mongoose.models.SMSLog || mongoose.model('SMSLog', SMSLogSchema);
