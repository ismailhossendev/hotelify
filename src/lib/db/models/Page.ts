
import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, default: "" }, // HTML content from rich text editor
    seoTitle: String,
    seoDescription: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Prevent overwrite in dev
if (mongoose.models.Page) {
    delete mongoose.models.Page;
}

export const Page = mongoose.model('Page', PageSchema);
