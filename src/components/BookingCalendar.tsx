
"use client";

import { useMemo, useState } from 'react';
import { addDays, format, differenceInDays, startOfDay, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, User, AlertCircle } from 'lucide-react';

interface BookingCalendarProps {
    bookings: any[];
    rooms: any[];      // Room Types
    units: any[];      // Room Units (Physical Rooms)
}

export default function BookingCalendar({ bookings, rooms, units }: BookingCalendarProps) {
    const [startDate, setStartDate] = useState(startOfDay(new Date()));
    const daysToShow = 14;

    // Generate Date Headers
    const dateHeaders = useMemo(() => {
        return Array.from({ length: daysToShow }).map((_, i) => addDays(startDate, i));
    }, [startDate]);

    const nextWeek = () => setStartDate(addDays(startDate, 7));
    const prevWeek = () => setStartDate(addDays(startDate, -7));

    // Group Units by Room Type for display
    const rows = useMemo(() => {
        const result: any[] = [];

        rooms.forEach(type => {
            // Find all physical units for this type
            const typeUnits = units.filter(u => u.roomTypeId === type._id || u.roomTypeId?._id === type._id);

            // Add Header Row for the Type
            result.push({ type: 'header', data: type });

            // Add Unit Rows
            typeUnits.forEach(unit => {
                result.push({ type: 'unit', data: unit, parentType: type });
            });

            // Add "Unassigned" Row for bookings of this type but no unit assigned
            result.push({ type: 'unassigned', data: { _id: `unassigned-${type._id}`, name: 'Unassigned', roomTypeId: type._id }, parentType: type });
        });

        return result;
    }, [rooms, units]);

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Toolbar */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-lg text-gray-700">
                        {format(startDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex bg-white rounded-lg border shadow-sm">
                        <button onClick={prevWeek} className="p-2 hover:bg-gray-100 border-r"><ChevronLeft className="h-4 w-4" /></button>
                        <button onClick={() => setStartDate(startOfDay(new Date()))} className="px-4 text-sm font-medium hover:bg-gray-100">Today</button>
                        <button onClick={nextWeek} className="p-2 hover:bg-gray-100 border-l"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-200 rounded-sm"></div> Confirmed</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-200 rounded-sm"></div> Unassigned</div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto relative">
                <div className="min-w-[1200px]">

                    {/* Header Row */}
                    <div className="grid grid-cols-[250px_repeat(14,1fr)] sticky top-0 bg-white z-10 border-b shadow-sm">
                        <div className="p-3 font-bold text-gray-500 border-r bg-gray-50">Room / Unit</div>
                        {dateHeaders.map((date, i) => (
                            <div key={i} className={`p-2 text-center border-r border-gray-100 ${isSameDay(date, new Date()) ? 'bg-blue-50' : ''}`}>
                                <div className="text-xs font-medium text-gray-500">{format(date, 'EEE')}</div>
                                <div className={`font-bold ${isSameDay(date, new Date()) ? 'text-blue-600' : 'text-gray-700'}`}>{format(date, 'd')}</div>
                            </div>
                        ))}
                    </div>

                    {/* Timeline Rows */}
                    <div className="divide-y">
                        {rows.map((row, idx) => {
                            if (row.type === 'header') return (
                                <div key={`header-${row.data._id}`} className="grid grid-cols-[250px_repeat(14,1fr)] bg-gray-100 border-b">
                                    <div className="p-2 px-4 font-bold text-gray-800 col-span-full flex items-center gap-2">
                                        {row.data.name}
                                        <span className="text-xs font-normal bg-white px-2 py-0.5 rounded border text-gray-500">{row.data.totalRooms || 0} Rooms</span>
                                    </div>
                                </div>
                            );

                            const isUnassigned = row.type === 'unassigned';
                            const unitId = row.data._id;
                            const typeId = row.parentType._id;

                            return (
                                <div key={unitId} className={`grid grid-cols-[250px_repeat(14,1fr)] group hover:bg-gray-50 transition-colors relative h-16 ${isUnassigned ? 'bg-stripes-gray' : ''}`}>
                                    {/* Row Label */}
                                    <div className="p-3 border-r bg-white sticky left-0 z-10 border-b-0 flex items-center justify-between group-hover:bg-gray-50">
                                        <div className="flex items-center gap-2">
                                            {isUnassigned ? (
                                                <div className="h-8 w-8 rounded bg-red-50 flex items-center justify-center text-red-500"><AlertCircle className="h-4 w-4" /></div>
                                            ) : (
                                                <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center font-bold text-blue-700 text-sm">{row.data.roomNo}</div>
                                            )}
                                            <div className="text-sm font-medium text-gray-700">
                                                {isUnassigned ? 'Requires Assignment' : row.data.floor || '1st Floor'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grid Lines */}
                                    {dateHeaders.map((_, i) => (
                                        <div key={i} className="border-r border-gray-100 h-full"></div>
                                    ))}

                                    {/* Bookings */}
                                    {bookings.filter(b => {
                                        // Match Logic:
                                        // If this is a Unit Row: Match bookings with this roomUnitId
                                        // If this is Unassigned Row: Match bookings with NO roomUnitId BUT matching roomId (Type)
                                        if (isUnassigned) {
                                            return (!b.roomUnitId) && (b.roomId?._id === typeId || b.roomId === typeId);
                                        }
                                        return b.roomUnitId === unitId || b.roomUnitId?._id === unitId;
                                    }).map(booking => {
                                        const checkIn = new Date(booking.checkIn);
                                        const checkOut = new Date(booking.checkOut);

                                        const diffStart = differenceInDays(checkIn, startDate);
                                        const duration = differenceInDays(checkOut, checkIn);

                                        if (diffStart + duration < 0 || diffStart >= daysToShow) return null;

                                        const startCol = Math.max(0, diffStart);
                                        const endCol = Math.min(daysToShow, diffStart + duration);
                                        const span = endCol - startCol;
                                        if (span <= 0) return null;

                                        const gridColumnStart = startCol + 2;
                                        const gridColumnEnd = `span ${span}`;

                                        const statusColors: any = {
                                            confirmed: 'bg-green-100 text-green-800 border-green-200',
                                            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                            checked_in: 'bg-blue-100 text-blue-800 border-blue-200',
                                        };

                                        return (
                                            <div
                                                key={booking._id}
                                                style={{ gridColumn: `${gridColumnStart} / ${gridColumnEnd}` }}
                                                className={`absolute top-2 bottom-2 left-1 right-1 rounded-lg border px-2 py-1 flex items-center gap-2 text-xs font-semibold shadow-sm cursor-pointer z-0 overflow-hidden whitespace-nowrap 
                                                    ${isUnassigned ? 'bg-red-100 border-red-300 animate-pulse' : (statusColors[booking.status] || 'bg-gray-100')}
                                                `}
                                                title={`Guest: ${booking.guestDetails?.name}`}
                                                onClick={() => window.location.href = `/bookings/${booking._id}`}
                                            >
                                                <User className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{booking.guestDetails?.name || 'Guest'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
