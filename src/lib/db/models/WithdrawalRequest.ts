import mongoose from 'mongoose';

const WithdrawalRequestSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        accountName: String,
        method: { type: String, enum: ['bank', 'bkash', 'nagad'], default: 'bank' }
    },
    adminNote: String,
    processedAt: Date
}, { timestamps: true });

export const WithdrawalRequest = mongoose.models.WithdrawalRequest || mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);
