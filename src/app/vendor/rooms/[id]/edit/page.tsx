
import { notFound } from "next/navigation";
import dbConnect from "@/lib/db/connect";
import { Room } from "@/lib/db/models/Room";
import RoomTypeForm from "@/components/RoomTypeForm";

async function getRoom(id: string) {
    await dbConnect();
    const room = await Room.findById(id);
    if (!room) return null;
    return JSON.parse(JSON.stringify(room));
}

export default async function EditRoomPage({ params }: { params: { id: string } }) {
    const room = await getRoom(params.id);
    if (!room) notFound();

    return (
        <div className="py-8">
            <RoomTypeForm mode="edit" initialData={room} />
        </div>
    );
}
