import { Booking } from '@/lib/db/models/Booking';
import { Room } from '@/lib/db/models/Room';

export interface DateRange {
    checkIn: Date;
    checkOut: Date;
}

export async function checkAvailability(
    roomId: string,
    range: DateRange,
    excludeBookingId?: string
): Promise<boolean> {
    const { checkIn, checkOut } = range;

    // Find strictly overlapping bookings
    // A booking overlaps if: (StartA < EndB) and (EndA > StartB)
    const query: any = {
        roomId,
        status: { $nin: ['cancelled', 'no_show', 'checked_out'] }, // Checked out rooms are free? No, if it was checked out TODAY, it might be free for tonight depending on policy.
        // Usually availability checks future. If status is 'checked_out' it means the stay is over. 
        // However, for past dates it matters. For future dates, confirmed bookings matter.
        // Let's assume 'checked_out' means the room is free NOW.
        // But if I check strictly date ranges:

        // Existing Booking: [E_In, E_Out]
        // New Request: [N_In, N_Out]
        // Overlap: E_In < N_Out && E_Out > N_In

        $and: [
            { checkIn: { $lt: checkOut } },
            { checkOut: { $gt: checkIn } }
        ]
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const conflict = await Booking.findOne(query);

    // If conflict found, check if the room has quantity > 1?
    // Our Room model has `totalRooms`.
    // So we need to count conflicts and compare with totalRooms.

    const room = await Room.findById(roomId);
    if (!room) return false;

    const conflictingCount = await Booking.countDocuments(query);

    return conflictingCount < room.totalRooms;
}

export async function calculateBookingPrice(
    roomId: string,
    range: DateRange
): Promise<{
    subtotal: number;
    breakdown: { date: Date; price: number }[];
    total: number;
}> {
    const room = await Room.findById(roomId);
    if (!room) throw new Error('Room not found');

    const breakdown: { date: Date; price: number }[] = [];
    let subtotal = 0;

    const current = new Date(range.checkIn);
    const end = new Date(range.checkOut);

    // Loop through each night
    while (current < end) {
        // We need to clone current date to avoid reference issues or mutation if method relies on it
        const dateToCheck = new Date(current);
        const price = room.getPriceForDate(dateToCheck);

        breakdown.push({
            date: dateToCheck,
            price
        });

        subtotal += price;

        // Next day
        current.setDate(current.getDate() + 1);
    }

    // Add taxes or other logic here if needed
    // For now simple pass through
    return {
        subtotal,
        breakdown,
        total: subtotal // + taxes
    };
}
