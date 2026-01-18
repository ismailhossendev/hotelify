import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth/token";
import dbConnect from "@/lib/db/connect";
import { Booking } from "@/lib/db/models/Booking";
import { Hotel } from "@/lib/db/models/Hotel"; // Ensure Hotel model is registered
import BookingsClient from "./BookingsClient";
import { Calendar } from "lucide-react";

async function getUserBookings(userId: string) {
    await dbConnect();
    // Populate hotel name/address
    // We need simple objects for Client Component
    const bookings = await Booking.find({ guestId: userId })
        .populate('hotelId', 'name contact address')
        .sort({ createdAt: -1 })
        .lean();

    // Serialization for Client Component (ObjectId to string, Date to ISO string)
    return JSON.parse(JSON.stringify(bookings));
}

export default async function MyBookingsPage() {
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
        redirect("/login?redirect=/my-bookings");
    }

    const bookings = await getUserBookings(user.userId);

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-12 font-sans text-gray-900">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-gray-500">Manage your current and past reservations.</p>
                    </div>
                </div>

                {/* Client Component for Tabs & List */}
                <BookingsClient bookings={bookings} />

            </div>
        </div>
    );
}
