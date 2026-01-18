"use client";

import * as React from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek, addDays } from "date-fns";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Dropdown primitives for Popover behavior
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = DropdownMenuPrimitive.Content;


interface DatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({ date, setDate, placeholder = "Pick a date", className }: DatePickerProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    // Generate days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    // Create matrix of days
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleSelectDate = (day: Date) => {
        setDate(day);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className={cn("cursor-pointer flex items-center gap-2", className)}>
                    <span className={cn("text-lg font-medium outline-none bg-transparent whitespace-nowrap", !date && "text-white/50")}>
                        {date ? format(date, "MMM dd, yyyy") : placeholder}
                    </span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 w-72 p-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl text-white mt-2" align="start">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-white/10 rounded-full transition"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="font-bold text-lg">{format(currentMonth, "MMMM yyyy")}</span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-white/10 rounded-full transition"><ChevronRight className="w-5 h-5" /></button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 mb-2 text-center">
                    {weekDays.map(day => (
                        <div key={day} className="text-xs font-bold text-white/50 uppercase">{day}</div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1 text-center">
                    {calendarDays.map((day, i) => {
                        const isSelected = date && isSameDay(day, date);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isCurrentDay = isToday(day);

                        return (
                            <button
                                key={i}
                                onClick={() => handleSelectDate(day)}
                                disabled={!isCurrentMonth} // simplify interactions for now, or just dim them
                                className={cn(
                                    "h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all",
                                    !isCurrentMonth && "text-white/20 opacity-50 cursor-default",
                                    isCurrentMonth && "hover:bg-white/10 cursor-pointer",
                                    isSelected && "bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-[0_0_10px_rgba(37,99,235,0.5)]",
                                    isCurrentDay && !isSelected && "border border-blue-500 text-blue-400"
                                )}
                            >
                                {format(day, "d")}
                            </button>
                        );
                    })}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
