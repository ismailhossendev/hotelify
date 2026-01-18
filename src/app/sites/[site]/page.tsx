
"use client";

import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";

// Components
import BookingModal from "@/components/BookingModal";
import LuxuryTemplate from "@/components/templates/LuxuryTemplate";
import MinimalTemplate from "@/components/templates/MinimalTemplate";
import ForestRetreatTemplate from "@/components/templates/ForestRetreatTemplate";

// Types
import { HotelData, RoomData } from "@/types/room";

export default function SitePage({ params }: { params: { site: string } }) {
    const [hotel, setHotel] = useState<HotelData | null>(null);
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const hRes = await fetch(`/api/public/hotels/${params.site}`);
                if (!hRes.ok) throw new Error("Hotel not found");
                const hData = await hRes.json();
                setHotel(hData.hotel);

                if (hData.hotel) {
                    const rRes = await fetch(`/api/public/rooms/${hData.hotel.id}`);
                    if (rRes.ok) {
                        const rData = await rRes.json();
                        setRooms(rData.rooms || []);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.site]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-stone-50">
            <Loader2 className="animate-spin h-8 w-8 text-stone-400" />
        </div>
    );

    if (!hotel) return notFound();

    const renderTemplate = () => {
        const templateName = hotel.template?.name || "Urban Luxury";

        // Map DB Template names to Components
        if (templateName === "Modern Coastal" || templateName === "Boutique Classic") {
            return <MinimalTemplate hotel={hotel} rooms={rooms} onBook={setSelectedRoom} />;
        }

        if (templateName === "Forest Lodge" || templateName === "Eco Retreat") {
            return <ForestRetreatTemplate hotel={hotel} rooms={rooms} onBook={setSelectedRoom} />;
        }

        if (templateName === "Forest Retreat") {
            return <ForestRetreatTemplate hotel={hotel} rooms={rooms} onBook={setSelectedRoom} />;
        }

        // Default to Luxury (Urban Luxury, Eco Retreat)
        return <LuxuryTemplate hotel={hotel} rooms={rooms} onBook={setSelectedRoom} />;
    };

    return (
        <>
            <AnimatePresence>
                {selectedRoom && (
                    <BookingModal
                        room={selectedRoom}
                        hotelId={hotel.id}
                        onClose={() => setSelectedRoom(null)}
                    />
                )}
            </AnimatePresence>
            {renderTemplate()}
        </>
    );
}
