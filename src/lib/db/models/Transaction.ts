import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    type: {
        type: String,
        enum: [
            'booking_payment',
            'subscription_payment',
            'sms_topup',
            'sms_deduct',
            'withdrawal',
            'commission',
            'refund',
            'pos_payment',
            'credit',
            'debit'
        ],
        required: true
    },

    relatedId: mongoose.Schema.Types.ObjectId,
    relatedType: { type: String, enum: ['Booking', 'POSOrder', 'Subscription'] },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },

    balanceBefore: Number,
    balanceAfter: Number,

    paymentMethod: { type: String, enum: ['cash', 'bkash', 'nagad', 'card', 'bank', 'wallet'] },
    paymentGateway: {
        provider: String,
        transactionId: String,
        paymentId: String,
        status: String,
        rawResponse: mongoose.Schema.Types.Mixed
    },

    withdrawal: {
        bankDetails: mongoose.Schema.Types.Mixed,
        mfsDetails: mongoose.Schema.Types.Mixed,
        status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'] },
        processedAt: Date,
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        failureReason: String
    },

    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },

    description: String,
    internalNotes: String,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ipAddress: String
}, { timestamps: true });

TransactionSchema.index({ hotelId: 1, type: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, type: 1 });

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
