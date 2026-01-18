import mongoose from 'mongoose';

const DestinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true, lowercase: true, required: true },
    description: { type: String },
    image: { type: String }, // URL to cover image
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 } // For sorting
}, { timestamps: true });

// Force schema refresh - delete cached model if it exists
if (mongoose.models.Destination) {
    delete mongoose.models.Destination;
}
export const Destination = mongoose.model('Destination', DestinationSchema);
