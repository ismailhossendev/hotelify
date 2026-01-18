
"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isFriday, isSaturday, isSameDay, startOfYear, endOfYear, eachMonthOfInterval, addMonths, subMonths, addYears, subYears, setMonth, getYear } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingManagerPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // UI State
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [specialPriceInput, setSpecialPriceInput] = useState("");

    // Form State
    const [basePrice, setBasePrice] = useState(0);
    const [weekendPrice, setWeekendPrice] = useState(0);
    const [weekendEnabled, setWeekendEnabled] = useState(true);

    useEffect(() => {
        fetch(`/api/rooms/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const r = data.room;
                    setRoom(r);
                    setBasePrice(r.basePrice);
                    setWeekendPrice(r.weekendPricing?.price || r.basePrice);
                    setWeekendEnabled(r.weekendPricing?.enabled ?? true);
                }
                setLoading(false);
            });
    }, [params.id]);

    const days = useMemo(() => {
        return eachDayOfInterval({
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth)
        });
    }, [currentMonth]);

    const getPriceForDate = (date: Date) => {
        if (!room) return { price: 0, type: 'loading' };

        // 1. Special Rate
        const special = room.specialRates?.find((s: any) => isSameDay(new Date(s.date), date));
        if (special) return { price: special.price, type: 'special' };

        // 2. Weekend (Fri/Sat by default)
        const isWeekend = isFriday(date) || isSaturday(date);
        if (weekendEnabled && isWeekend) return { price: weekendPrice, type: 'weekend' };

        // 3. Base
        return { price: basePrice, type: 'base' };
    };

    const handleSaveGlobal = async () => {
        setSaving(true);
        await fetch(`/api/rooms/${params.id}/pricing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                basePrice,
                weekendPricing: {
                    enabled: weekendEnabled,
                    price: weekendPrice,
                    days: [5, 6] // Fri, Sat
                }
            })
        });
        setSaving(false);
        // Refresh local state logic would go here
        alert('Pricing Updated!');
    };

    const handleSetSpecialRate = async () => {
        if (!selectedDate || !specialPriceInput) return;

        const newRate = { date: selectedDate, price: parseInt(specialPriceInput), note: 'Manual Override' };
        const updatedSpecialRates = [...(room.specialRates || []), newRate];

        await fetch(`/api/rooms/${params.id}/pricing`, {
            method: 'POST',
            body: JSON.stringify({ specialRates: updatedSpecialRates })
        });

        setRoom({ ...room, specialRates: updatedSpecialRates });
        setSelectedDate(null);
        setSpecialPriceInput("");
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Pricing Manager: {room.name}</h1>
                    <p className="text-gray-500">Set dynamic rates for seasons and weekends</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Visual Calendar */}
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">

                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-4 items-center">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-3 py-1 rounded text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                >
                                    Month
                                </button>
                                <button
                                    onClick={() => setViewMode('year')}
                                    className={`px-3 py-1 rounded text-sm font-bold transition-all ${viewMode === 'year' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                >
                                    Year
                                </button>
                            </div>
                            <h2 className="font-bold text-lg">
                                {viewMode === 'month' ? format(currentMonth, 'MMMM yyyy') : format(currentMonth, 'yyyy')}
                            </h2>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentMonth(prev => viewMode === 'month' ? subMonths(prev, 1) : subYears(prev, 1))}
                                className="p-2 border rounded-lg hover:bg-gray-50"
                            >
                                ←
                            </button>
                            <button
                                onClick={() => setCurrentMonth(prev => viewMode === 'month' ? addMonths(prev, 1) : addYears(prev, 1))}
                                className="p-2 border rounded-lg hover:bg-gray-50"
                            >
                                →
                            </button>
                        </div>
                    </div>

                    {viewMode === 'year' ? (
                        <div className="grid grid-cols-3 gap-6">
                            {eachMonthOfInterval({ start: startOfYear(currentMonth), end: endOfYear(currentMonth) }).map((monthDate) => (
                                <div
                                    key={monthDate.toString()}
                                    className="border rounded-xl p-3 hover:border-blue-300 cursor-pointer transition-colors"
                                    onClick={() => { setCurrentMonth(monthDate); setViewMode('month'); }}
                                >
                                    <h3 className="font-bold text-center text-sm mb-2">{format(monthDate, 'MMMM')}</h3>
                                    <div className="grid grid-cols-7 gap-0.5 text-[0.6rem] text-center text-gray-400 mb-1">
                                        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div className="text-red-300">F</div><div className="text-red-300">S</div>
                                    </div>
                                    <div className="grid grid-cols-7 gap-0.5">
                                        {Array.from({ length: startOfMonth(monthDate).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
                                        {eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) }).map((day) => {
                                            const { type } = getPriceForDate(day);
                                            let colorClass = 'bg-gray-100 text-gray-400';
                                            if (type === 'special') colorClass = 'bg-purple-500 text-white';
                                            else if (type === 'weekend') colorClass = 'bg-orange-400 text-white';
                                            else if (type === 'base') colorClass = 'bg-blue-50 text-blue-900';

                                            return (
                                                <div key={day.toString()} className={`aspect-square flex items-center justify-center rounded-[2px] text-[0.6rem] ${colorClass}`}>
                                                    {format(day, 'd')}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-bold text-gray-400">
                                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div>
                                <div className="text-red-400">Fri</div>
                                <div className="text-red-400">Sat</div>
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {/* Empty cells for start of month */}
                                {Array.from({ length: days[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}

                                {days.map((date, i) => {
                                    const { price, type } = getPriceForDate(date);
                                    const isWeekend = type === 'weekend';
                                    const isSpecial = type === 'special';

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedDate(date)}
                                            className={`
                                                p-2 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 active:scale-95
                                                ${isSpecial ? 'bg-purple-100 border-purple-300 ring-2 ring-purple-200' : ''}
                                                ${isWeekend ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}
                                                ${isSameDay(date, new Date()) ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                                                ${isSameDay(date, selectedDate || new Date(0)) ? 'ring-2 ring-black ring-offset-1' : ''}
                                            `}
                                        >
                                            <div className={`text-xs mb-1 ${isWeekend ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                                {format(date, 'd')}
                                            </div>
                                            <div className={`text-sm font-bold ${isSpecial ? 'text-purple-700' : isWeekend ? 'text-orange-700' : 'text-gray-700'}`}>
                                                ৳{price}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className="mt-6 flex gap-6 text-sm">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white border border-gray-200"></div> Regular</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-orange-50 border border-orange-200"></div> Weekend</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div> Special Rate</div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Save className="h-5 w-5" /> Base Rules</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Base Price (Global)</label>
                                <input
                                    type="number"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-700">Weekend Surge</label>
                                    <input
                                        type="checkbox"
                                        checked={weekendEnabled}
                                        onChange={(e) => setWeekendEnabled(e.target.checked)}
                                        className="h-5 w-5 text-blue-600 rounded"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mb-2">Applies to Friday & Saturday</p>
                                <input
                                    type="number"
                                    value={weekendPrice}
                                    disabled={!weekendEnabled}
                                    onChange={(e) => setWeekendPrice(parseInt(e.target.value))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
                                />
                            </div>

                            <button
                                onClick={handleSaveGlobal}
                                disabled={saving}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                {saving ? "Saving..." : "Save Default Rates"}
                            </button>
                        </div>
                    </div>

                    {/* Selected Date Editor */}
                    {selectedDate && (
                        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 animate-in slide-in-from-right">
                            <h3 className="font-bold mb-2 text-purple-900">Set Rate for {format(selectedDate, 'MMM d')}</h3>
                            <p className="text-xs text-purple-700 mb-4">Override base & weekend rates for this specific date.</p>

                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="New Price"
                                    className="flex-1 border border-purple-200 rounded-lg px-3 py-2"
                                    value={specialPriceInput}
                                    onChange={(e) => setSpecialPriceInput(e.target.value)}
                                />
                                <button
                                    onClick={handleSetSpecialRate}
                                    className="bg-purple-600 text-white px-4 rounded-lg font-bold hover:bg-purple-700"
                                >Set</button>
                            </div>
                            <button onClick={() => setSelectedDate(null)} className="text-xs text-center w-full mt-2 text-gray-500 hover:underline">Cancel</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
