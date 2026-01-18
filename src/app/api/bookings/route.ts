import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Booking } from '@/lib/db/models/Booking';
import { Room } from '@/lib/db/models/Room';
import { RoomUnit } from '@/lib/db/models/RoomUnit';
import { User } from '@/lib/db/models/User';
import { getCurrentUser } from '@/lib/auth/token';
import { createBookingSchema } from '@/lib/validations/booking';
import { checkAvailability, calculateBookingPrice } from '@/lib/services/booking.service';
import { AuditLog } from '@/lib/db/models/AuditLog';
import mongoose from 'mongoose'; // Access global mongoose for ObjectId

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        // Guests can book (if we allow public booking without login, but usually needs login or guest session)
        // The prompt says "User Features: Smart Booking Flow". Implies User is logged in or creates account.
        // Let's assume User or Guest (if we allowed guest checkout). 
        // For this strict SaaS, let's require auth (Guest Role or Vendor Staff).

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        const validation = createBookingSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: 'Validation failed', details: validation.error.format() }, { status: 400 });
        }

        const { roomId, roomUnitId, checkIn, checkOut, guestDetails, specialRequests, paymentMethod } = validation.data;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // 0. Verify RoomUnit if provided
        if (roomUnitId) {
            const unit = await RoomUnit.findById(roomUnitId);
            if (!unit) return NextResponse.json({ error: 'Selected Room Unit not found' }, { status: 404 });
            if (unit.roomTypeId.toString() !== roomId) return NextResponse.json({ error: 'Room Unit does not match Room Type' }, { status: 400 });

            // Check Unit Availability
            const conflictingBooking = await Booking.findOne({
                roomUnitId,
                status: { $in: ['confirmed', 'checked_in'] },
                $or: [
                    { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
                ]
            });

            if (conflictingBooking) {
                return NextResponse.json({ error: 'Room Unit ' + unit.roomNo + ' is already occupied for these dates' }, { status: 409 });
            }
        }

        // 1. Check Room Existence & get Hotel
        const room = await Room.findById(roomId);
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // 2. Availability Check
        const isAvailable = await checkAvailability(roomId, { checkIn: checkInDate, checkOut: checkOutDate });
        if (!isAvailable) {
            return NextResponse.json({ error: 'Room not available for selected dates' }, { status: 409 });
        }

        // 3. Price Calculation
        const pricing = await calculateBookingPrice(roomId, { checkIn: checkInDate, checkOut: checkOutDate });

        // 4. Determine Status & Type
        // If Vendor is creating -> 'walk_in' or 'offline'
        // If Guest is creating -> 'online'

        let bookingType = 'online';
        let status = 'pending';

        if (user.role.includes('vendor') || user.role === 'super_admin') {
            bookingType = 'walk_in'; // Or offline, simplified
            status = 'confirmed'; // Staff bookings are usually instant
        }

        // 5. Booking Number Generation
        const bookingNumber = `BK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        // 6. Create Booking
        const booking = await Booking.create({
            hotelId: room.hotelId,
            roomId,
            roomUnitId: roomUnitId || undefined,
            guestId: user.role === 'guest' ? user.userId : null, // Link if guest
            bookingNumber,
            bookingType,
            status, // Confirmed for staff, Pending for guest

            guestDetails, // From input

            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights: Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)),

            guests: validation.data.guests,

            pricing: {
                roomCharges: pricing.breakdown,
                subtotal: pricing.subtotal,
                totalAmount: pricing.total // + taxes if logic added
            },

            specialRequests,
            createdBy: user.userId
        });

        // 7. Audit Log
        await AuditLog.create({
            hotelId: room.hotelId,
            userId: user.userId,
            action: 'create',
            entityType: 'Booking',
            entityId: booking._id,
            description: `Booking created ${bookingNumber}`
        });

        return NextResponse.json({ success: true, booking }, { status: 201 });

    } catch (error) {
        console.error('Create booking error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        let query: any = {};

        // Tenant Filters
        if (user.role === 'guest') {
            query.guestId = user.userId; // Guest sees only their bookings
        } else if (user.role !== 'super_admin') {
            if (!user.hotelId) return NextResponse.json({ bookings: [] });
            query.hotelId = user.hotelId; // Vendor sees their hotel bookings
        }

        if (status) query.status = status;
        if (type) query.bookingType = type;

        // Ensure models are registered before populate
        // This is a workaround for Next.js dev mode model registration issues
        if (!mongoose.models.User) {
            console.log('Registering User model explicitly');
            // Determining if simple access is enough, or if we need to re-import
            // Since we imported { User }, it should have run. 
            // If it's missing from mongoose.models, something is wrong with the import.
            // Let's just log it for now to force usage.
            const _u = User;
        }

        const bookings = await Booking.find(query)
            .populate('roomId', 'name roomType')
            .populate('guestId', 'profile.name')
            .populate('roomUnitId', 'roomNo status')
            .sort({ createdAt: -1 })
            .limit(50); // Pagination needed later

        console.log('[DEBUG] GET /bookings', {
            userId: user.userId,
            hotelId: user.hotelId,
            query,
            count: bookings.length
        });

        return NextResponse.json({ success: true, bookings });

    } catch (error) {
        console.error('GET bookings error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
