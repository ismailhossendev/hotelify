export interface RoomData {
    id: string;
    name: string;
    type?: string;
    price: number;
    capacity: { adults: number; children: number };
    description: string;
    amenities: string[];
    image: string | null;
    images?: { url: string }[];
}

export interface HotelData {
    id: string;
    name: string;
    slug?: string;
    contact: { phone: string; email: string; address: string } | any;
    coverImage: string;
    gallery?: { url: string }[];
    amenities: string[];
    config: {
        hero: { title: string; subtitle: string; backgroundImage: string };
        about: { title: string; content: string };
        contact: { phone: string; email: string; address: string; googleMapUrl?: string };
        colors: { primary: string; secondary: string };
        gallery: string[];
    };
    template?: { id: string; name: string } | null;
}
