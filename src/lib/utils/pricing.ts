import { isFriday, isSaturday, isSameDay } from "date-fns";

export interface RoomPricing {
    basePrice: number;
    weekendPricing?: {
        enabled: boolean;
        price: number;
        days: number[];
    };
    specialRates?: {
        date: string | Date; // API might return string
        price: number;
    }[];
    seasonalPricing?: {
        startDate: string | Date;
        endDate: string | Date;
        price: number;
        isActive: boolean;
    }[];
}

export function getPriceForDate(room: RoomPricing, date: Date): { price: number; type: 'base' | 'weekend' | 'special' | 'seasonal' } {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // 1. Special Rate (Highest Priority)
    const special = room.specialRates?.find(s => isSameDay(new Date(s.date), targetDate));
    if (special) return { price: special.price, type: 'special' };

    // 2. Seasonal Pricing
    const seasonal = room.seasonalPricing?.find(s => {
        if (!s.isActive) return false;
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return targetDate >= start && targetDate <= end;
    });
    if (seasonal) return { price: seasonal.price, type: 'seasonal' };

    // 3. Weekend Pricing
    const dayOfWeek = targetDate.getDay(); // 0=Sun, ..., 5=Fri, 6=Sat
    const weekendDays = room.weekendPricing?.days || [5, 6]; // Default Fri, Sat
    const weekendEnabled = room.weekendPricing?.enabled ?? true;

    // Check if today is a weekend day
    if (weekendEnabled && weekendDays.includes(dayOfWeek)) {
        // Only trigger 'weekend' type if a specific weekend price is set different from base
        // Or if it's strictly defined as a surge. 
        // Logic: if price exists use it, else base.
        if (room.weekendPricing?.price) {
            return { price: room.weekendPricing.price, type: 'weekend' };
        }
    }

    // 4. Base Price
    return { price: room.basePrice || 0, type: 'base' };
}
