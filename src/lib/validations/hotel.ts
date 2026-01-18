import { z } from 'zod';

export const createHotelSchema = z.object({
    name: z.string().min(3, 'Hotel name must be at least 3 characters'),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    planId: z.string().min(1, 'Plan is required'),
    contact: z.object({
        email: z.string().email(),
        phone: z.string().min(11),
        address: z.object({
            city: z.string().min(1),
            district: z.string().min(1),
        }).optional()
    })
});

export const updateHotelSchema = z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    contact: z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        address: z.object({
            line1: z.string().optional(),
            city: z.string().optional(),
            district: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional()
        }).optional()
    }).optional(),
    policies: z.object({
        checkInTime: z.string().optional(),
        checkOutTime: z.string().optional(),
        cancellationPolicy: z.string().optional()
    }).optional(),
    bankDetails: z.object({
        bankName: z.string().optional(),
        accountName: z.string().optional(),
        accountNumber: z.string().optional(),
        branchName: z.string().optional()
    }).optional()
});
