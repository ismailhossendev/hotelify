import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    action: {
        type: String,
        enum: [
            'login', 'logout', 'failed_login',
            'create', 'update', 'delete',
            'booking_confirm', 'booking_cancel', 'booking_checkout',
            'payment_received', 'withdrawal_request', 'withdrawal_approve',
            'settings_change', 'permission_change'
        ],
        required: true
    },

    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,

    changes: {
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed
    },

    description: String,

    ipAddress: String,
    userAgent: String,

    isImmutable: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

AuditLogSchema.index({ hotelId: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, action: 1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
