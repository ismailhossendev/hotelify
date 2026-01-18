
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db/connect";
import { Booking } from "@/lib/db/models/Booking";
import { Hotel } from "@/lib/db/models/Hotel";
import { Printer, Mail, Download } from "lucide-react";

async function getBookingData(id: string) {
    await dbConnect();
    const booking = await Booking.findById(id).populate('hotelId');
    if (!booking) return null;
    return JSON.parse(JSON.stringify(booking));
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
    const booking = await getBookingData(params.id);
    if (!booking) notFound();

    const hotel = booking.hotelId || { name: 'Hotel Name', contact: { address: {} } };
    const guest = booking.guestDetails || {};

    const subtotal = booking.pricing?.subtotal || 0;
    const tax = booking.pricing?.taxes || 0;
    const total = booking.grandTotal || subtotal;
    const paid = booking.amountPaid || 0;
    const due = total - paid;

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans print:bg-white print:p-0">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none">
                {/* Actions Toolbar */}
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center print:hidden">
                    <h1 className="font-bold">Invoice #{booking.bookingNumber}</h1>
                    <div className="flex gap-2">
                        <button
                            // In real app, use window.print()
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold"
                        // onClick="window.print()" - Next.js server component limitation, handled via client wrapper or standard script
                        >
                            <Printer className="h-4 w-4" /> Print
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold">
                            <Download className="h-4 w-4" /> PDF
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="p-10" id="invoice-content">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{hotel.name}</h2>
                            <div className="text-gray-500 text-sm space-y-1">
                                <p>{hotel.contact?.address?.area}</p>
                                <p>{hotel.contact?.address?.city}, Bangladesh</p>
                                <p>Phone: {hotel.contact?.phone}</p>
                                <p>Email: {hotel.contact?.email}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold text-blue-600 uppercase tracking-wide mb-2">Invoice</h3>
                            <div className="text-gray-500 text-sm space-y-1">
                                <p>Date: <span className="font-semibold text-gray-900">{new Date(booking.createdAt).toLocaleDateString()}</span></p>
                                <p>Invoice #: <span className="font-semibold text-gray-900">INV-{booking.bookingNumber?.replace('BK-', '')}</span></p>
                                <p>Booking ID: <span className="font-semibold text-gray-900">{booking.bookingNumber}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Guest Info */}
                    <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Bill To:</h4>
                        <div className="text-gray-900 font-bold text-lg">{guest.name}</div>
                        <div className="text-gray-600">{guest.phone}</div>
                        <div className="text-gray-600">{guest.email}</div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 font-bold text-gray-600">Description</th>
                                <th className="text-center py-3 font-bold text-gray-600">Nights/Qty</th>
                                <th className="text-right py-3 font-bold text-gray-600">Rate</th>
                                <th className="text-right py-3 font-bold text-gray-600">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            <tr className="border-b border-gray-100">
                                <td className="py-4">
                                    <div className="font-bold">Room Charge</div>
                                    <div className="text-xs text-gray-400 text-sm">
                                        Check-in: {new Date(booking.checkIn).toLocaleDateString()}<br />
                                        Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="text-center py-4">{booking.nights} Night(s)</td>
                                <td className="text-right py-4">৳{booking.pricing?.roomCharges?.[0]?.price || 'N/A'}</td>
                                <td className="text-right py-4 font-semibold">৳{subtotal}</td>
                            </tr>
                            {/* Example Extra Item */}
                            {booking.posCharges?.map((charge: any, idx: number) => (
                                <tr key={idx} className="border-b border-gray-100">
                                    <td className="py-4">{charge.description || 'Restaurant/POS Charge'}</td>
                                    <td className="text-center py-4">1</td>
                                    <td className="text-right py-4">৳{charge.amount}</td>
                                    <td className="text-right py-4 font-semibold">৳{charge.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal:</span>
                                <span>৳{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (0%):</span>
                                <span>৳{tax}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Discount:</span>
                                <span>- ৳{booking.pricing?.discount || 0}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-blue-900 pt-4 border-t border-gray-200">
                                <span>Total:</span>
                                <span>৳{total}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 pt-2">
                                <span>Paid:</span>
                                <span className="font-semibold text-green-600">৳{paid}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Due:</span>
                                <span className={`font-semibold ${due > 0 ? 'text-red-600' : 'text-gray-900'}`}>৳{due}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-gray-400 text-sm pt-8 border-t border-gray-100">
                        <p className="mb-1">Thank you for staying with us!</p>
                        <p>{hotel.name} - {hotel.contact?.phone}</p>
                    </div>
                </div>
            </div>

            {/* Inline script to handle print button in server component without full client hydration overhead just for this one button */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    const printBtn = document.querySelector('button:first-child');
                    if(printBtn) printBtn.addEventListener('click', () => window.print());
                `
            }} />
        </div>
    );
}
