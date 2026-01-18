import { z } from 'zod';

export const createBookingSchema = z.object({
    roomId: z.string().min(1, 'Room is required'),
    roomUnitId: z.string().optional(),
    checkIn: z.string().datetime({ message: 'Invalid check-in date' }),
    checkOut: z.string().datetime({ message: 'Invalid check-out date' }),
    guests: z.object({
        adults: z.number().min(1, 'At least 1 adult required').max(10),
        children: z.number().min(0).max(10).default(0)
    }),
    guestDetails: z.object({
        name: z.string().min(2, 'Name is required'),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().min(11, 'Valid phone number required'),
        nid: z.string().optional(),
        address: z.string().optional()
    }),
    specialRequests: z.string().max(500).optional(),
    paymentMethod: z.enum(['cash', 'bkash', 'nagad', 'card']).optional()
}).refine(data => {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    return checkOut > checkIn;
}, { message: 'Check-out must be after check-in' });

export const paymentSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    method: z.enum(['cash', 'bkash', 'nagad', 'card', 'bank']),
    transactionId: z.string().optional()
});
