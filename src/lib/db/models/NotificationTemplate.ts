import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationTemplate extends Document {
    type: string; // 'otp', 'welcome', 'booking_confirmation', 'payment_success'
    subject: string;
    htmlContent: string;
    variables: string[]; // List of available variables for this template (e.g. ['name', 'otp'])
    updatedAt: Date;
}

const NotificationTemplateSchema = new Schema<INotificationTemplate>({
    type: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    htmlContent: { type: String, required: true },
    variables: { type: [String], default: [] },
}, {
    timestamps: true
});

export const NotificationTemplate = mongoose.models.NotificationTemplate || mongoose.model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema);
