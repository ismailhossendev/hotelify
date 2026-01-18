import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, required: true }, // URL to image
    previewUrl: { type: String, default: '' }, // Live demo link

    category: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },

    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);
