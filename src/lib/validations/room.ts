import { z } from 'zod';

export const createRoomSchema = z.object({
    name: z.string().min(2).max(100),
    roomType: z.enum(['single', 'double', 'twin', 'suite', 'family', 'dormitory']),
    description: z.string().max(1000).optional(),
    capacity: z.object({
        adults: z.number().min(1).max(20),
        children: z.number().min(0).max(10).default(0),
        extraBedAllowed: z.boolean().default(false)
    }),
    totalRooms: z.number().min(1).max(1000),
    basePrice: z.number().positive(),
    amenities: z.array(z.string()).optional()
});

export const seasonalPricingSchema = z.object({
    name: z.string().min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    price: z.number().positive(),
    isActive: z.boolean().default(true)
}).refine(data => {
    return new Date(data.endDate) > new Date(data.startDate);
}, { message: 'End date must be after start date' });
