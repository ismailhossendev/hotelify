
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHotelSiteConfig extends Document {
    hotelId: mongoose.Types.ObjectId;
    hero: {
        title: string;
        subtitle: string;
        backgroundImage: string;
    };
    about: {
        title: string;
        content: string;
        image?: string;
    };
    contact: {
        phone: string;
        email: string;
        address: string;
        googleMapUrl?: string;
    };
    colors: {
        primary: string;
        secondary: string;
    };
    gallery: string[];
    socialLinks: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const HotelSiteConfigSchema = new Schema<IHotelSiteConfig>(
    {
        hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true, unique: true },
        hero: {
            title: { type: String, default: 'Welcome to Our Hotel' },
            subtitle: { type: String, default: 'Experience luxury and comfort' },
            backgroundImage: { type: String, default: '' },
        },
        about: {
            title: { type: String, default: 'About Us' },
            content: { type: String, default: 'We are dedicated to providing the best hospitality.' },
            image: { type: String, default: '' },
        },
        contact: {
            phone: { type: String, default: '' },
            email: { type: String, default: '' },
            address: { type: String, default: '' },
            googleMapUrl: { type: String, default: '' },
        },
        colors: {
            primary: { type: String, default: '#000000' },
            secondary: { type: String, default: '#ffffff' },
        },
        gallery: [{ type: String }],
        socialLinks: {
            facebook: { type: String, default: '' },
            instagram: { type: String, default: '' },
            twitter: { type: String, default: '' },
            linkedin: { type: String, default: '' },
        },
    },
    { timestamps: true }
);

export const HotelSiteConfig: Model<IHotelSiteConfig> =
    mongoose.models.HotelSiteConfig || mongoose.model<IHotelSiteConfig>('HotelSiteConfig', HotelSiteConfigSchema);
