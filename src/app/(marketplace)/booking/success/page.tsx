"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, MapPin, Printer } from "lucide-react";

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const bookingNumber = searchParams.get('number');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg w-full text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle className="h-10 w-10" />
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-500">
                        Thank you for choosing Hotelify. Your reservation has been successfully confirmed.
                    </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border space-y-4">
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold text-center">Booking Reference</div>
                        <div className="text-2xl font-mono font-bold text-blue-600 tracking-wider py-1">{bookingNumber || 'BK-XXXXXX'}</div>
                    </div>

                    <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="text-left">
                            <span className="text-gray-500 block">Check-in</span>
                            <span className="font-bold">Pending</span>
                        </div>
                        <div className="text-right">
                            <span className="text-gray-500 block">Payment</span>
                            <span className="font-bold">Pay at Hotel</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href="/" className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">
                        Return Home
                    </Link>
                    <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                        <Printer className="h-4 w-4" /> Save Receipt
                    </button>
                </div>
            </div>
        </div>
    );
}
