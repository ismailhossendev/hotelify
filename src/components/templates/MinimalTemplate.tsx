
"use client";

import { Inter } from "next/font/google";
import { MoveRight } from "lucide-react";
import { motion } from "framer-motion";

const inter = Inter({ subsets: ["latin"] });

// Reuse Types
import { HotelData, RoomData } from "@/types/room";

export default function MinimalTemplate({ hotel, rooms, onBook }: { hotel: HotelData, rooms: RoomData[], onBook: (room: RoomData) => void }) {
    return (
        <div className={`min-h-screen bg-white ${inter.className} text-stone-800`}>
            {/* Header */}
            <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
                <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-tight">{hotel.name}</h1>
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
                        <a href="#" className="hover:text-black transition-colors">Home</a>
                        <a href="#about" className="hover:text-black transition-colors">About</a>
                        <a href="#rooms" className="hover:text-black transition-colors">Rooms</a>
                    </nav>
                    <button className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        Reserve
                    </button>
                </div>
            </header>

            {/* Simple Hero */}
            <section className="pt-24 pb-16 px-6 relative overflow-hidden">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <span className="text-blue-600 font-medium text-sm mb-4 block tracking-wide">Welcome to {hotel.name}</span>
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.1]">
                            {hotel.config.hero.title}
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
                            {hotel.config.hero.subtitle}
                        </p>
                        <div className="flex gap-4">
                            <a href="#rooms" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2">
                                Check Availability <MoveRight size={18} />
                            </a>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 relative">
                        <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-xl rotate-3 hover:rotate-0 transition-all duration-500">
                            <img
                                src={hotel.config.hero.backgroundImage || hotel.coverImage}
                                alt="Hero"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Minimal Grid Rooms */}
            <section id="rooms" className="py-24 bg-gray-50 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Selected Rooms</h3>
                            <p className="text-gray-500">Choose the perfect space for you.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map(room => (
                            <motion.div
                                key={room.id}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
                                onClick={() => onBook(room)}
                            >
                                <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-4 relative">
                                    <img src={room.image || ""} alt={room.name} className="w-full h-full object-cover" />
                                    <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                                        ৳ {room.price}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg mb-1">{room.name}</h4>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{room.description}</p>
                                <button className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors">
                                    Book This Room
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>&copy; 2024 {hotel.name}. All rights reserved.</p>
                <div className="mt-4 flex justify-center gap-6">
                    <span className="text-gray-400">Simple · Clean · Fast</span>
                </div>
            </footer>
        </div>
    );
}
