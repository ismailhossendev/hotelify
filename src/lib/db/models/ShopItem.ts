import mongoose from 'mongoose';

const ShopItemSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },

    name: { type: String, required: true },
    description: String,
    category: { type: String, enum: ['food', 'beverage', 'snack', 'gift', 'service', 'other'] },

    price: { type: Number, required: true },
    cost: { type: Number, default: 0 },

    trackInventory: { type: Boolean, default: false },
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },

    image: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

export const ShopItem = mongoose.models.ShopItem || mongoose.model('ShopItem', ShopItemSchema);
