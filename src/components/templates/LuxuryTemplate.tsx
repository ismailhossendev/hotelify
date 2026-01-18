
"use client";

import { Playfair_Display, Inter } from "next/font/google"; // Import here or pass as prop? Better to import if not passing.
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Loader2, X, CheckCircle, Calendar, User, Phone, Mail, MapPin, FileText, Plus, Users, Trash2 } from "lucide-react";

// Fonts (Usually configured in layout/page, but for component isolation we can use them or accept className props)
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

// Reuse Types (Should ideally be in a shared type file, but redefining for speed/isolation)
import { HotelData, RoomData } from "@/types/room";

// Internal Components (FadeUp, BookingModal - should probably be shared too but keeping self-contained for now)
const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

// ... BookingModal code is massive, let's export it from a shared place or duplicate it? 
// For now, I'll assume BookingModal is imported or I'll implement a lighter version here?
// No, the user needs the booking functionality.
// I will keep BookingModal in the main page or make it a separate component 'src/components/BookingModal.tsx'
// separate file is better.


export default function LuxuryTemplate({ hotel, rooms, onBook }: { hotel: HotelData, rooms: RoomData[], onBook: (room: RoomData) => void }) {
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);

    if (typeof window !== 'undefined') {
        window.addEventListener("scroll", () => setScrolled(window.scrollY > 50));
    }

    const primaryColor = hotel.config.colors.primary || '#1c1917';

    // Derived colors for UI
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    }
    const primaryRgb = hexToRgb(primaryColor);

    return (
        <div className={`min-h-screen bg-stone-50 ${inter.className} overflow-x-hidden`} style={{ '--primary': primaryColor, '--primary-rgb': primaryRgb } as any}>

            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <span className={`text-xl font-bold tracking-widest uppercase ${playfair.className} ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                        {hotel.name}
                    </span>
                    <div className={`hidden md:flex gap-8 text-sm font-medium tracking-wide ${scrolled ? 'text-gray-600' : 'text-white/90'}`}>
                        <a href="#" className="hover:opacity-75 transition-opacity">Home</a>
                        <a href="#about" className="hover:opacity-75 transition-opacity">Story</a>
                        <a href="#rooms" className="hover:opacity-75 transition-opacity">Suites</a>
                        <button
                            className={`px-5 py-2 -mt-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${scrolled
                                ? 'bg-gray-900 text-white hover:bg-gray-700'
                                : 'bg-white text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <div className="relative h-[110vh] -mt-20 overflow-hidden">
                <motion.div
                    style={{ y: y1 }}
                    className="absolute inset-0 z-0"
                >
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${hotel.config.hero.backgroundImage || hotel.coverImage})`
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-stone-50/90" />
                </motion.div>

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-20">
                    <FadeUp>
                        <span className="inline-block py-1 px-3 mb-6 border border-white/30 rounded-full text-white/80 text-xs uppercase tracking-[0.2em] backdrop-blur-sm">
                            Luxury Redefined
                        </span>
                    </FadeUp>
                    <FadeUp delay={0.2}>
                        <h1 className={`text-6xl md:text-8xl lg:text-9xl text-white mb-6 leading-tight ${playfair.className}`}>
                            {hotel.config.hero.title}
                        </h1>
                    </FadeUp>
                    <FadeUp delay={0.4}>
                        <p className={`text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto ${playfair.className} italic`}>
                            &mdash; {hotel.config.hero.subtitle} &mdash;
                        </p>
                    </FadeUp>

                    <FadeUp delay={0.6}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-12 w-20 h-20 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                        >
                            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        </motion.button>
                    </FadeUp>
                </div>
            </div>

            {/* About Section */}
            <section id="about" className="py-32 px-6 relative">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <FadeUp>
                        <div className="relative">
                            <div className="aspect-[3/4] rounded-sm overflow-hidden bg-stone-200">
                                <img
                                    src={hotel.gallery?.[0]?.url || hotel.coverImage}
                                    alt="About Hotel"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white p-4 hidden md:block shadow-2xl">
                                <span className={`block text-5xl text-gray-900 ${playfair.className}`}>5</span>
                                <span className="block text-gray-500 text-sm uppercase tracking-widest mt-2">Stars<br />Rating</span>
                            </div>
                        </div>
                    </FadeUp>

                    <FadeUp delay={0.2}>
                        <div>
                            <span className="text-stone-500 text-sm font-bold uppercase tracking-widest mb-4 block">Our Story</span>
                            <h2 className={`text-4xl md:text-5xl text-gray-900 mb-8 leading-tight ${playfair.className}`}>
                                {hotel.config.about.title}
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8 font-light">
                                {hotel.config.about.content}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {hotel.amenities.map((item, i) => (
                                    <span key={i} className="px-4 py-2 bg-stone-100 text-stone-600 text-xs uppercase tracking-wider rounded-sm">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* Rooms Section */}
            <section id="rooms" className="py-32 bg-white px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <FadeUp>
                            <span className="text-stone-500 text-sm font-bold uppercase tracking-widest mb-4 block">Accommodations</span>
                            <h2 className={`text-4xl md:text-6xl text-gray-900 leading-tight ${playfair.className}`}>
                                Stay with Us
                            </h2>
                        </FadeUp>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {rooms.map((room, i) => (
                            <FadeUp key={room.id} delay={i * 0.1}>
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="group cursor-pointer"
                                    onClick={() => onBook(room)}
                                >
                                    <div className="aspect-[4/3] overflow-hidden bg-stone-100 mb-6 relative">
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                                        <img
                                            src={room.image || ""}
                                            alt={room.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 right-4 z-20 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                                            {room.type}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl text-gray-900 mb-2 ${playfair.className}`}>
                                            {room.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 font-light">
                                            {room.description}
                                        </p>
                                        <div className="flex justify-between items-baseline border-t border-gray-100 pt-4 mb-4">
                                            <span className="text-sm text-gray-400">
                                                Sleeps {room.capacity.adults}
                                            </span>
                                            <span className="text-xl font-medium text-gray-900">
                                                ৳ {room.price.toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            className="w-full py-3 border border-stone-200 text-xs font-bold uppercase tracking-wider hover:bg-stone-900 hover:text-white transition-colors"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </motion.div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer / Contact */}
            <footer className="bg-stone-900 text-white py-24 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div>
                        <h4 className={`text-3xl mb-8 ${playfair.className}`}>{hotel.name}</h4>
                        <p className="text-stone-400 font-light leading-relaxed">
                            Experience the pinnacle of luxury and hospitality.
                            Your perfect getaway awaits.
                        </p>
                    </div>
                    <div>
                        <h5 className="text-sm font-bold uppercase tracking-widest mb-8 text-stone-500">Contact</h5>
                        <ul className="space-y-4 text-stone-300 font-light">
                            <li>{hotel.config.contact.address || "Main Street"}</li>
                            <li>{hotel.config.contact.email}</li>
                            <li>{hotel.config.contact.phone}</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-sm font-bold uppercase tracking-widest mb-8 text-stone-500">Newsletter</h5>
                        <div className="flex border-b border-white/20 pb-4">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="bg-transparent w-full outline-none text-white placeholder-stone-600 font-light"
                            />
                            <button className="text-xs uppercase tracking-wider font-bold hover:text-stone-300">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/10 flex justify-between text-xs text-stone-500 uppercase tracking-widest">
                    <p>&copy; 2024 {hotel.name}</p>
                    <p>Powered by Hotelify</p>
                </div>
            </footer>
        </div>
    );
}
