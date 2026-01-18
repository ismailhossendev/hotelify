
import { notFound } from "next/navigation";
import { headers } from "next/headers";

// Force no caching for now to ensure real-time updates
export const dynamic = "force-dynamic";

async function getHotelData(slug: string) {
    // Identify protocol (in dev it's http, prod https)
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

    const apiUrl = `${protocol}://${domain}/api/public/hotels/${slug}`;
    console.log(`[_sites] Fetching hotel data from: ${apiUrl}`);

    try {
        const res = await fetch(apiUrl, {
            cache: "no-store",
        });

        console.log(`[_sites] Response status: ${res.status}`);

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch data');
        }

        const data = await res.json();
        console.log(`[_sites] Hotel found: ${data.hotel?.name}`);
        return data.hotel;
    } catch (error) {
        console.error(`[_sites] Fetch error:`, error);
        return null;
    }
}

export default async function SitePage({ params }: { params: { site: string } }) {
    const data = await getHotelData(params.site);

    if (!data) {
        notFound();
    }

    // Basic styling for verification
    return (
        <div
            style={{
                fontFamily: 'sans-serif',
                minHeight: '100vh',
                '--primary': data.config.colors.primary,
                '--secondary': data.config.colors.secondary
            } as React.CSSProperties}
        >
            {/* Debug Info Bar */}
            <div className="bg-gray-900 text-white p-2 text-xs font-mono text-center">
                Debugging: {data.name} | Template: {data.template?.name || 'None'} | Slug: {params.site}
            </div>

            {/* Hero Section */}
            <div
                className="h-[60vh] flex items-center justify-center text-center text-white relative bg-cover bg-center"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${data.config.hero.backgroundImage || data.coverImage})`,
                    backgroundColor: 'var(--secondary)' // Fallback
                }}
            >
                <div className="p-8 max-w-4xl">
                    <h1 className="text-5xl font-bold mb-4">{data.config.hero.title}</h1>
                    <p className="text-2xl opacity-90">{data.config.hero.subtitle}</p>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto py-16 px-4">
                {/* About */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--primary)' }}>{data.config.about.title}</h2>
                    <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
                        {data.config.about.content}
                    </p>
                </div>

                {/* Rooms (Core Data) */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--primary)' }}>Our Rooms</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Mock Room Cards since we didn't fetch room details in public API yet, let's fix that next */}
                        <div className="p-6 border rounded-lg bg-gray-50 text-center text-gray-500 italic">
                            Room data fetching needs to be added to public API.
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-gray-100 p-8 rounded-xl">
                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                    <p><strong>Address:</strong> {data.config.contact.address || data.contact.address.city}</p>
                    <p><strong>Phone:</strong> {data.config.contact.phone || data.contact.phone}</p>
                    <p><strong>Email:</strong> {data.config.contact.email || data.contact.email}</p>
                </div>
            </div>
        </div>
    );
}
