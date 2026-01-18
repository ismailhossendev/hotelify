import mongoose from 'mongoose';

const SystemConfigSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true }, // e.g., 'general_settings'
    value: { type: mongoose.Schema.Types.Mixed }, // JSON object or value
}, { timestamps: true });

export const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', SystemConfigSchema);
