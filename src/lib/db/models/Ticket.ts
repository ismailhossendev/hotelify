import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: String,
    message: { type: String, required: true },
    attachments: [String], // URLs
    sentAt: { type: Date, default: Date.now }
});

const TicketSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Creator

    subject: { type: String, required: true },
    category: { type: String, enum: ['billing', 'technical', 'feature', 'other'], default: 'other' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },

    messages: [MessageSchema],

    lastReplyAt: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin
}, { timestamps: true });

TicketSchema.index({ status: 1, updatedAt: -1 });

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
