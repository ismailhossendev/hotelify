import mongoose from 'mongoose';

const DomainRequestSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    domain: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    dnsVerified: { type: Boolean, default: false },
    rejectionReason: String
}, { timestamps: true });

export const DomainRequest = mongoose.models.DomainRequest || mongoose.model('DomainRequest', DomainRequestSchema);
